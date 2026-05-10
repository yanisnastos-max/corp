// ASCEND — Scene: Design System
// Task 1.2. Reachable at /#design-system in dev.
// Shows: palette · type scale · semantic roles · motion · spacing.

export function mountDesignSystem(container: HTMLElement): void {
  injectStyles();
  container.innerHTML = buildPage();
  wireToggle();
  wireMotionDemos();
}

// ─────────────────────────────────────────────
// TOGGLE
// ─────────────────────────────────────────────
function wireToggle(): void {
  const btn = document.getElementById('ds-theme-toggle');
  if (!btn) return;
  updateToggleLabel(btn);
  btn.addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    updateToggleLabel(btn);
  });
}

function updateToggleLabel(btn: HTMLElement): void {
  const current = document.documentElement.getAttribute('data-theme') ?? 'dark';
  btn.textContent = current === 'dark' ? 'Switch to Light' : 'Switch to Dark';
}

// ─────────────────────────────────────────────
// MOTION DEMOS
// ─────────────────────────────────────────────
function wireMotionDemos(): void {
  document.querySelectorAll<HTMLElement>('.ds-motion-demo').forEach(demo => {
    const dot = demo.querySelector<HTMLElement>('.ds-motion-dot');
    if (!dot) return;
    demo.addEventListener('click', () => {
      dot.style.transform = 'translateX(0)';
      dot.style.opacity = '1';
      dot.getBoundingClientRect(); // force reflow
      const duration = demo.dataset['duration'] ?? '160ms';
      const easing   = demo.dataset['easing']   ?? 'cubic-bezier(0.4,0,0.2,1)';
      dot.style.transition = `transform ${duration} ${easing}, opacity ${duration} ${easing}`;
      dot.style.transform  = 'translateX(160px)';
      dot.style.opacity    = '0.2';
    });
  });
}

// ─────────────────────────────────────────────
// PAGE BUILD
// ─────────────────────────────────────────────
function buildPage(): string {
  return `
<div class="ds-wrap">
  <header class="ds-header">
    <div>
      <span class="ds-eyebrow">ASCEND</span>
      <h1 class="ds-title">Design System</h1>
      <p class="ds-subtitle">v0.13 · tokens.css · task 1.2</p>
    </div>
    <button id="ds-theme-toggle" class="ds-toggle">Switch to Light</button>
  </header>

  ${section('Palette — Semantic', palette())}
  ${section('Palette — Raw', rawPalette())}
  ${section('Typography — Type Scale', typeScale())}
  ${section('Typography — Semantic Roles', semanticRoles())}
  ${section('Motion', motion())}
  ${section('Spacing', spacing())}
  ${section('Radius', radii())}
  ${section('Shadows', shadows())}
</div>
  `.trim();
}

function section(title: string, body: string): string {
  return `
<section class="ds-section">
  <h2 class="ds-section-title">${title}</h2>
  ${body}
</section>`;
}

// ─────────────────────────────────────────────
// PALETTE — SEMANTIC
// ─────────────────────────────────────────────
function palette(): string {
  const groups: Array<{ label: string; vars: string[] }> = [
    { label: 'Surfaces', vars: ['--color-surface-base','--color-surface-raised','--color-surface-overlay','--color-surface-card','--color-surface-input'] },
    { label: 'Text', vars: ['--color-text-primary','--color-text-secondary','--color-text-muted','--color-text-disabled','--color-text-accent','--color-text-gold','--color-text-link'] },
    { label: 'Borders', vars: ['--color-border-subtle','--color-border-default','--color-border-strong','--color-border-accent'] },
    { label: 'Accent', vars: ['--color-accent-default','--color-accent-hover','--color-accent-active','--color-accent-subtle'] },
    { label: 'Status', vars: ['--color-status-positive','--color-status-warning','--color-status-negative','--color-status-neutral'] },
    { label: 'Special', vars: ['--color-focus','--color-scrim'] },
  ];

  return groups.map(g => `
<div class="ds-swatch-group">
  <p class="ds-swatch-group-label">${g.label}</p>
  <div class="ds-swatch-row">
    ${g.vars.map(v => `
    <div class="ds-swatch">
      <div class="ds-swatch-chip" style="background:var(${v});border:1px solid var(--color-border-subtle)"></div>
      <span class="ds-swatch-name">${v.replace('--color-','')}</span>
    </div>`).join('')}
  </div>
</div>`).join('');
}

// ─────────────────────────────────────────────
// PALETTE — RAW
// ─────────────────────────────────────────────
function rawPalette(): string {
  const scales: Array<{ name: string; vars: string[] }> = [
    { name: 'Slate', vars: ['--slate-950','--slate-900','--slate-800','--slate-700','--slate-600','--slate-500'] },
    { name: 'Pearl', vars: ['--pearl-50','--pearl-100','--pearl-200','--pearl-300'] },
    { name: 'Oxide', vars: ['--oxide-300','--oxide-400','--oxide-500','--oxide-600','--oxide-700'] },
    { name: 'Gold',  vars: ['--gold-300','--gold-400','--gold-500','--gold-600','--gold-700'] },
    { name: 'Graphite', vars: ['--graphite-300','--graphite-400','--graphite-500','--graphite-600'] },
  ];

  return scales.map(s => `
<div class="ds-swatch-group">
  <p class="ds-swatch-group-label">${s.name}</p>
  <div class="ds-swatch-row">
    ${s.vars.map(v => `
    <div class="ds-swatch">
      <div class="ds-swatch-chip" style="background:var(${v})"></div>
      <span class="ds-swatch-name">${v.replace(/--[a-z]+-/,'')}</span>
    </div>`).join('')}
  </div>
</div>`).join('');
}

// ─────────────────────────────────────────────
// TYPE SCALE
// ─────────────────────────────────────────────
function typeScale(): string {
  const sizes = [
    { token: '--text-5xl', label: '5xl · 60px' },
    { token: '--text-4xl', label: '4xl · 48px' },
    { token: '--text-3xl', label: '3xl · 36px' },
    { token: '--text-2xl', label: '2xl · 30px' },
    { token: '--text-xl',  label: 'xl · 24px' },
    { token: '--text-lg',  label: 'lg · 20px' },
    { token: '--text-md',  label: 'md · 18px' },
    { token: '--text-base',label: 'base · 16px' },
    { token: '--text-sm',  label: 'sm · 13px' },
    { token: '--text-xs',  label: 'xs · 11px' },
    { token: '--text-2xs', label: '2xs · 10px' },
  ];

  const families: Array<{ name: string; family: string; specimen: string }> = [
    { name: 'Inter (UI)', family: 'var(--font-ui)', specimen: 'AUREL London — Strategic Clarity' },
    { name: 'Source Serif 4 (Narrative)', family: 'var(--font-narrative)', specimen: 'You took the long view. It cost you everything.' },
    { name: 'JetBrains Mono (Data)', family: 'var(--font-mono)', specimen: 'exec_discipline: 74 · reputation: 61' },
  ];

  return `
<div class="ds-type-families">
  ${families.map(f => `
  <div class="ds-type-family">
    <p class="ds-label">${f.name}</p>
    ${sizes.map(s => `
    <div class="ds-type-row">
      <span class="ds-type-token">${s.label}</span>
      <span style="font-family:${f.family};font-size:var(${s.token});line-height:1.2;color:var(--color-text-primary)">${f.specimen}</span>
    </div>`).join('')}
  </div>`).join('')}
</div>`;
}

// ─────────────────────────────────────────────
// SEMANTIC ROLES
// ─────────────────────────────────────────────
function semanticRoles(): string {
  const roles: Array<{ cls: string; label: string; text: string }> = [
    { cls: 't-question-setup',   label: '.t-question-setup',   text: 'Dana drops the file on your desk at 6:52pm. “You’ve got until morning.” The option she isn’t naming is letting it fail.' },
    { cls: 't-question-option',  label: '.t-question-option',  text: 'Ask for the original brief. If she’s changed scope without documentation, that’s her problem, not yours.' },
    { cls: 't-inner-monologue',  label: '.t-inner-monologue',  text: 'She’s testing whether you’ll absorb chaos silently.' },
    { cls: 't-npc-dialogue',     label: '.t-npc-dialogue',     text: '“I’m not asking for a favour,” Dana says. “I’m asking for your job.”' },
    { cls: 't-ui-heading',       label: '.t-ui-heading',       text: 'Year 1 · Q3 of 10' },
    { cls: 't-ui-body',          label: '.t-ui-body',          text: 'Your decisions are recorded. Some will surface years from now in rooms you haven’t entered yet.' },
    { cls: 't-ui-label',         label: '.t-ui-label',         text: 'Execution Discipline' },
    { cls: 't-stat-value',       label: '.t-stat-value',       text: 'exec_discipline: 74 / 100' },
    { cls: 't-consequence-tag',  label: '.t-consequence-tag',  text: 'seen_by_sponsor · high_cost_high_fidelity' },
    { cls: 't-first-day-letter', label: '.t-first-day-letter', text: 'Welcome to AUREL London. You are L1. Everything you do from this moment is observed, remembered, and filed.' },
  ];

  return `
<div class="ds-roles">
  ${roles.map(r => `
  <div class="ds-role-row">
    <span class="ds-role-token">${r.label}</span>
    <span class="${r.cls}">${r.text}</span>
  </div>`).join('')}
</div>`;
}

// ─────────────────────────────────────────────
// MOTION
// ─────────────────────────────────────────────
function motion(): string {
  const tokens: Array<{ duration: string; easing: string; label: string; sublabel: string }> = [
    { duration: '80ms',  easing: 'cubic-bezier(0.4,0,0.2,1)', label: 'Instant · 80ms',    sublabel: '--duration-instant' },
    { duration: '120ms', easing: 'cubic-bezier(0.4,0,0.2,1)', label: 'Fast · 120ms',      sublabel: '--duration-fast' },
    { duration: '160ms', easing: 'cubic-bezier(0.4,0,0.2,1)', label: 'Base · 160ms',      sublabel: '--duration-base · --transition-standard' },
    { duration: '220ms', easing: 'cubic-bezier(0.0,0,0.2,1)', label: 'Slow · 220ms',      sublabel: '--duration-slow · --transition-reveal (enter)' },
    { duration: '120ms', easing: 'cubic-bezier(0.4,0,1,1)',   label: 'Dismiss · 120ms',   sublabel: '--transition-dismiss (exit)' },
    { duration: '360ms', easing: 'cubic-bezier(0.4,0,0.2,1)', label: 'Deliberate · 360ms',sublabel: '--duration-deliberate' },
    { duration: '600ms', easing: 'cubic-bezier(0.0,0,0.2,1)', label: 'Scene · 600ms',     sublabel: '--transition-scene-enter' },
  ];

  return `
<p class="ds-motion-hint">Click a row to play the animation.</p>
<div class="ds-motion-list">
  ${tokens.map(t => `
  <div class="ds-motion-demo" data-duration="${t.duration}" data-easing="${t.easing}">
    <div class="ds-motion-meta">
      <span class="ds-motion-label">${t.label}</span>
      <span class="ds-motion-sublabel">${t.sublabel}</span>
    </div>
    <div class="ds-motion-track">
      <div class="ds-motion-dot"></div>
    </div>
  </div>`).join('')}
</div>`;
}

// ─────────────────────────────────────────────
// SPACING
// ─────────────────────────────────────────────
function spacing(): string {
  const steps = [
    { token: '--space-1',  label: 'space-1 · 4px' },
    { token: '--space-2',  label: 'space-2 · 8px' },
    { token: '--space-3',  label: 'space-3 · 12px' },
    { token: '--space-4',  label: 'space-4 · 16px' },
    { token: '--space-5',  label: 'space-5 · 20px' },
    { token: '--space-6',  label: 'space-6 · 24px' },
    { token: '--space-8',  label: 'space-8 · 32px' },
    { token: '--space-10', label: 'space-10 · 40px' },
    { token: '--space-12', label: 'space-12 · 48px' },
    { token: '--space-16', label: 'space-16 · 64px' },
    { token: '--space-20', label: 'space-20 · 80px' },
  ];

  return `
<div class="ds-spacing-list">
  ${steps.map(s => `
  <div class="ds-spacing-row">
    <span class="ds-label">${s.label}</span>
    <div class="ds-spacing-bar" style="width:var(${s.token})"></div>
  </div>`).join('')}
</div>`;
}

// ─────────────────────────────────────────────
// RADIUS
// ─────────────────────────────────────────────
function radii(): string {
  const steps = [
    { token: '--radius-none', label: 'none · 0' },
    { token: '--radius-sm',   label: 'sm · 2px' },
    { token: '--radius-base', label: 'base · 4px' },
    { token: '--radius-md',   label: 'md · 6px' },
    { token: '--radius-lg',   label: 'lg · 8px' },
    { token: '--radius-xl',   label: 'xl · 12px' },
    { token: '--radius-2xl',  label: '2xl · 16px' },
    { token: '--radius-full', label: 'full · 9999px' },
  ];

  return `
<div class="ds-radius-list">
  ${steps.map(s => `
  <div class="ds-radius-row">
    <span class="ds-label">${s.label}</span>
    <div class="ds-radius-chip" style="border-radius:var(${s.token})"></div>
  </div>`).join('')}
</div>`;
}

// ─────────────────────────────────────────────
// SHADOWS
// ─────────────────────────────────────────────
function shadows(): string {
  const steps = [
    { token: '--shadow-sm',         label: 'shadow-sm' },
    { token: '--shadow-base',       label: 'shadow-base' },
    { token: '--shadow-lg',         label: 'shadow-lg' },
    { token: '--shadow-xl',         label: 'shadow-xl' },
    { token: '--shadow-glow-oxide', label: 'shadow-glow-oxide' },
    { token: '--shadow-glow-gold',  label: 'shadow-glow-gold' },
  ];

  return `
<div class="ds-shadow-list">
  ${steps.map(s => `
  <div class="ds-shadow-row">
    <span class="ds-label">${s.label}</span>
    <div class="ds-shadow-chip" style="box-shadow:var(${s.token})"></div>
  </div>`).join('')}
</div>`;
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
function injectStyles(): void {
  const existing = document.getElementById('ds-styles');
  if (existing) existing.remove();

  const style = document.createElement('style');
  style.id = 'ds-styles';
  style.textContent = `
    .ds-wrap {
      max-width: var(--max-w-ui);
      margin: 0 auto;
      padding: var(--space-10) var(--space-6) var(--space-20);
      font-family: var(--font-ui);
    }

    /* Header */
    .ds-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: var(--space-12);
      padding-bottom: var(--space-6);
      border-bottom: 1px solid var(--color-border-subtle);
    }
    .ds-eyebrow {
      display: block;
      font-size: var(--text-xs);
      letter-spacing: var(--tracking-widest);
      text-transform: uppercase;
      color: var(--color-text-accent);
      margin-bottom: var(--space-2);
    }
    .ds-title {
      font-size: var(--text-3xl);
      font-weight: var(--weight-bold);
      color: var(--color-text-primary);
      letter-spacing: var(--tracking-tight);
      line-height: var(--leading-tight);
      margin-bottom: var(--space-1);
    }
    .ds-subtitle {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      font-family: var(--font-mono);
    }
    .ds-toggle {
      font-family: var(--font-ui);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-text-primary);
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-base);
      padding: var(--space-2) var(--space-4);
      cursor: pointer;
      transition: background var(--transition-fast), border-color var(--transition-fast);
      white-space: nowrap;
    }
    .ds-toggle:hover {
      background: var(--color-surface-overlay);
      border-color: var(--color-border-strong);
    }

    /* Sections */
    .ds-section {
      margin-bottom: var(--space-16);
    }
    .ds-section-title {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      letter-spacing: var(--tracking-widest);
      text-transform: uppercase;
      color: var(--color-text-muted);
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--color-border-subtle);
    }

    /* Shared label */
    .ds-label {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      white-space: nowrap;
      min-width: 160px;
    }

    /* Palette */
    .ds-swatch-group { margin-bottom: var(--space-6); }
    .ds-swatch-group-label {
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      letter-spacing: var(--tracking-wide);
      color: var(--color-text-muted);
      text-transform: uppercase;
      margin-bottom: var(--space-3);
    }
    .ds-swatch-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
    }
    .ds-swatch {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
    }
    .ds-swatch-chip {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-base);
    }
    .ds-swatch-name {
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      color: var(--color-text-muted);
      text-align: center;
      max-width: 72px;
      line-height: var(--leading-snug);
    }

    /* Type scale */
    .ds-type-families { display: flex; flex-direction: column; gap: var(--space-12); }
    .ds-type-family {}
    .ds-type-row {
      display: flex;
      align-items: baseline;
      gap: var(--space-4);
      padding: var(--space-2) 0;
      border-bottom: 1px solid var(--color-border-subtle);
      overflow: hidden;
    }
    .ds-type-token {
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      color: var(--color-text-muted);
      white-space: nowrap;
      min-width: 80px;
    }

    /* Semantic roles */
    .ds-roles { display: flex; flex-direction: column; gap: var(--space-4); }
    .ds-role-row {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: var(--space-6);
      align-items: start;
      padding: var(--space-4) 0;
      border-bottom: 1px solid var(--color-border-subtle);
    }
    .ds-role-token {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--color-text-accent);
      padding-top: 3px;
    }

    /* Motion */
    .ds-motion-hint {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      margin-bottom: var(--space-4);
      font-style: italic;
    }
    .ds-motion-list { display: flex; flex-direction: column; gap: var(--space-2); }
    .ds-motion-demo {
      display: flex;
      align-items: center;
      gap: var(--space-6);
      padding: var(--space-3) var(--space-4);
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-base);
      cursor: pointer;
      transition: background var(--transition-fast);
    }
    .ds-motion-demo:hover { background: var(--color-surface-overlay); }
    .ds-motion-meta { min-width: 280px; }
    .ds-motion-label {
      display: block;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-text-primary);
    }
    .ds-motion-sublabel {
      display: block;
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      color: var(--color-text-muted);
      margin-top: var(--space-1);
    }
    .ds-motion-track {
      flex: 1;
      height: 32px;
      background: var(--color-surface-base);
      border-radius: var(--radius-base);
      overflow: hidden;
      position: relative;
    }
    .ds-motion-dot {
      position: absolute;
      top: 6px;
      left: 0;
      width: 20px;
      height: 20px;
      border-radius: var(--radius-full);
      background: var(--color-accent-default);
      transform: translateX(0);
    }

    /* Spacing */
    .ds-spacing-list { display: flex; flex-direction: column; gap: var(--space-2); }
    .ds-spacing-row {
      display: flex;
      align-items: center;
      gap: var(--space-6);
    }
    .ds-spacing-bar {
      height: 8px;
      background: var(--color-accent-default);
      border-radius: var(--radius-full);
      min-width: 2px;
    }

    /* Radius */
    .ds-radius-list { display: flex; flex-wrap: wrap; gap: var(--space-6); }
    .ds-radius-row { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); }
    .ds-radius-chip {
      width: 56px;
      height: 56px;
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border-default);
    }

    /* Shadows */
    .ds-shadow-list { display: flex; flex-wrap: wrap; gap: var(--space-8); }
    .ds-shadow-row { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); }
    .ds-shadow-chip {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-md);
      background: var(--color-surface-raised);
    }
  `;
  document.head.appendChild(style);
}
