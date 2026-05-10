// ASCEND — Attribute Panel (task 1.8)
// Read-only view of player stats, pillar rings, and cognitive axes.
// Accessed from the decision screen footer nav. Returns to decision on close.

import { loadState } from '../utils/storage';
import type { GameState } from '../core/state';
import { router } from '../core/router';

// ─────────────────────────────────────────────
// STAT METADATA
// ─────────────────────────────────────────────

interface StatMeta {
  label:   string;
  desc:    string;
  gate:    string;
}

const STAT_META: Record<string, StatMeta> = {
  executionDiscipline:  { label: 'Execution Discipline',   desc: 'Reliability in delivery. How consistently you do what you say.',             gate: 'Required for Promotion Readiness' },
  strategicInfluence:   { label: 'Strategic Influence',    desc: 'Your ability to shape decisions before they are made.',                       gate: 'Required for Senior track' },
  reputation:           { label: 'Reputation',             desc: 'What the room thinks of you when you\'re not in it.',                         gate: 'Affects sponsor strength' },
  politicalAwareness:   { label: 'Political Awareness',    desc: 'Reading the dynamics underneath the agenda.',                                  gate: 'Unlocks coalition options' },
  collaborativePull:    { label: 'Collaborative Pull',     desc: 'How much others want to work with you.',                                       gate: 'Affects NPC relationship growth' },
  adaptiveNerve:        { label: 'Adaptive Nerve',         desc: 'Comfort with ambiguity and high-stakes visibility.',                           gate: 'Unlocks high-risk options' },
  marketSense:          { label: 'Market Sense',           desc: 'Understanding what the business actually values.',                             gate: 'Required for Business case options' },
  technicalCredibility: { label: 'Technical Credibility',  desc: 'Being trusted on the details by people who know.',                            gate: 'Unlocks specialist influence' },
  resilience:           { label: 'Resilience',             desc: 'Recovery speed after setbacks, scrutiny, or failure.',                        gate: 'Affects consequence severity' },
  integrity:            { label: 'Integrity',              desc: 'Alignment between what you say, what you do, and what you believe.',           gate: 'Affects trust thresholds' },
};

const PILLAR_META: Record<string, { label: string; note: string }> = {
  curiosity:     { label: 'Curiosity',     note: 'Breadth of inquiry' },
  insight:       { label: 'Insight',       note: 'Depth of analysis' },
  engagement:    { label: 'Engagement',    note: 'Quality of presence' },
  determination: { label: 'Determination', note: 'Sustained effort' },
};

const AXIS_META: Record<string, { left: string; right: string; label: string }> = {
  analytical_intuitive:     { left: 'Analytical',   right: 'Intuitive',    label: 'Signal Reading' },
  collaborative_independent: { left: 'Collaborative', right: 'Independent',  label: 'Social Energy' },
  cautious_bold:            { left: 'Cautious',     right: 'Bold',         label: 'Decision Lens' },
  systemic_tactical:        { left: 'Systemic',     right: 'Tactical',     label: 'Operating Style' },
};

// ─────────────────────────────────────────────
// MOUNT / UNMOUNT
// ─────────────────────────────────────────────

let _container: HTMLElement | null = null;

export function mountAttributePanel(container: HTMLElement): void {
  _container = container;
  injectStyles();

  const state = loadState();
  if (!state) {
    container.innerHTML = `
<div class="ap-error">
  <p>No save found.</p>
  <button class="ap-close-btn" onclick="window.location.hash='#decision'">← Back</button>
</div>`;
    return;
  }

  render(state);

  // Keyboard: Escape closes panel
  function onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') { router.push('decision'); }
  }
  document.addEventListener('keydown', onKeyDown);
  // Store on element for cleanup
  (_container as HTMLElement & { _apKeyDown?: typeof onKeyDown })._apKeyDown = onKeyDown;
}

export function unmountAttributePanel(): void {
  document.getElementById('ap-styles')?.remove();
  // Remove Escape key handler
  const stored = (_container as (HTMLElement & { _apKeyDown?: (e: KeyboardEvent) => void }) | null);
  if (stored?._apKeyDown) document.removeEventListener('keydown', stored._apKeyDown);
  _container = null;
}

// Legacy signatures
export async function mount(container: HTMLElement): Promise<void> {
  mountAttributePanel(container);
}
export async function unmount(): Promise<void> {
  unmountAttributePanel();
}

// ─────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────

function render(state: GameState): void {
  if (!_container) return;

  const { year, week, questionIndex, player } = state;
  const qLabel = questionIndex > 0 ? `Q${questionIndex}` : 'Start';

  _container.innerHTML = `
<div class="ap-wrap">
  <aside class="ap-panel" role="complementary" aria-label="Attribute panel">

    <div class="ap-header">
      <div class="ap-header-left">
        <span class="ap-title">Attributes</span>
        <span class="ap-subtitle">YEAR ${year} · ${qLabel} · ${player.name}</span>
      </div>
      <button class="ap-close" id="ap-close" aria-label="Close panel">✕</button>
    </div>

    <div class="ap-content">

      <div class="ap-section">
        <div class="ap-section-label">
          Visible Stats
          <span class="ap-section-badge">10</span>
        </div>
        ${renderStats(state)}
      </div>

      <div class="ap-divider"></div>

      <div class="ap-section">
        <div class="ap-section-label">
          Character Pillars
          <span class="ap-section-badge">max 40</span>
        </div>
        ${renderPillars(state)}
      </div>

      <div class="ap-divider"></div>

      <div class="ap-section">
        <div class="ap-section-label">Cognitive Axes</div>
        ${renderAxes(state)}
      </div>

    </div>
  </aside>
</div>`;

  document.getElementById('ap-close')?.addEventListener('click', () => {
    router.push('decision');
  });
}

// ─────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────

function renderStats(state: GameState): string {
  return Object.entries(state.stats)
    .map(([key, val]) => {
      const meta  = STAT_META[key] ?? { label: key, desc: '', gate: '' };
      const level = val >= 75 ? 'vhigh' : val >= 60 ? 'high' : val <= 35 ? 'low' : '';
      return `
<div class="ap-stat-row">
  <div class="ap-stat-header">
    <span class="ap-stat-name">${meta.label}</span>
    <span class="ap-stat-value">${val}</span>
  </div>
  <div class="ap-stat-track">
    <div class="ap-stat-fill" style="width:${val}%" data-level="${level}"></div>
  </div>
  <div class="ap-stat-tooltip">
    <p class="ap-tooltip-desc">${meta.desc}</p>
    ${meta.gate ? `<p class="ap-tooltip-gate">${meta.gate}</p>` : ''}
  </div>
</div>`;
    }).join('');
}

// ─────────────────────────────────────────────
// PILLARS
// ─────────────────────────────────────────────

function renderPillars(state: GameState): string {
  const r   = 28;
  const circ = Math.PI * 2 * r;

  const cards = Object.entries(state.pillars).map(([key, val]) => {
    const meta   = PILLAR_META[key] ?? { label: key, note: '' };
    const pct    = val / 40;
    const offset = circ * (1 - pct);
    const color  = pct >= 0.7 ? 'var(--color-text-accent)' : pct >= 0.4 ? 'var(--color-border-strong)' : 'var(--color-border-default)';

    return `
<div class="ap-pillar-card">
  <div class="ap-pillar-ring-wrap">
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="${r}" fill="none" stroke="var(--color-border-subtle)" stroke-width="4"/>
      <circle cx="36" cy="36" r="${r}" fill="none" stroke="${color}" stroke-width="4"
        stroke-dasharray="${circ.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"
        stroke-linecap="round" transform="rotate(-90 36 36)"/>
    </svg>
    <div class="ap-pillar-center">
      <span class="ap-pillar-val">${val}</span>
      <span class="ap-pillar-max">/40</span>
    </div>
  </div>
  <span class="ap-pillar-name">${meta.label}</span>
  <span class="ap-pillar-note">${meta.note}</span>
</div>`;
  }).join('');

  return `<div class="ap-pillar-grid">${cards}</div>`;
}

// ─────────────────────────────────────────────
// COGNITIVE AXES
// ─────────────────────────────────────────────

function renderAxes(state: GameState): string {
  return Object.entries(state.axes).map(([key, val]) => {
    const meta = AXIS_META[key] ?? { left: key, right: '', label: key };
    // val is -5 to +5; map to 0–100% position
    const pct  = ((val + 5) / 10) * 100;

    return `
<div class="ap-axis-row">
  <div class="ap-axis-label">${meta.label}</div>
  <div class="ap-axis-poles">
    <span class="ap-axis-pole ${val < 0 ? 'ap-axis-pole--active' : ''}">${meta.left}</span>
    <span class="ap-axis-pole ${val > 0 ? 'ap-axis-pole--active' : ''}">${meta.right}</span>
  </div>
  <div class="ap-axis-track">
    <div class="ap-axis-marker" style="left:${pct}%"></div>
  </div>
</div>`;
  }).join('');
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

function injectStyles(): void {
  if (document.getElementById('ap-styles')) return;
  const style = document.createElement('style');
  style.id = 'ap-styles';
  style.textContent = `
.ap-wrap {
  display: flex;
  align-items: stretch;
  min-height: 100vh;
  justify-content: flex-end;
}
.ap-panel {
  width: 360px;
  flex-shrink: 0;
  background: var(--color-surface-raised);
  border-left: 1px solid var(--color-border-subtle);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  animation: ap-slide-in 0.22s var(--easing-enter) both;
}
@keyframes ap-slide-in {
  from { transform: translateX(24px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
@media (max-width: 600px) {
  .ap-panel { width: 100%; border-left: none; }
}
/* Header */
.ap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border-subtle);
  flex-shrink: 0;
}
.ap-header-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ap-title {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text-primary);
}
.ap-subtitle {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: var(--color-text-muted);
  letter-spacing: .08em;
  text-transform: uppercase;
}
.ap-close {
  background: none;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-base);
  color: var(--color-text-muted);
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}
.ap-close:hover { border-color: var(--color-border-strong); color: var(--color-text-primary); }
/* Content */
.ap-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5) var(--space-5) var(--space-8);
  scrollbar-width: thin;
  scrollbar-color: var(--color-border-default) transparent;
}
.ap-section { margin-bottom: var(--space-2); }
.ap-section-label {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.ap-section-badge {
  font-size: 0.6rem;
  color: var(--color-border-strong);
  border: 1px solid var(--color-border-subtle);
  border-radius: 2px;
  padding: 0 4px;
}
.ap-divider {
  height: 1px;
  background: var(--color-border-subtle);
  margin: var(--space-5) 0;
}
/* Stats */
.ap-stat-row {
  margin-bottom: var(--space-4);
  position: relative;
  cursor: default;
}
.ap-stat-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--space-1);
}
.ap-stat-name {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}
.ap-stat-row:hover .ap-stat-name { color: var(--color-text-primary); }
.ap-stat-value {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}
.ap-stat-row:hover .ap-stat-value { color: var(--color-text-primary); }
.ap-stat-track {
  height: 3px;
  background: var(--color-border-subtle);
  border-radius: var(--radius-full);
  overflow: visible;
  position: relative;
}
.ap-stat-track::after {
  content: '';
  position: absolute;
  top: -1px;
  left: 50%;
  width: 1px;
  height: 5px;
  background: var(--color-border-default);
  opacity: 0.5;
}
.ap-stat-fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: var(--color-border-strong);
  transition: width 0.5s var(--easing-enter);
}
.ap-stat-fill[data-level="high"]  { background: var(--color-text-accent); }
.ap-stat-fill[data-level="vhigh"] { background: #f59e0b; }
.ap-stat-fill[data-level="low"]   { background: var(--color-border-default); opacity: 0.6; }
.ap-stat-tooltip {
  display: none;
  position: absolute;
  left: 0;
  top: calc(100% + var(--space-2));
  z-index: 50;
  background: var(--color-surface-overlay);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-base);
  padding: var(--space-3);
  width: 260px;
  box-shadow: var(--shadow-lg);
}
.ap-stat-row:hover .ap-stat-tooltip { display: block; }
.ap-tooltip-desc {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0 0 var(--space-2);
}
.ap-tooltip-gate {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: var(--color-text-muted);
  letter-spacing: .06em;
  margin: 0;
}
/* Pillars */
.ap-pillar-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}
.ap-pillar-card {
  background: var(--color-surface-overlay);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  cursor: default;
  transition: border-color var(--transition-fast);
}
.ap-pillar-card:hover { border-color: var(--color-border-strong); }
.ap-pillar-ring-wrap {
  position: relative;
  width: 72px;
  height: 72px;
}
.ap-pillar-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.ap-pillar-val {
  font-family: var(--font-mono);
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--color-text-primary);
  line-height: 1;
}
.ap-pillar-max {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  color: var(--color-text-muted);
}
.ap-pillar-name {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
  text-align: center;
}
.ap-pillar-note {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  color: var(--color-text-muted);
  letter-spacing: .04em;
  text-align: center;
}
/* Axes */
.ap-axis-row { margin-bottom: var(--space-5); }
.ap-axis-label {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}
.ap-axis-poles {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-1);
}
.ap-axis-pole {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: var(--color-text-disabled);
  letter-spacing: .06em;
  text-transform: uppercase;
  transition: color var(--transition-fast);
}
.ap-axis-pole--active { color: var(--color-text-accent); }
.ap-axis-track {
  height: 3px;
  background: var(--color-border-subtle);
  border-radius: var(--radius-full);
  position: relative;
}
.ap-axis-track::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 50%;
  width: 1px;
  height: 7px;
  background: var(--color-border-default);
}
.ap-axis-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-accent-default);
  border: 2px solid var(--color-surface-raised);
  transition: left 0.4s var(--easing-enter);
}
/* Error */
.ap-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: var(--space-4);
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}
`;
  document.head.appendChild(style);
}
