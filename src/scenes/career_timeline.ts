// ASCEND — Career Timeline (task 2.2)
// Wireframe: design/wireframes/career_timeline.html
// Shows all Y1 decisions on a horizontal timeline. Click a node → detail sidebar.
// Year tabs: Year 1 active; Years 2-5 locked until played.

import type { GameState } from '../core/state';
import { loadState }       from '../utils/storage';
import { router }          from '../core/router';
import { loadAllQuestionsForYear } from '../data';
import type { Question, QuestionOption } from '../data/types';
import type { DecisionRecord } from '../core/state';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface TimelinePanel {
  selectedIdx: number | null;
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const STAT_DISPLAY: Record<string, string> = {
  executionDiscipline:  'Exec. Discipline',
  strategicInfluence:   'Strategic Influence',
  reputation:           'Reputation',
  politicalAwareness:   'Political Awareness',
  collaborativePull:    'Collaborative Pull',
  adaptiveNerve:        'Adaptive Nerve',
  marketSense:          'Market Sense',
  technicalCredibility: 'Tech. Credibility',
  resilience:           'Resilience',
  integrity:            'Integrity',
};

// Expected week for each Y1 question (index 0–9)
const EXPECTED_WEEKS = [1, 3, 6, 9, 12, 14, 18, 21, 24, 28];
const YEAR_END_WEEK  = 30;

const CAT_CLASS: Record<string, string> = {
  execution:    'cat-execution',
  strategic:    'cat-strategic',
  relationship: 'cat-relationship',
  collaboration:'cat-collaboration',
  visibility:   'cat-visibility',
  orientation:  'cat-relationship',  // Y1 Q1 is orientation → purple
};

const QUARTERS = [
  { label: 'Q1 · Jan–Mar', weekEnd: 13 },
  { label: 'Q2 · Apr–Jun', weekEnd: 26 },
  { label: 'Q3 · Jul–Sep', weekEnd: 39 },
  { label: 'Q4 · Oct–Dec', weekEnd: 52 },
];

// ─────────────────────────────────────────────
// MODULE STATE
// ─────────────────────────────────────────────

let _container: HTMLElement | null = null;
let _styleEl:   HTMLStyleElement | null = null;
let _panel:     TimelinePanel = { selectedIdx: null };
let _keyDown:   ((e: KeyboardEvent) => void) | null = null;

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const STYLES = `
.ct-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--color-surface-base);
}

/* Header */
.ct-header {
  position: relative;
  z-index: var(--z-overlay);
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  background: var(--color-surface-base);
  border-bottom: 1px solid var(--color-border-subtle);
  flex-shrink: 0;
}
.ct-header-left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}
.ct-wordmark {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-primary);
}
.ct-h-divider {
  width: 1px;
  height: 16px;
  background: var(--color-border-default);
}
.ct-header-context {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  letter-spacing: var(--tracking-wide);
}
.ct-back-btn {
  background: none;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-1) var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  transition: all var(--duration-fast) var(--ease-default);
}
.ct-back-btn:hover {
  border-color: var(--color-accent-default);
  color: var(--color-accent-default);
}
.ct-back-btn:focus-visible {
  outline: 2px solid var(--color-accent-default);
  outline-offset: 2px;
}

/* Year tabs */
.ct-year-tabs {
  display: flex;
  align-items: center;
  padding: 0 var(--space-6);
  border-bottom: 1px solid var(--color-border-subtle);
  flex-shrink: 0;
  background: var(--color-surface-base);
}
.ct-year-tab {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  transition: all var(--duration-fast) var(--ease-default);
  margin-bottom: -1px;
}
.ct-year-tab.active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-accent-default);
}
.ct-year-tab.locked {
  color: var(--color-border-subtle);
  cursor: not-allowed;
}
.ct-year-tab-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: currentColor;
  margin-right: var(--space-2);
  vertical-align: middle;
}

/* Content */
.ct-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.ct-timeline-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* Quarter header */
.ct-quarter-header {
  display: flex;
  flex-shrink: 0;
  padding: var(--space-4) var(--space-8) 0;
}
.ct-quarter-cell {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.ct-quarter-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-muted);
  white-space: nowrap;
}
.ct-quarter-line {
  flex: 1;
  height: 1px;
  background: var(--color-border-subtle);
}

/* Timeline track */
.ct-track-wrap {
  flex: 1;
  position: relative;
  padding: var(--space-6) var(--space-8);
  overflow: hidden;
}
.ct-rail {
  position: absolute;
  top: 50%;
  left: var(--space-8);
  right: var(--space-8);
  height: 1px;
  background: var(--color-border-subtle);
  transform: translateY(-50%);
}
.ct-nodes-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Nodes */
.ct-node-wrap {
  position: absolute;
  transform: translateX(-50%);
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  cursor: pointer;
}
.ct-node-wrap.pending {
  opacity: 0.35;
  cursor: default;
  pointer-events: none;
}
.ct-node-label-top {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-muted);
  white-space: nowrap;
  margin-bottom: var(--space-2);
  text-align: center;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-default);
}
.ct-node-wrap:hover .ct-node-label-top,
.ct-node-wrap.selected .ct-node-label-top { opacity: 1; }
.ct-node-circle {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  transition: all var(--duration-moderate) var(--ease-default);
  z-index: 1;
  user-select: none;
}
.ct-node-wrap:hover .ct-node-circle,
.ct-node-wrap.selected .ct-node-circle { transform: scale(1.2); }
.ct-node-wrap.selected .ct-node-circle {
  box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 25%, transparent);
}
.ct-node-label-bottom {
  font-family: var(--font-narrative);
  font-size: 10px;
  font-style: italic;
  color: var(--color-text-muted);
  white-space: nowrap;
  margin-top: var(--space-2);
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-default);
}
.ct-node-wrap:hover .ct-node-label-bottom,
.ct-node-wrap.selected .ct-node-label-bottom { opacity: 1; }

/* Category colours */
.cat-execution    { border-color: var(--color-accent-default); color: var(--color-accent-default); background: color-mix(in srgb, var(--color-accent-default) 12%, var(--color-surface-base)); }
.cat-strategic    { border-color: var(--color-gold-400); color: var(--color-gold-400); background: color-mix(in srgb, var(--color-gold-400) 12%, var(--color-surface-base)); }
.cat-relationship { border-color: #7C6FAF; color: #7C6FAF; background: color-mix(in srgb, #7C6FAF 12%, var(--color-surface-base)); }
.cat-collaboration { border-color: #3A7D6B; color: #3A7D6B; background: color-mix(in srgb, #3A7D6B 12%, var(--color-surface-base)); }
.cat-visibility   { border-color: #D4AF37; color: #D4AF37; background: color-mix(in srgb, #D4AF37 12%, var(--color-surface-base)); }

/* Stat strip */
.ct-stat-strip {
  flex-shrink: 0;
  padding: var(--space-4) var(--space-8);
  border-top: 1px solid var(--color-border-subtle);
  background: var(--color-surface-base);
}
.ct-stat-strip-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
}
.ct-stat-bars {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-5);
}
.ct-stat-bar-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 160px;
}
.ct-stat-bar-name {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-muted);
  min-width: 110px;
}
.ct-stat-bar-track {
  flex: 1;
  height: 3px;
  background: var(--color-border-subtle);
  border-radius: var(--radius-full);
  min-width: 50px;
  overflow: hidden;
}
.ct-stat-bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  width: 0;
  transition: width 700ms var(--ease-default);
}
.ct-stat-bar-fill.positive { background: #3A7D6B; }
.ct-stat-bar-fill.negative { background: var(--color-accent-default); }
.ct-stat-bar-delta {
  font-family: var(--font-mono);
  font-size: 9px;
  min-width: 28px;
  text-align: right;
}

/* Detail sidebar */
.ct-sidebar {
  width: 320px;
  flex-shrink: 0;
  border-left: 1px solid var(--color-border-subtle);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-surface-raised);
}
.ct-sidebar-empty-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ct-sidebar-empty-msg {
  font-family: var(--font-narrative);
  font-size: var(--text-sm);
  font-style: italic;
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--space-8);
  line-height: var(--leading-relaxed);
}
.ct-sidebar-header {
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border-subtle);
  flex-shrink: 0;
}
.ct-sidebar-eyebrow {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-1);
}
.ct-sidebar-title {
  font-family: var(--font-ui);
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--color-text-primary);
}
.ct-sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5);
}
.ct-setup-text {
  font-family: var(--font-narrative);
  font-size: var(--text-sm);
  font-style: italic;
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-border-subtle);
}
.ct-chosen-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}
.ct-chosen-option {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-4);
}
.ct-chosen-opt-label {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}
.ct-chosen-opt-text {
  font-family: var(--font-narrative);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-3);
}
.ct-delta-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-bottom: var(--space-2);
}
.ct-delta-chip {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: var(--tracking-wide);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
}
.ct-delta-chip.pos { background: color-mix(in srgb, #3A7D6B 15%, transparent); color: #5BAD8F; }
.ct-delta-chip.neg { background: color-mix(in srgb, var(--color-accent-default) 15%, transparent); color: var(--color-accent-default); }
.ct-inner-mono {
  font-family: var(--font-narrative);
  font-size: var(--text-xs);
  font-style: italic;
  color: var(--color-text-muted);
  border-left: 2px solid var(--color-border-subtle);
  padding-left: var(--space-3);
  margin-top: var(--space-2);
  line-height: var(--leading-relaxed);
}
.ct-consequence-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-3);
}
.ct-ctag {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: var(--tracking-wide);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-2);
}

/* Loading state */
.ct-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ct-loading-text {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-muted);
}

@media (max-width: 900px) {
  .ct-sidebar { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .ct-stat-bar-fill { transition: none; }
  .ct-node-circle { transition: none; }
  .ct-node-label-top, .ct-node-label-bottom { transition: none; }
}
`;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function weekToFraction(week: number): number {
  return Math.min(1, Math.max(0, (week - 1) / (YEAR_END_WEEK - 1)));
}

// ─────────────────────────────────────────────
// STAT AGGREGATE
// ─────────────────────────────────────────────

function computeCumulativeDeltas(
  questions: Question[],
  decisions: DecisionRecord[],
): Record<string, number> {
  const acc: Record<string, number> = {};
  for (const dec of decisions) {
    if (dec.year !== 1) continue;
    const q = questions.find(q => q.id === dec.questionId);
    if (!q) continue;
    const opt = q.options.find(o => o.id === dec.optionId);
    if (!opt) continue;
    for (const { stat, delta } of opt.statDeltas) {
      acc[stat] = (acc[stat] ?? 0) + delta;
    }
  }
  return acc;
}

// ─────────────────────────────────────────────
// RENDER — SHELL
// ─────────────────────────────────────────────

function renderShell(container: HTMLElement, playerName: string, yearCurrent: number): void {
  const yearTabs = [1, 2, 3, 4, 5].map(y => {
    const active = y === 1 && yearCurrent >= 1 ? 'active' : 'locked';
    const yearLabels: Record<number, string> = {
      1: 'Year 1 · 2034',
      2: 'Year 2 · 2035',
      3: 'Year 3 · 2036',
      4: 'Years 4–7',
      5: 'Years 8–12',
    };
    return `<button class="ct-year-tab ${active}" aria-selected="${active === 'active'}" role="tab"
      ${active === 'locked' ? 'disabled aria-disabled="true"' : ''}>${
      `<span class="ct-year-tab-dot" aria-hidden="true"></span>${esc(yearLabels[y] ?? `Year ${y}`)}`
    }</button>`;
  }).join('');

  const quarterCells = QUARTERS.map(q =>
    `<div class="ct-quarter-cell">
      <span class="ct-quarter-label">${esc(q.label)}</span>
      <div class="ct-quarter-line" aria-hidden="true"></div>
    </div>`
  ).join('');

  container.innerHTML = `
<div class="ct-root" role="main">

  <header class="ct-header" role="banner">
    <div class="ct-header-left">
      <span class="ct-wordmark">AUREL</span>
      <div class="ct-h-divider" aria-hidden="true"></div>
      <span class="ct-header-context" aria-label="Current section: Career Timeline">${esc(playerName)} · CAREER TIMELINE</span>
    </div>
    <button class="ct-back-btn" id="ct-back" aria-label="Back to decisions">← Back</button>
  </header>

  <div class="ct-year-tabs" role="tablist" aria-label="Career years">
    ${yearTabs}
  </div>

  <div class="ct-content">
    <div class="ct-timeline-area" role="region" aria-label="Year 1 timeline">

      <div class="ct-quarter-header" aria-hidden="true">
        ${quarterCells}
      </div>

      <div class="ct-track-wrap" id="ct-track-wrap">
        <div class="ct-rail" aria-hidden="true"></div>
        <div class="ct-nodes-layer" id="ct-nodes-layer" role="list" aria-label="Year 1 decisions"></div>
      </div>

      <div class="ct-stat-strip" role="region" aria-label="Cumulative attribute movement">
        <div class="ct-stat-strip-label">Cumulative Y1 Attribute Movement</div>
        <div class="ct-stat-bars" id="ct-stat-bars"></div>
      </div>

    </div>

    <aside class="ct-sidebar" id="ct-sidebar" aria-label="Decision detail" aria-live="polite">
      <div class="ct-sidebar-empty-body">
        <p class="ct-sidebar-empty-msg">Select a decision<br>to review what happened.</p>
      </div>
    </aside>
  </div>

</div>`;
}

// ─────────────────────────────────────────────
// RENDER — NODES
// ─────────────────────────────────────────────

function renderNodes(
  questions: Question[],
  decisions: DecisionRecord[],
): void {
  const layer = document.getElementById('ct-nodes-layer');
  const wrap  = document.getElementById('ct-track-wrap');
  if (!layer || !wrap) return;

  const totalW = wrap.clientWidth;
  const padPx  = 32; // matches var(--space-8) ≈ 32px
  const trackW = totalW - padPx * 2;

  layer.innerHTML = '';

  questions.forEach((q, idx) => {
    const dec = decisions.find(d => d.questionId === q.id && d.year === 1);
    const week = dec?.week ?? EXPECTED_WEEKS[idx] ?? idx * 3 + 1;
    const answered = !!dec;
    const frac = weekToFraction(week);
    const leftPx = padPx + frac * trackW;

    const catClass = CAT_CLASS[q.category] ?? 'cat-execution';

    const node = document.createElement('div');
    node.className = `ct-node-wrap${answered ? '' : ' pending'}${_panel.selectedIdx === idx ? ' selected' : ''}`;
    node.style.left = `${leftPx}px`;
    node.dataset.idx = String(idx);
    node.setAttribute('role', 'listitem');
    if (answered) {
      node.setAttribute('tabindex', '0');
      node.setAttribute('aria-label', `Q${q.questionNumber} — ${q.title}`);
    }

    const optId  = dec?.optionId ?? '';
    const opt    = q.options.find(o => o.id === optId);

    node.innerHTML = `
      <div class="ct-node-label-top" aria-hidden="true">${esc(q.title)}</div>
      <div class="ct-node-circle ${catClass}" aria-hidden="true">Q${q.questionNumber}</div>
      <div class="ct-node-label-bottom" aria-hidden="true">${esc(q.category)}</div>
    `;

    if (answered) {
      node.addEventListener('click', () => selectNode(idx, q, opt ?? null, dec!));
      node.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectNode(idx, q, opt ?? null, dec!);
        }
      });
    }

    layer.appendChild(node);
  });
}

// ─────────────────────────────────────────────
// RENDER — STAT STRIP
// ─────────────────────────────────────────────

function renderStatStrip(deltas: Record<string, number>): void {
  const container = document.getElementById('ct-stat-bars');
  if (!container) return;
  container.innerHTML = '';

  const entries = Object.entries(STAT_DISPLAY).map(([key, label]) => ({
    key,
    label,
    delta: deltas[key] ?? 0,
  })).filter(e => e.delta !== 0);

  if (entries.length === 0) {
    container.innerHTML = `<span style="font-family:var(--font-mono);font-size:9px;color:var(--color-text-disabled)">No decisions recorded yet.</span>`;
    return;
  }

  entries.forEach(({ key, label, delta }) => {
    const isPos = delta >= 0;
    const pct   = Math.min(Math.abs(delta) * 4, 100);
    const item  = document.createElement('div');
    item.className = 'ct-stat-bar-item';
    item.innerHTML = `
      <span class="ct-stat-bar-name" aria-label="${esc(label)}">${esc(label)}</span>
      <div class="ct-stat-bar-track" role="presentation">
        <div class="ct-stat-bar-fill ${isPos ? 'positive' : 'negative'}" data-target="${pct}%" style="width:0"></div>
      </div>
      <span class="ct-stat-bar-delta" aria-label="${isPos ? 'plus' : 'minus'} ${Math.abs(delta)}"
            style="color:${isPos ? '#5BAD8F' : 'var(--color-accent-default)'}">${isPos ? '+' : ''}${delta}</span>
    `;
    container.appendChild(item);
  });

  // Animate after paint
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.ct-stat-bar-fill').forEach(el => {
        el.style.width = el.dataset.target ?? '0%';
      });
    }, 120);
  });
}

// ─────────────────────────────────────────────
// SELECTION
// ─────────────────────────────────────────────

function selectNode(
  idx: number,
  question: Question,
  option: QuestionOption | null,
  dec: DecisionRecord,
): void {
  // Toggle off
  if (_panel.selectedIdx === idx) {
    _panel.selectedIdx = null;
    clearSidebar();
    rerenderNodeStates();
    return;
  }

  _panel.selectedIdx = idx;
  rerenderNodeStates();
  renderSidebar(question, option, dec);
}

function rerenderNodeStates(): void {
  document.querySelectorAll<HTMLElement>('.ct-node-wrap').forEach(n => {
    const idx = parseInt(n.dataset.idx ?? '-1', 10);
    n.classList.toggle('selected', idx === _panel.selectedIdx);
  });
}

function clearSidebar(): void {
  const sb = document.getElementById('ct-sidebar');
  if (!sb) return;
  sb.innerHTML = `
    <div class="ct-sidebar-empty-body">
      <p class="ct-sidebar-empty-msg">Select a decision<br>to review what happened.</p>
    </div>
  `;
}

function renderSidebar(
  q: Question,
  opt: QuestionOption | null,
  dec: DecisionRecord,
): void {
  const sb = document.getElementById('ct-sidebar');
  if (!sb) return;

  const catLabel = q.category.charAt(0).toUpperCase() + q.category.slice(1);

  const deltasHTML = (opt?.statDeltas ?? []).map(({ stat, delta }) => {
    const isPos  = delta >= 0;
    const label  = STAT_DISPLAY[stat] ?? stat.replace(/([A-Z])/g, ' $1').toLowerCase();
    return `<span class="ct-delta-chip ${isPos ? 'pos' : 'neg'}" aria-label="${esc(label)} ${isPos ? 'plus' : 'minus'} ${Math.abs(delta)}">${esc(label)} ${isPos ? '+' : ''}${delta}</span>`;
  }).join('');

  const tagsHTML = (opt?.consequenceTags ?? []).map(t =>
    `<span class="ct-ctag">${esc(t.replace(/_/g, ' '))}</span>`
  ).join('');

  sb.innerHTML = `
    <div class="ct-sidebar-header">
      <div class="ct-sidebar-eyebrow">Q${q.questionNumber} · Wk ${dec.week} · ${esc(catLabel)} · Year ${dec.year}</div>
      <div class="ct-sidebar-title">${esc(q.title)}</div>
    </div>
    <div class="ct-sidebar-body">
      <div class="ct-setup-text">${esc(q.setup)}</div>
      ${opt ? `
      <div class="ct-chosen-label">Decision Made</div>
      <div class="ct-chosen-option">
        <div class="ct-chosen-opt-label">${esc(opt.id)} — ${esc(opt.label)}</div>
        <div class="ct-chosen-opt-text">${esc(opt.text)}</div>
        <div class="ct-delta-chips">${deltasHTML}</div>
        ${opt.innerMonologue ? `<div class="ct-inner-mono">${esc(opt.innerMonologue)}</div>` : ''}
        ${opt.consequenceTags.length > 0 ? `<div class="ct-consequence-tags">${tagsHTML}</div>` : ''}
      </div>` : '<div class="ct-chosen-label" style="color:var(--color-text-disabled)">No option data found.</div>'}
    </div>
  `;
}

// ─────────────────────────────────────────────
// LOADING STATE
// ─────────────────────────────────────────────

function renderLoading(container: HTMLElement): void {
  container.innerHTML = `
    <div class="ct-root">
      <div class="ct-loading">
        <span class="ct-loading-text">Loading timeline…</span>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────
// INIT (async)
// ─────────────────────────────────────────────

async function init(container: HTMLElement): Promise<void> {
  const state = loadState();
  if (!state) {
    router.push('landing');
    return;
  }

  renderLoading(container);

  let questions: Question[];
  try {
    questions = await loadAllQuestionsForYear(1);
  } catch (err) {
    container.innerHTML = `
      <div class="ct-root">
        <div class="ct-loading">
          <span class="ct-loading-text" style="color:var(--color-accent-default)">Failed to load questions. Check connection.</span>
        </div>
      </div>
    `;
    console.error('[ASCEND] career_timeline: failed to load questions', err);
    return;
  }

  if (_container !== container) return; // unmounted while loading

  renderShell(container, state.player.name, state.year);

  const y1Decisions = state.decisions.filter(d => d.year === 1);
  renderNodes(questions, y1Decisions);

  const deltas = computeCumulativeDeltas(questions, y1Decisions);
  renderStatStrip(deltas);

  // Wire back button
  document.getElementById('ct-back')?.addEventListener('click', () => {
    router.push('decision');
  });

  // Escape key
  _keyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') router.push('decision');
  };
  document.addEventListener('keydown', _keyDown);

  // Re-render nodes on resize
  const resizeHandler = () => renderNodes(questions, y1Decisions);
  window.addEventListener('resize', resizeHandler);
  (container as HTMLElement & { _ctResize?: () => void })._ctResize = resizeHandler;
}

// ─────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────

export function mountCareerTimeline(container: HTMLElement): void {
  _container      = container;
  _panel          = { selectedIdx: null };

  // Inject styles
  _styleEl = document.createElement('style');
  _styleEl.textContent = STYLES;
  document.head.appendChild(_styleEl);

  void init(container);
}

export function unmountCareerTimeline(): void {
  if (_keyDown) {
    document.removeEventListener('keydown', _keyDown);
    _keyDown = null;
  }
  const resizeHandler = (_container as (HTMLElement & { _ctResize?: () => void }) | null)?._ctResize;
  if (resizeHandler) window.removeEventListener('resize', resizeHandler);

  _styleEl?.remove();
  _styleEl   = null;
  _container = null;
}
