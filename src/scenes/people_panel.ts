// ASCEND — People Panel (task 2.1: constellation map)
// Default view: constellation SVG map. List view retained as accessibility alternative.
// Tier-1 NPC orbit: player at centre, NPCs spaced evenly on a circle.
// Edge weight (thickness + opacity) scales with relationship score.
// Node radius scales with score. Band colour = ring + fill-opacity glow.

import { loadTier1Npcs } from '../data';
import type { NpcDefinition } from '../data';
import { loadState } from '../utils/storage';
import { router } from '../core/router';

// ─────────────────────────────────────────────
// NPC COLOUR MAP  (visual identity per character)
// ─────────────────────────────────────────────

const NPC_COLORS: Record<string, string> = {
  dana_sutcliffe: '#7C6FAF',
  zara_okafor:   '#4B6070',
  leo_chen:      '#3A7D6B',
  grace_oduya:   '#7A5A3C',
  conrad_mensah: '#6B4E71',
  sofia:         '#2A6A8A',
};

// Inter-NPC relationship edges (Tier 1 — hardcoded from NPC bible)
const NPC_EDGES: { from: string; to: string; label: 'Cordial' | 'Friction' }[] = [
  { from: 'grace_oduya',   to: 'conrad_mensah', label: 'Cordial'  },
  { from: 'grace_oduya',   to: 'sofia',         label: 'Friction' },
];

// ─────────────────────────────────────────────
// BAND SYSTEM
// ─────────────────────────────────────────────

type Band = 'cold' | 'functional' | 'warm' | 'trusted';

function getBand(score: number): Band {
  if (score >= 75) return 'trusted';
  if (score >= 50) return 'warm';
  if (score >= 30) return 'functional';
  return 'cold';
}

const BAND_LABEL: Record<Band, string> = {
  cold: 'Cold', functional: 'Functional', warm: 'Warm', trusted: 'Trusted',
};

const BAND_HEX: Record<Band, string> = {
  cold:       '#4B5563',
  functional: '#6B7280',
  warm:       '',    // resolved from CSS var at runtime
  trusted:    '',    // resolved from CSS var at runtime
};

function bandHex(band: Band): string {
  if (band === 'warm' || band === 'trusted') {
    const varName = band === 'warm' ? '--color-gold-400' : '--color-accent-default';
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#aaa';
  }
  return BAND_HEX[band];
}

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────

type ViewKey  = 'constellation' | 'list';
type SortKey  = 'score' | 'name';

interface PanelState {
  npcs:     NpcDefinition[];
  scores:   Record<string, number>;
  view:     ViewKey;
  sort:     SortKey;
  selected: string | null;
}

let _container: HTMLElement | null = null;
let _panel: PanelState = { npcs: [], scores: {}, view: 'constellation', sort: 'score', selected: null };

// ─────────────────────────────────────────────
// MOUNT / UNMOUNT
// ─────────────────────────────────────────────

export async function mountPeoplePanel(container: HTMLElement): Promise<void> {
  _container = container;
  _panel = { npcs: [], scores: {}, view: 'constellation', sort: 'score', selected: null };
  injectStyles();

  const state = loadState();
  if (!state) {
    container.innerHTML = `<div class="pp-error">No save found.<button onclick="history.back()">← Back</button></div>`;
    return;
  }

  try {
    const npcs   = await loadTier1Npcs();
    const scores: Record<string, number> = {};
    for (const npc of npcs) {
      scores[npc.id] = state.npcRelationships[npc.id] ?? npc.startingRelationshipBase ?? 50;
    }
    _panel = { ..._panel, npcs, scores };
  } catch (err) {
    console.error('[ASCEND] People panel: failed to load NPCs', err);
  }

  renderPanel();

  // Keyboard: Escape closes panel
  function onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') router.push('decision');
  }
  document.addEventListener('keydown', onKeyDown);
  (_container as HTMLElement & { _ppKeyDown?: typeof onKeyDown })._ppKeyDown = onKeyDown;
}

export function unmountPeoplePanel(): void {
  document.getElementById('pp-styles')?.remove();
  const stored = (_container as (HTMLElement & { _ppKeyDown?: (e: KeyboardEvent) => void }) | null);
  if (stored?._ppKeyDown) document.removeEventListener('keydown', stored._ppKeyDown);
  _container = null;
}

// Legacy signatures
export async function mount(container: HTMLElement): Promise<void> { await mountPeoplePanel(container); }
export function unmount(): void { unmountPeoplePanel(); }

// ─────────────────────────────────────────────
// PANEL SHELL
// ─────────────────────────────────────────────

function renderPanel(): void {
  if (!_container) return;
  const { view, sort, npcs } = _panel;

  _container.innerHTML = `
<aside class="pp-panel" role="complementary" aria-label="People panel">

  <div class="pp-header">
    <span class="pp-title">People</span>
    <div class="pp-header-right">
      <div class="pp-view-toggle" role="group" aria-label="View mode">
        <button class="pp-view-btn ${view === 'list' ? 'active' : ''}" id="pp-view-list"
                aria-pressed="${view === 'list'}" aria-label="List view">LIST</button>
        <button class="pp-view-btn ${view === 'constellation' ? 'active' : ''}" id="pp-view-map"
                aria-pressed="${view === 'constellation'}" aria-label="Constellation map">MAP</button>
      </div>
      <button class="pp-close" id="pp-close" aria-label="Close panel">✕</button>
    </div>
  </div>

  ${view === 'list' ? `
  <div class="pp-sort-bar" id="pp-sort-bar">
    <span class="pp-sort-label">Sort</span>
    <div class="pp-sort-pills">
      <button class="pp-sort-pill ${sort === 'score' ? 'active' : ''}" data-sort="score"
              aria-pressed="${sort === 'score'}">Relationship</button>
      <button class="pp-sort-pill ${sort === 'name'  ? 'active' : ''}" data-sort="name"
              aria-pressed="${sort === 'name'}">Name</button>
    </div>
  </div>` : ''}

  <div class="pp-body" id="pp-body">
    ${view === 'list'          ? listView()          : constellationView()}
  </div>

  <div class="pp-footer">
    <span class="pp-footer-note">${npcs.length} CONTACTS · YEAR 1</span>
  </div>

</aside>`;

  wirePanel();

  if (view === 'constellation') {
    requestAnimationFrame(() => drawConstellation());
  } else {
    requestAnimationFrame(() => animateBars());
  }
}

// ─────────────────────────────────────────────
// LIST VIEW
// ─────────────────────────────────────────────

function sortedNpcs(): NpcDefinition[] {
  const { npcs, scores, sort } = _panel;
  return [...npcs].sort((a, b) =>
    sort === 'name'
      ? a.name.localeCompare(b.name)
      : (scores[b.id] ?? 50) - (scores[a.id] ?? 50)
  );
}

function listView(): string {
  const ordered = sortedNpcs();
  return `
<ul class="pp-list" role="list">
  ${ordered.map(npc => npcRow(npc)).join('')}
</ul>`;
}

function npcRow(npc: NpcDefinition): string {
  const score     = _panel.scores[npc.id] ?? 50;
  const band      = getBand(score);
  const color     = NPC_COLORS[npc.id] ?? '#555';
  const initials  = npc.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2);
  const isSelected = _panel.selected === npc.id;

  return `
<li class="pp-npc-row band-${band} ${isSelected ? 'selected' : ''}" data-id="${npc.id}" role="listitem">
  <div class="pp-avatar" style="background:${color}">${initials}</div>
  <div class="pp-npc-info">
    <div class="pp-npc-name-row">
      <span class="pp-npc-name">${npc.name}</span>
      <span class="pp-npc-role-tag">${npc.ladderTitle}</span>
    </div>
    <div class="pp-rel-wrap">
      <div class="pp-rel-track">
        <div class="pp-rel-fill" data-target="${score}"></div>
      </div>
      <span class="pp-score">${score}</span>
    </div>
    <div class="pp-archetype">${npc.archetype}</div>
  </div>
  <span class="pp-band-badge">${BAND_LABEL[band]}</span>
</li>
${isSelected ? detailCard(npc, score, band, color, initials) : ''}`;
}

function detailCard(npc: NpcDefinition, score: number, band: Band, color: string, initials: string): string {
  return `
<li class="pp-detail visible" role="listitem" aria-live="polite">
  <div class="pp-detail-header">
    <div class="pp-detail-avatar" style="background:${color}">${initials}</div>
    <div class="pp-detail-meta">
      <div class="pp-detail-name">${npc.name}</div>
      <div class="pp-detail-role">${npc.ladderTitle} · ${BAND_LABEL[band]}</div>
    </div>
  </div>
  <p class="pp-detail-bio">${npc.publicRole}</p>
  <div class="pp-detail-chips">
    <span class="pp-chip pp-chip--arch">${npc.archetype}</span>
    <span class="pp-chip pp-chip--band pp-chip--${band}">${BAND_LABEL[band]}</span>
  </div>
  <p class="pp-detail-contradiction">${npc.contradiction}</p>
</li>`;
}

// ─────────────────────────────────────────────
// CONSTELLATION VIEW (HTML shell — SVG drawn after mount)
// ─────────────────────────────────────────────

function constellationView(): string {
  return `
<div class="pp-constellation" id="pp-constellation">
  <div class="pp-svg-wrap" id="pp-svg-wrap">
    <svg id="pp-svg" viewBox="0 0 340 340" xmlns="http://www.w3.org/2000/svg"
         role="img" aria-label="Relationship constellation map">
      <g id="pp-edges"></g>
      <g id="pp-player"></g>
      <g id="pp-nodes"></g>
    </svg>
    <div class="pp-tooltip" id="pp-tooltip" role="tooltip">
      <div class="pp-tt-name" id="pp-tt-name"></div>
      <div class="pp-tt-score" id="pp-tt-score"></div>
    </div>
  </div>
  <div class="pp-const-legend">
    <div class="pp-legend-item"><div class="pp-legend-dot" style="background:#4B5563"></div>Cold</div>
    <div class="pp-legend-item"><div class="pp-legend-dot" style="background:#6B7280"></div>Functional</div>
    <div class="pp-legend-item"><div class="pp-legend-dot pp-legend-dot--warm"></div>Warm</div>
    <div class="pp-legend-item"><div class="pp-legend-dot pp-legend-dot--trusted"></div>Trusted</div>
  </div>
  <div id="pp-const-detail"></div>
</div>`;
}

function drawConstellation(): void {
  const svg = document.getElementById('pp-svg') as SVGSVGElement | null;
  if (!svg || !_panel.npcs.length) return;

  const W = 340, H = 340, cx = W / 2, cy = H / 2, R = 108;
  const { npcs, scores } = _panel;

  // Positions: evenly around circle, starting top
  const positions = npcs.map((npc, i) => {
    const angle = (i / npcs.length) * 2 * Math.PI - Math.PI / 2;
    return { id: npc.id, x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) };
  });
  const posMap = Object.fromEntries(positions.map(p => [p.id, p]));

  // ── Edges: player → NPC
  const edgesEl = document.getElementById('pp-edges')!;
  edgesEl.innerHTML = '';

  for (const npc of npcs) {
    const pos   = posMap[npc.id];
    if (!pos) continue;
    const score = scores[npc.id] ?? 50;
    const band  = getBand(score);
    const opacity  = 0.12 + (score / 100) * 0.55;
    const strokeW  = 0.5 + (score / 100) * 2.5;
    const dash     = band === 'functional' ? '3 4' : '';
    const line = makeSvgEl('line');
    line.setAttribute('x1', String(cx)); line.setAttribute('y1', String(cy));
    line.setAttribute('x2', String(pos.x)); line.setAttribute('y2', String(pos.y));
    line.setAttribute('stroke', bandHex(band));
    line.setAttribute('stroke-width', String(strokeW));
    line.setAttribute('stroke-opacity', String(opacity));
    if (dash) line.setAttribute('stroke-dasharray', dash);
    edgesEl.appendChild(line);
  }

  // ── Edges: inter-NPC
  for (const edge of NPC_EDGES) {
    const a = posMap[edge.from], b = posMap[edge.to];
    if (!a || !b) continue;
    const color = edge.label === 'Friction' ? '#C75B39' : '#6B7280';
    const line = makeSvgEl('line');
    line.setAttribute('x1', String(a.x)); line.setAttribute('y1', String(a.y));
    line.setAttribute('x2', String(b.x)); line.setAttribute('y2', String(b.y));
    line.setAttribute('stroke', color); line.setAttribute('stroke-width', '1');
    line.setAttribute('stroke-opacity', '0.35'); line.setAttribute('stroke-dasharray', '4 5');
    edgesEl.appendChild(line);

    // Edge label
    const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
    const txt = makeSvgEl('text');
    txt.setAttribute('x', String(midX)); txt.setAttribute('y', String(midY - 4));
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-family', 'JetBrains Mono, monospace');
    txt.setAttribute('font-size', '7');
    txt.setAttribute('fill', color); txt.setAttribute('fill-opacity', '0.65');
    txt.textContent = edge.label.toUpperCase();
    edgesEl.appendChild(txt);
  }

  // ── Player node
  const playerEl = document.getElementById('pp-player')!;
  playerEl.innerHTML = '';
  const pc = makeSvgEl('circle');
  pc.setAttribute('cx', String(cx)); pc.setAttribute('cy', String(cy)); pc.setAttribute('r', '18');
  pc.setAttribute('fill', 'var(--color-surface-overlay)');
  pc.setAttribute('stroke', 'var(--color-text-primary)'); pc.setAttribute('stroke-width', '1.5');
  const pt = makeSvgEl('text');
  pt.setAttribute('x', String(cx)); pt.setAttribute('y', String(cy));
  pt.setAttribute('text-anchor', 'middle'); pt.setAttribute('dominant-baseline', 'middle');
  pt.setAttribute('font-family', 'Inter, sans-serif'); pt.setAttribute('font-size', '9');
  pt.setAttribute('font-weight', '600'); pt.setAttribute('fill', 'var(--color-text-primary)');
  pt.textContent = 'YOU';
  playerEl.appendChild(pc); playerEl.appendChild(pt);

  // ── NPC nodes
  const nodesEl = document.getElementById('pp-nodes')!;
  nodesEl.innerHTML = '';
  const tooltip   = document.getElementById('pp-tooltip')!;
  const ttName    = document.getElementById('pp-tt-name')!;
  const ttScore   = document.getElementById('pp-tt-score')!;
  const svgWrap   = document.getElementById('pp-svg-wrap')!;

  positions.forEach((pos, i) => {
    const npc     = npcs[i]!;
    const score   = scores[npc.id] ?? 50;
    const band    = getBand(score);
    const nodeR   = 14 + (score / 100) * 8;
    const color   = NPC_COLORS[npc.id] ?? '#555';
    const bColor  = bandHex(band);
    const initials = npc.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2);

    const g = makeSvgEl('g');
    g.style.cursor = 'pointer';
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', `${npc.name} — ${BAND_LABEL[band]}, score ${score}`);
    g.setAttribute('tabindex', '0');

    const circle = makeSvgEl('circle');
    circle.setAttribute('cx', String(pos.x)); circle.setAttribute('cy', String(pos.y));
    circle.setAttribute('r', String(nodeR));
    circle.setAttribute('fill', color); circle.setAttribute('fill-opacity', '0.88');
    circle.setAttribute('stroke', bColor); circle.setAttribute('stroke-width', '2');

    const init = makeSvgEl('text');
    init.setAttribute('x', String(pos.x)); init.setAttribute('y', String(pos.y));
    init.setAttribute('text-anchor', 'middle'); init.setAttribute('dominant-baseline', 'middle');
    init.setAttribute('font-family', 'Inter, sans-serif'); init.setAttribute('font-size', '9');
    init.setAttribute('font-weight', '600'); init.setAttribute('fill', '#F4F1EA');
    init.textContent = initials;

    const nameY  = pos.y + nodeR + 13;
    const nameEl = makeSvgEl('text');
    nameEl.setAttribute('x', String(pos.x)); nameEl.setAttribute('y', String(nameY));
    nameEl.setAttribute('text-anchor', 'middle');
    nameEl.setAttribute('font-family', 'Inter, sans-serif'); nameEl.setAttribute('font-size', '9');
    nameEl.setAttribute('fill', 'var(--color-text-muted)');
    nameEl.textContent = npc.name.split(' ')[0]!;

    g.appendChild(circle); g.appendChild(init); g.appendChild(nameEl);

    // Hover tooltip
    g.addEventListener('mouseenter', () => {
      ttName.textContent  = npc.name;
      ttScore.textContent = `${BAND_LABEL[band]} · ${score}`;
      tooltip.classList.add('visible');
    });
    g.addEventListener('mousemove', (e: Event) => {
      const me   = e as MouseEvent;
      const rect = svgWrap.getBoundingClientRect();
      tooltip.style.left = `${me.clientX - rect.left + 12}px`;
      tooltip.style.top  = `${me.clientY - rect.top  - 10}px`;
    });
    g.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));

    // Click → detail card
    const handleClick = () => selectConstellationNpc(npc);
    g.addEventListener('click', handleClick);
    g.addEventListener('keydown', (e: Event) => {
      if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
        e.preventDefault();
        handleClick();
      }
    });

    nodesEl.appendChild(g);
  });
}

function selectConstellationNpc(npc: NpcDefinition): void {
  const score    = _panel.scores[npc.id] ?? 50;
  const band     = getBand(score);
  const color    = NPC_COLORS[npc.id] ?? '#555';
  const initials = npc.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2);

  const detailEl = document.getElementById('pp-const-detail');
  if (!detailEl) return;

  if (_panel.selected === npc.id) {
    _panel = { ..._panel, selected: null };
    detailEl.innerHTML = '';
    return;
  }

  _panel = { ..._panel, selected: npc.id };
  detailEl.innerHTML = `
<div class="pp-const-card">
  <div class="pp-detail-header">
    <div class="pp-detail-avatar" style="background:${color}">${initials}</div>
    <div class="pp-detail-meta">
      <div class="pp-detail-name">${npc.name}</div>
      <div class="pp-detail-role">${npc.ladderTitle} · ${BAND_LABEL[band]}</div>
    </div>
    <button class="pp-const-card-close" id="pp-card-close" aria-label="Close detail">✕</button>
  </div>
  <p class="pp-detail-bio">${npc.publicRole}</p>
  <div class="pp-detail-chips">
    <span class="pp-chip pp-chip--arch">${npc.archetype}</span>
    <span class="pp-chip pp-chip--band pp-chip--${band}">${BAND_LABEL[band]}</span>
  </div>
  <p class="pp-detail-contradiction">${npc.contradiction}</p>
</div>`;

  document.getElementById('pp-card-close')?.addEventListener('click', () => {
    _panel = { ..._panel, selected: null };
    detailEl.innerHTML = '';
  });
}

// ─────────────────────────────────────────────
// WIRE EVENTS
// ─────────────────────────────────────────────

function wirePanel(): void {
  document.getElementById('pp-close')?.addEventListener('click', () => router.push('decision'));

  document.getElementById('pp-view-list')?.addEventListener('click', () => {
    _panel = { ..._panel, view: 'list', selected: null };
    renderPanel();
  });
  document.getElementById('pp-view-map')?.addEventListener('click', () => {
    _panel = { ..._panel, view: 'constellation', selected: null };
    renderPanel();
  });

  document.querySelectorAll<HTMLButtonElement>('.pp-sort-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      _panel = { ..._panel, sort: btn.dataset['sort'] as SortKey };
      renderPanel();
    });
  });

  document.querySelectorAll<HTMLLIElement>('.pp-npc-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.dataset['id']!;
      _panel = { ..._panel, selected: _panel.selected === id ? null : id };
      renderPanel();
    });
  });
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function animateBars(): void {
  document.querySelectorAll<HTMLElement>('.pp-rel-fill').forEach(el => {
    const target = el.dataset['target'] ?? '50';
    setTimeout(() => { el.style.width = `${target}%`; }, 60);
  });
}

function makeSvgEl(tag: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', tag) as SVGElement;
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

function injectStyles(): void {
  if (document.getElementById('pp-styles')) return;
  const style = document.createElement('style');
  style.id = 'pp-styles';
  style.textContent = `
    /* ── Panel shell ────────────────────────── */
    .pp-panel {
      position: fixed; top: 0; right: 0; bottom: 0;
      width: 380px;
      background: var(--color-surface-raised);
      border-left: 1px solid var(--color-border-subtle);
      display: flex; flex-direction: column;
      z-index: 100;
      animation: pp-slide-in 220ms var(--ease-default) both;
    }
    @keyframes pp-slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);   opacity: 1; }
    }
    @media (max-width: 600px) {
      .pp-panel { width: 100%; border-left: none; }
    }

    .pp-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--space-4) var(--space-5);
      border-bottom: 1px solid var(--color-border-subtle);
      flex-shrink: 0;
    }
    .pp-title {
      font-family: var(--font-ui); font-size: var(--text-sm);
      font-weight: var(--weight-semibold); color: var(--color-text-primary);
      letter-spacing: var(--tracking-wide); text-transform: uppercase;
    }
    .pp-header-right { display: flex; align-items: center; gap: var(--space-2); }

    /* View toggle */
    .pp-view-toggle {
      display: flex; border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-sm); overflow: hidden;
    }
    .pp-view-btn {
      background: none; border: none; border-right: 1px solid var(--color-border-subtle);
      color: var(--color-text-muted); cursor: pointer;
      padding: var(--space-1) var(--space-3);
      font-family: var(--font-mono); font-size: var(--text-xs);
      transition: all var(--transition-fast);
    }
    .pp-view-btn:last-child { border-right: none; }
    .pp-view-btn.active {
      background: color-mix(in srgb, var(--color-accent-default) 18%, transparent);
      color: var(--color-accent-default);
    }
    .pp-view-btn:hover:not(.active) {
      background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
      color: var(--color-text-secondary);
    }

    .pp-close {
      background: none; border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-sm); color: var(--color-text-secondary);
      cursor: pointer; padding: var(--space-1) var(--space-2);
      font-size: var(--text-xs); transition: all var(--transition-fast);
    }
    .pp-close:hover { border-color: var(--color-border-strong); color: var(--color-text-primary); }

    /* Sort bar */
    .pp-sort-bar {
      display: flex; align-items: center; gap: var(--space-2);
      padding: var(--space-3) var(--space-5);
      border-bottom: 1px solid var(--color-border-subtle); flex-shrink: 0;
    }
    .pp-sort-label {
      font-family: var(--font-mono); font-size: var(--text-xs);
      color: var(--color-text-muted); letter-spacing: var(--tracking-wide);
      text-transform: uppercase; white-space: nowrap;
    }
    .pp-sort-pills { display: flex; gap: var(--space-1); }
    .pp-sort-pill {
      background: none; border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-full); color: var(--color-text-muted);
      cursor: pointer; padding: 2px var(--space-3);
      font-family: var(--font-mono); font-size: 10px;
      letter-spacing: var(--tracking-wide); transition: all var(--transition-fast);
    }
    .pp-sort-pill.active {
      border-color: var(--color-accent-default); color: var(--color-accent-default);
      background: color-mix(in srgb, var(--color-accent-default) 12%, transparent);
    }
    .pp-sort-pill:hover:not(.active) { border-color: var(--color-border-default); color: var(--color-text-secondary); }

    /* Body + footer */
    .pp-body {
      flex: 1; overflow-y: auto; overflow-x: hidden;
      scrollbar-width: thin; scrollbar-color: var(--color-border-subtle) transparent;
    }
    .pp-footer {
      padding: var(--space-3) var(--space-5);
      border-top: 1px solid var(--color-border-subtle); flex-shrink: 0;
    }
    .pp-footer-note {
      font-family: var(--font-mono); font-size: var(--text-xs);
      color: var(--color-text-muted); letter-spacing: var(--tracking-wide); text-align: center;
    }

    /* ── List view ──────────────────────────── */
    .pp-list { padding: var(--space-3) 0; list-style: none; }

    .pp-npc-row {
      display: flex; align-items: center; gap: var(--space-3);
      padding: var(--space-3) var(--space-5); cursor: pointer;
      transition: background var(--transition-fast); position: relative;
    }
    .pp-npc-row:hover { background: color-mix(in srgb, var(--color-text-primary) 4%, transparent); }
    .pp-npc-row.selected { background: color-mix(in srgb, var(--color-accent-default) 8%, transparent); }
    .pp-npc-row.selected::before {
      content: ''; position: absolute; left: 0; top: 0; bottom: 0;
      width: 2px; background: var(--color-accent-default);
    }

    .pp-avatar {
      width: 40px; height: 40px; border-radius: var(--radius-full); flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-ui); font-size: var(--text-sm);
      font-weight: var(--weight-semibold); color: var(--color-surface-base);
      position: relative;
    }
    .pp-avatar::after {
      content: ''; position: absolute; inset: -2px;
      border-radius: var(--radius-full); border: 2px solid;
    }
    .band-cold .pp-avatar::after     { border-color: #4B5563; }
    .band-functional .pp-avatar::after { border-color: #6B7280; }
    .band-warm .pp-avatar::after     { border-color: var(--color-gold-400); }
    .band-trusted .pp-avatar::after  { border-color: var(--color-accent-default); }

    .pp-npc-info { flex: 1; min-width: 0; }
    .pp-npc-name-row { display: flex; align-items: baseline; gap: var(--space-2); margin-bottom: 2px; }
    .pp-npc-name {
      font-family: var(--font-ui); font-size: var(--text-sm);
      font-weight: var(--weight-medium); color: var(--color-text-primary);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .pp-npc-role-tag {
      font-family: var(--font-mono); font-size: 9px;
      letter-spacing: var(--tracking-widest); text-transform: uppercase;
      color: var(--color-text-muted); white-space: nowrap; flex-shrink: 0;
    }
    .pp-rel-wrap { display: flex; align-items: center; gap: var(--space-2); margin-bottom: 3px; }
    .pp-rel-track { flex: 1; height: 3px; background: var(--color-border-subtle); border-radius: var(--radius-full); overflow: hidden; }
    .pp-rel-fill { height: 100%; border-radius: var(--radius-full); width: 0; transition: width 500ms var(--ease-default); }
    .band-cold .pp-rel-fill     { background: #4B5563; }
    .band-functional .pp-rel-fill { background: #6B7280; }
    .band-warm .pp-rel-fill     { background: var(--color-gold-400); }
    .band-trusted .pp-rel-fill  { background: var(--color-accent-default); }
    .pp-score { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-text-muted); min-width: 24px; text-align: right; }
    .pp-archetype { font-family: var(--font-narrative); font-size: var(--text-xs); font-style: italic; color: var(--color-text-muted); }
    .pp-band-badge {
      flex-shrink: 0; font-family: var(--font-mono); font-size: 9px;
      letter-spacing: var(--tracking-widest); text-transform: uppercase;
      padding: 3px var(--space-2); border-radius: var(--radius-sm); border: 1px solid;
    }
    .band-cold .pp-band-badge     { color: #6B7280; border-color: #374151; background: #1F2937; }
    .band-functional .pp-band-badge { color: #9CA3AF; border-color: #4B5563; background: color-mix(in srgb, #6B7280 10%, transparent); }
    .band-warm .pp-band-badge     { color: var(--color-gold-400); border-color: color-mix(in srgb, var(--color-gold-400) 30%, transparent); background: color-mix(in srgb, var(--color-gold-400) 8%, transparent); }
    .band-trusted .pp-band-badge  { color: var(--color-accent-default); border-color: color-mix(in srgb, var(--color-accent-default) 30%, transparent); background: color-mix(in srgb, var(--color-accent-default) 8%, transparent); }

    /* Detail card (list view — inline) */
    .pp-detail {
      display: none; margin: 0 var(--space-5) var(--space-3);
      padding: var(--space-4); background: var(--color-surface-overlay);
      border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md);
      animation: pp-detail-in 180ms var(--ease-default) both;
    }
    .pp-detail.visible { display: block; }
    @keyframes pp-detail-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

    /* ── Constellation view ──────────────────── */
    .pp-constellation { display: flex; flex-direction: column; height: 100%; }
    .pp-svg-wrap { flex: 1; position: relative; min-height: 0; }
    #pp-svg { width: 100%; height: 100%; display: block; }

    .pp-tooltip {
      position: absolute; background: var(--color-surface-overlay);
      border: 1px solid var(--color-border-default); border-radius: var(--radius-sm);
      padding: var(--space-2) var(--space-3); font-family: var(--font-ui);
      font-size: var(--text-xs); color: var(--color-text-primary);
      pointer-events: none; opacity: 0; transition: opacity var(--transition-fast);
      white-space: nowrap; z-index: 10;
    }
    .pp-tooltip.visible { opacity: 1; }
    .pp-tt-name { font-weight: var(--weight-semibold); margin-bottom: 2px; }
    .pp-tt-score { font-family: var(--font-mono); color: var(--color-text-muted); }

    .pp-const-legend {
      display: flex; gap: var(--space-4); flex-wrap: wrap;
      padding: var(--space-3) var(--space-5);
      border-top: 1px solid var(--color-border-subtle); flex-shrink: 0;
    }
    .pp-legend-item {
      display: flex; align-items: center; gap: var(--space-2);
      font-family: var(--font-mono); font-size: 10px;
      color: var(--color-text-muted); letter-spacing: var(--tracking-wide); text-transform: uppercase;
    }
    .pp-legend-dot { width: 8px; height: 8px; border-radius: var(--radius-full); flex-shrink: 0; }
    .pp-legend-dot--warm    { background: var(--color-gold-400); }
    .pp-legend-dot--trusted { background: var(--color-accent-default); }

    /* Constellation detail card */
    .pp-const-card {
      margin: var(--space-3) var(--space-5) var(--space-2);
      padding: var(--space-4); background: var(--color-surface-overlay);
      border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md);
      animation: pp-detail-in 180ms var(--ease-default) both;
    }
    .pp-const-card-close {
      background: none; border: none; color: var(--color-text-muted);
      cursor: pointer; font-size: var(--text-sm); padding: 0 var(--space-1);
      line-height: 1; margin-left: auto;
    }
    .pp-const-card-close:hover { color: var(--color-text-primary); }

    /* Detail card shared elements */
    .pp-detail-header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); }
    .pp-detail-avatar {
      width: 44px; height: 44px; border-radius: var(--radius-full); flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-ui); font-size: var(--text-sm);
      font-weight: var(--weight-semibold); color: var(--color-surface-base);
    }
    .pp-detail-name { font-family: var(--font-ui); font-size: var(--text-md); font-weight: var(--weight-semibold); color: var(--color-text-primary); }
    .pp-detail-role { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-text-muted); letter-spacing: var(--tracking-wide); }
    .pp-detail-meta { flex: 1; min-width: 0; }
    .pp-detail-bio {
      font-family: var(--font-narrative); font-size: var(--text-sm); font-style: italic;
      color: var(--color-text-secondary); line-height: var(--leading-relaxed);
      margin-bottom: var(--space-3); padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--color-border-subtle);
    }
    .pp-detail-chips { display: flex; gap: var(--space-2); margin-bottom: var(--space-3); flex-wrap: wrap; }
    .pp-chip {
      font-family: var(--font-mono); font-size: 9px; letter-spacing: var(--tracking-widest);
      text-transform: uppercase; padding: 3px var(--space-2);
      border-radius: var(--radius-sm); border: 1px solid;
    }
    .pp-chip--arch { color: var(--color-text-muted); border-color: var(--color-border-subtle); background: transparent; }
    .pp-chip--cold     { color: #6B7280; border-color: #374151; background: #1F2937; }
    .pp-chip--functional { color: #9CA3AF; border-color: #4B5563; }
    .pp-chip--warm     { color: var(--color-gold-400); border-color: color-mix(in srgb, var(--color-gold-400) 30%, transparent); background: color-mix(in srgb, var(--color-gold-400) 8%, transparent); }
    .pp-chip--trusted  { color: var(--color-accent-default); border-color: color-mix(in srgb, var(--color-accent-default) 30%, transparent); background: color-mix(in srgb, var(--color-accent-default) 8%, transparent); }
    .pp-detail-contradiction {
      font-family: var(--font-narrative); font-size: var(--text-xs);
      color: var(--color-text-muted); font-style: italic;
      border-left: 2px solid var(--color-border-subtle);
      padding-left: var(--space-3); line-height: var(--leading-relaxed);
    }

    .pp-error {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 100%; gap: var(--space-4); font-family: var(--font-mono);
      color: var(--color-text-muted);
    }
  `;
  document.head.appendChild(style);
}
