import { defineConfig, type Plugin } from 'vite';
import { readdirSync, readFileSync } from 'fs';
import { join, relative } from 'path';

// ─────────────────────────────────────────────
// BUILD-TIME DATA VALIDATOR PLUGIN
// Runs on buildStart (production) and configureServer (dev watch).
// Throws with a clear error message if any content file is invalid.
// Iron rule: every question option must have ≥1 gain and ≥1 cost.
// ─────────────────────────────────────────────

function validateDataPlugin(): Plugin {
  const dataDir = join(process.cwd(), 'data');

  function validateAll(): void {
    const errors: string[] = [];

    // ── Questions ──
    const questionsDir = join(dataDir, 'questions');
    const yearDirs = readdirSync(questionsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const yearDir of yearDirs) {
      const files = readdirSync(join(questionsDir, yearDir), { withFileTypes: true })
        .filter(f => f.isFile() && f.name.endsWith('.json'))
        .map(f => f.name);

      for (const file of files) {
        const src = relative(process.cwd(), join(questionsDir, yearDir, file));
        try {
          const raw = readFileSync(join(questionsDir, yearDir, file), 'utf8');
          const q   = JSON.parse(raw) as Record<string, unknown>;
          checkQuestion(q, src, errors);
        } catch (e) {
          if (e && typeof e === 'object' && 'code' in e) {
            errors.push(`${src}: could not read file`);
          } else {
            errors.push(`${src}: ${String(e)}`);
          }
        }
      }
    }

    // ── NPCs ──
    const npcsDir = join(dataDir, 'npcs');
    const tierDirs = readdirSync(npcsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    for (const tierDir of tierDirs) {
      const files = readdirSync(join(npcsDir, tierDir), { withFileTypes: true })
        .filter(f => f.isFile() && f.name.endsWith('.json'))
        .map(f => f.name);
      for (const file of files) {
        const src = relative(process.cwd(), join(npcsDir, tierDir, file));
        try {
          const raw = readFileSync(join(npcsDir, tierDir, file), 'utf8');
          const npc = JSON.parse(raw) as Record<string, unknown>;
          checkRequired(npc, ['id', 'name', 'archetype', 'arcBeats'], src, errors);
        } catch (e) {
          errors.push(`${src}: ${String(e)}`);
        }
      }
    }

    // ── Backgrounds ──
    checkJsonFile(join(dataDir, 'backgrounds.json'), data => {
      const f = data as Record<string, unknown>;
      if (!Array.isArray(f['backgrounds'])) return 'missing "backgrounds" array';
      for (const bg of f['backgrounds'] as Record<string, unknown>[]) {
        if (!bg['id'] || !bg['name']) return `background missing id or name`;
        if (!Array.isArray(bg['primaryBonuses'])) return `${String(bg['id'])}: missing primaryBonuses`;
      }
      return null;
    }, 'data/backgrounds.json', errors);

    // ── Traits ──
    checkJsonFile(join(dataDir, 'traits.json'), data => {
      const f = data as Record<string, unknown>;
      if (!Array.isArray(f['traits'])) return 'missing "traits" array';
      for (const t of f['traits'] as Record<string, unknown>[]) {
        if (!t['id'] || !t['displayText']) return `trait missing id or displayText`;
      }
      return null;
    }, 'data/traits.json', errors);

    // ── Review Rules ──
    checkJsonFile(join(dataDir, 'review-rules.json'), data => {
      const r = data as Record<string, unknown>;
      if (!r['formula'] || typeof r['formula'] !== 'object') return 'missing "formula"';
      return null;
    }, 'data/review-rules.json', errors);

    if (errors.length > 0) {
      throw new Error(
        `\n\n[ASCEND] Content validation failed — ${errors.length} error(s):\n\n` +
        errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n') +
        '\n'
      );
    }

    console.log(`[ASCEND] Content validation passed.`);
  }

  return {
    name: 'ascend-validate-data',
    buildStart() { validateAll(); },
    configureServer(server) {
      // Run once on dev server start
      try { validateAll(); } catch (e) { console.error(String(e)); }
      // Watch data/ for changes
      server.watcher.add(dataDir);
      server.watcher.on('change', path => {
        if (path.includes('data/') || path.includes('data\\')) {
          try { validateAll(); } catch (e) { console.error(String(e)); }
        }
      });
    },
  };
}

// ─────────────────────────────────────────────
// VALIDATION HELPERS (Node-side, no imports from src/)
// ─────────────────────────────────────────────

function checkRequired(
  obj: Record<string, unknown>,
  keys: string[],
  src: string,
  errors: string[],
): void {
  for (const k of keys) {
    if (obj[k] === undefined || obj[k] === null || obj[k] === '') {
      errors.push(`${src}: missing required field "${k}"`);
    }
  }
}

function checkQuestion(
  q: Record<string, unknown>,
  src: string,
  errors: string[],
): void {
  checkRequired(q, ['id', 'year', 'setup', 'options'], src, errors);

  if (!Array.isArray(q['options'])) {
    errors.push(`${src}: "options" must be an array`);
    return;
  }

  const options = q['options'] as Record<string, unknown>[];
  if (options.length !== 4) {
    errors.push(`${src}: expected 4 options, got ${options.length}`);
  }

  for (const opt of options) {
    const optId = String(opt['id'] ?? '?');
    if (!Array.isArray(opt['statDeltas'])) {
      errors.push(`${src} option ${optId}: "statDeltas" must be an array`);
      continue;
    }
    const deltas = opt['statDeltas'] as Record<string, unknown>[];
    const gains  = deltas.filter(d => typeof d['delta'] === 'number' && (d['delta'] as number) > 0);
    const costs  = deltas.filter(d => typeof d['delta'] === 'number' && (d['delta'] as number) < 0);

    if (gains.length === 0) {
      errors.push(`${src} option ${optId}: Iron rule — no positive statDelta (gain required)`);
    }
    if (costs.length === 0) {
      errors.push(`${src} option ${optId}: Iron rule — no negative statDelta (cost required)`);
    }
    if (!opt['innerMonologue']) {
      errors.push(`${src} option ${optId}: missing "innerMonologue"`);
    }
  }
}

function checkJsonFile(
  filePath: string,
  check: (data: unknown) => string | null,
  label: string,
  errors: string[],
): void {
  try {
    const raw  = readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    const err  = check(data);
    if (err) errors.push(`${label}: ${err}`);
  } catch (e) {
    errors.push(`${label}: ${String(e)}`);
  }
}

// ─────────────────────────────────────────────
// VITE CONFIG
// ─────────────────────────────────────────────

export default defineConfig({
  // GitHub Pages base: matches repo name yanisnastos-max/corp
  base: '/corp/',

  plugins: [
    validateDataPlugin(),
  ],

  build: {
    outDir:     'dist',
    emptyOutDir: true,
  },

  server: {
    port: 5173,
    open: true,
  },
});
