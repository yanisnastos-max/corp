// ASCEND — Decision Screen (task 1.6)
// Loads the current question for the active year/questionIndex,
// presents setup + 4 option cards, resolves choice → consequences drawer.

import { loadQuestion } from '../data';
import type { Question, QuestionOption } from '../data';
import {
  updateStats,
  updateNpcRelationship,
  addConsequenceTags,
  recordDecision,
} from '../core/state';
import type { StatKey } from '../core/constants';
import { loadState, saveState } from '../utils/storage';
import { router } from '../core/router';

// ─────────────────────────────────────────────
// STAT DISPLAY NAMES
// ─────────────────────────────────────────────

const STAT_LABELS: Record<StatKey, string> = {
  executionDiscipline: 'Execution Discipline',
  strategicInfluence:  'Strategic Influence',
  collaborativePull:   'Collaborative Pull',
  adaptiveNerve:       'Adaptive Nerve',
  politicalAwareness:  'Political Awareness',
  integrity:           'Integrity',
  resilience:          'Resilience',
  reputation:          'Reputation',
  marketSense:         'Market Sense',
  technicalCredibility:'Technical Credibility',
};

// ─────────────────────────────────────────────
// MODULE STATE
// ─────────────────────────────────────────────

type Phase = 'loading' | 'choosing' | 'resolved' | 'error';

interface DecisionSceneState {
  phase:    Phase;
  question: Question | null;
  chosen:   QuestionOption | null;
  error:    string | null;
}

let _scene: DecisionSceneState = {
  phase:    'loading',
  question: null,
  chosen:   null,
  error:    null,
};

let _container: HTMLElement | null = null;

// ─────────────────────────────────────────────
// MOUNT / UNMOUNT
// ─────────────────────────────────────────────

export async function mountDecision(container: HTMLElement): Promise<void> {
  _container = container;
  _scene = { phase: 'loading', question: null, chosen: null, error: null };

  injectStyles();
  render();

  const state = loadState();
  if (!state) {
    _scene = { ..._scene, phase: 'error', error: 'No save found. Please start a new game.' };
    render();
    return;
  }

  const year = state.year;
  const qNum = state.questionIndex + 1;   // questionIndex is 0-based

  try {
    const question = await loadQuestion(year, qNum);
    _scene = { ..._scene, phase: 'choosing', question };
    render();
  } catch (e) {
    _scene = {
      ..._scene,
      phase: 'error',
      error: `Could not load question Y${year}Q${qNum}: ${String(e)}`,
    };
    render();
  }
}

export function unmountDecision(): void {
  document.getElementById('dc-styles')?.remove();
  _container = null;
}

// Legacy mount signature (for any existing call-sites)
export async function mount(container: HTMLElement): Promise<void> {
  return mountDecision(container);
}

export async function unmount(): Promise<void> {
  unmountDecision();
}

// ─────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────

function render(): void {
  if (!_container) return;

  if (_scene.phase === 'loading') {
    _container.innerHTML = `
<div class="dc-loading">
  <span class="dc-loading-dot"></span>
  <span class="dc-loading-dot"></span>
  <span class="dc-loading-dot"></span>
</div>`;
    return;
  }

  if (_scene.phase === 'error') {
    _container.innerHTML = `
<div class="dc-error">
  <p class="dc-error-msg">${''}${_scene.error ?? 'Unknown error'}</p>
  <button class="dc-ghost-btn" onclick="window.location.hash=''">back to landing</button>
</div>`;
    return;
  }

  if (!_scene.question) return;

  const q     = _scene.question;
  const state = loadState();
  const phase = _scene.phase;

  _container.innerHTML = `
<div class="dc-wrap">

  ${header(q, state?.player.name ?? '')}

  <div class="dc-body">
    <div class="dc-setup-col">
      ${setupPanel(q)}
    </div>
    <div class="dc-options-col">
      ${optionCards(q, phase)}
    </div>
  </div>

  ${phase === 'resolved' && _scene.chosen ? drawer(_scene.chosen) : ''}

  ${phase === 'resolved' ? `
  <div class="dc-footer">
    <nav class="dc-panel-nav">
      <button class="dc-panel-link" id="dc-attr-link">Attributes</button>
      <span class="dc-panel-link dc-panel-link--disabled">People</span>
    </nav>
    <button class="dc-continue-btn" id="dc-continue">Continue →</button>
  </div>` : ''}

</div>`;

  wire();
}

// ─────────────────────────────────────────────
// TEMPLATE HELPERS
// ─────────────────────────────────────────────

function header(q: Question, playerName: string): string {
  const totalQ   = 10;
  const pct      = Math.round(((q.questionNumber - 1) / totalQ) * 100);
  const dots     = Array.from({ length: totalQ }, (_, i) => {
    const cls = i + 1 < q.questionNumber ? 'dc-dot dc-dot--done'
              : i + 1 === q.questionNumber ? 'dc-dot dc-dot--active'
              : 'dc-dot';
    return `<span class="${cls}"></span>`;
  }).join('');

  return `
<header class="dc-header">
  <div class="dc-header-top">
    <div class="dc-header-left">
      <span class="dc-pill">Year ${q.year}</span>
      <span class="dc-pill dc-pill-cat">${q.category}</span>
    </div>
    <div class="dc-header-right">
      ${playerName ? `<span class="dc-player-tag">${esc(playerName)}</span>` : ''}
    </div>
  </div>
  <div class="dc-year-progress">
    <div class="dc-progress-dots">${dots}</div>
    <span class="dc-progress-label">Q${q.questionNumber} of ${totalQ}</span>
  </div>
</header>`;
}

function setupPanel(q: Question): string {
  const paras = q.setup
    .split('\n\n')
    .filter(p => p.trim().length > 0)
    .map(p => `<p class="dc-setup-para">${esc(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');

  return `
<div class="dc-setup">
  <h2 class="dc-setup-title">${esc(q.title)}</h2>
  <div class="dc-setup-body">
    ${paras}
  </div>
  ${q.anchoredNPCs.length > 0 ? `
  <div class="dc-npc-tags">
    ${q.anchoredNPCs.map(id => `<span class="dc-npc-tag">${npcLabel(id)}</span>`).join('')}
  </div>` : ''}
</div>`;
}

function optionCards(q: Question, phase: Phase): string {
  return `
<div class="dc-options">
  ${q.options.map(opt => optionCard(opt, phase)).join('')}
</div>`;
}

function optionCard(opt: QuestionOption, phase: Phase): string {
  const isChosen  = phase === 'resolved' && _scene.chosen?.id === opt.id;
  const isDimmed  = phase === 'resolved' && !isChosen;
  const classList = [
    'dc-option',
    isChosen ? 'dc-option--chosen' : '',
    isDimmed  ? 'dc-option--dimmed'  : '',
  ].filter(Boolean).join(' ');

  return `
<button class="${classList}" data-option-id="${opt.id}" ${phase === 'resolved' ? 'disabled' : ''}>
  <div class="dc-option-header">
    <span class="dc-option-id">${opt.id}</span>
    <span class="dc-option-label">${esc(opt.label)}</span>
  </div>
  <p class="dc-option-text">${esc(opt.text)}</p>
</button>`;
}

function drawer(opt: QuestionOption): string {
  const deltas = opt.statDeltas
    .map(d => {
      const sign  = d.delta > 0 ? '+' : '';
      const cls   = d.delta > 0 ? 'dc-delta--pos' : 'dc-delta--neg';
      const label = STAT_LABELS[d.stat] ?? d.stat;
      return `<span class="dc-delta ${cls}">${label} <strong>${sign}${d.delta}</strong></span>`;
    })
    .join('');

  return `
<div class="dc-drawer" id="dc-drawer">
  <p class="dc-monologue">${esc(opt.innerMonologue)}</p>
  ${deltas ? `<div class="dc-deltas">${deltas}</div>` : ''}
  ${opt.consequenceTags.length > 0 ? `
  <div class="dc-consequence-tags">
    ${opt.consequenceTags.map(t => `<span class="dc-ctag">${t.replace(/_/g, ' ')}</span>`).join('')}
  </div>` : ''}
</div>`;
}

// ─────────────────────────────────────────────
// WIRE INTERACTIONS
// ─────────────────────────────────────────────

function wire(): void {
  if (_scene.phase === 'choosing') {
    document.querySelectorAll<HTMLButtonElement>('.dc-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const optId = btn.dataset['optionId'];
        const opt   = _scene.question?.options.find(o => o.id === optId);
        if (opt) choose(opt);
      });
    });
  }

  if (_scene.phase === 'resolved') {
    document.getElementById('dc-continue')?.addEventListener('click', advance);
    document.getElementById('dc-attr-link')?.addEventListener('click', () => {
      router.push('attribute_panel');
    });
  }
}

// ─────────────────────────────────────────────
// CHOICE RESOLUTION
// ─────────────────────────────────────────────

function choose(opt: QuestionOption): void {
  let state = loadState();
  if (!state || !_scene.question) return;

  const q = _scene.question;

  // Apply stat deltas
  const statMap: Partial<Record<StatKey, number>> = {};
  for (const d of opt.statDeltas) {
    statMap[d.stat] = d.delta;
  }
  state = updateStats(state, statMap);

  // Apply NPC relationship deltas
  for (const nd of opt.npcDeltas) {
    state = updateNpcRelationship(state, nd.npcId, nd.delta);
  }

  // Apply consequence tags
  if (opt.consequenceTags.length > 0) {
    state = addConsequenceTags(state, opt.consequenceTags);
  }

  // Record the decision (increments questionIndex)
  state = recordDecision(state, {
    questionId: q.id,
    optionId:   opt.id,
    year:       q.year,
    week:       state.week,
  });

  // Advance week: 10 questions × 5 weeks ≈ 50 weeks in year 1
  state = { ...state, week: Math.min(52, state.week + 5) };

  saveState(state);

  _scene = { ..._scene, phase: 'resolved', chosen: opt };
  render();

  // Animate drawer in
  requestAnimationFrame(() => {
    document.getElementById('dc-drawer')?.classList.add('dc-drawer--visible');
  });
}

// ─────────────────────────────────────────────
// ADVANCE — next question or year end
// ─────────────────────────────────────────────

function advance(): void {
  const state = loadState();
  if (!state) { router.push('landing'); return; }

  if (state.questionIndex < 10) {
    _scene = { phase: 'loading', question: null, chosen: null, error: null };
    render();
    void mountDecision(_container!);
  } else {
    router.push('annual_review');
  }
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function npcLabel(id: string): string {
  return id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

function injectStyles(): void {
  if (document.getElementById('dc-styles')) return;
  const style = document.createElement('style');
  style.id = 'dc-styles';
  style.textContent = `
.dc-wrap {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: var(--space-6) var(--space-6) 0;
  box-sizing: border-box;
  max-width: 1100px;
  margin: 0 auto;
}
.dc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
}
.dc-header-left { display: flex; gap: var(--space-2); align-items: center; }
.dc-pill {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-base);
  padding: 2px var(--space-2);
}
.dc-pill-cat {
  color: var(--color-text-accent);
  border-color: var(--color-accent-default);
  background: transparent;
}
.dc-player-tag {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-disabled);
  letter-spacing: .04em;
}
.dc-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
  align-items: start;
  flex: 1;
}
@media (max-width: 720px) {
  .dc-body { grid-template-columns: 1fr; }
}
.dc-setup { padding-right: var(--space-4); }
.dc-setup-title {
  font-family: var(--font-ui);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-4);
  letter-spacing: .02em;
}
.dc-setup-body { display: flex; flex-direction: column; gap: var(--space-3); }
.dc-setup-para {
  font-family: var(--font-narrative);
  font-size: var(--text-sm);
  line-height: 1.65;
  color: var(--color-text-secondary);
  margin: 0;
}
.dc-npc-tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-top: var(--space-5);
}
.dc-npc-tag {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border-subtle);
  border-radius: 2px;
  padding: 2px var(--space-2);
}
.dc-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.dc-option {
  width: 100%;
  text-align: left;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-base);
  padding: var(--space-4);
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    background   var(--transition-fast),
    opacity      var(--transition-fast);
}
.dc-option:hover:not(:disabled) {
  border-color: var(--color-accent-default);
  background: var(--color-surface-overlay);
}
.dc-option:focus-visible {
  outline: 2px solid var(--color-accent-default);
  outline-offset: 2px;
}
.dc-option--chosen {
  border-color: var(--color-accent-default);
  background: var(--color-surface-overlay);
}
.dc-option--dimmed { opacity: 0.35; }
.dc-option-header {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}
.dc-option-id {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-accent);
  font-weight: var(--weight-semibold);
  letter-spacing: .06em;
  min-width: 1.2rem;
}
.dc-option-label {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-primary);
}
.dc-option-text {
  font-family: var(--font-narrative);
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0;
}
.dc-drawer {
  margin-top: var(--space-6);
  padding: var(--space-5) var(--space-6);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-base);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity var(--transition-reveal), transform var(--transition-reveal);
}
.dc-drawer--visible {
  opacity: 1;
  transform: translateY(0);
}
.dc-monologue {
  font-family: var(--font-narrative);
  font-size: var(--text-base);
  font-style: italic;
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-4);
  line-height: 1.7;
}
.dc-deltas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}
.dc-delta {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  padding: 3px var(--space-3);
  border-radius: 2px;
  border: 1px solid transparent;
}
.dc-delta--pos {
  color: #4ade80;
  border-color: rgba(74,222,128,0.25);
  background: rgba(74,222,128,0.06);
}
.dc-delta--neg {
  color: #f87171;
  border-color: rgba(248,113,113,0.25);
  background: rgba(248,113,113,0.06);
}
.dc-consequence-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
.dc-ctag {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border-subtle);
  border-radius: 2px;
  padding: 2px var(--space-2);
}
.dc-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6) 0;
  margin-top: var(--space-4);
}
.dc-panel-nav {
  display: flex;
  gap: var(--space-4);
}
.dc-panel-link {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: .06em;
  text-transform: uppercase;
  padding: 2px 0;
  border-bottom: 1px solid transparent;
  cursor: pointer;
  color: var(--color-text-accent);
  border-color: var(--color-accent-default);
  text-decoration: none;
}
.dc-panel-link--disabled {
  color: var(--color-text-disabled);
  border-color: transparent;
  cursor: default;
  pointer-events: none;
}
.dc-continue-btn {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  background: var(--color-accent-default);
  color: var(--color-surface-base);
  border: 1px solid var(--color-accent-default);
  border-radius: var(--radius-base);
  padding: var(--space-3) var(--space-8);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
  min-width: 160px;
}
.dc-continue-btn:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}
.dc-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 100vh;
}
.dc-loading-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent-default);
  animation: dc-pulse 1.2s ease-in-out infinite;
  opacity: 0.4;
}
.dc-loading-dot:nth-child(2) { animation-delay: .2s; }
.dc-loading-dot:nth-child(3) { animation-delay: .4s; }
@keyframes dc-pulse {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50%       { opacity: 1;   transform: scale(1);   }
}
.dc-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: var(--space-4);
}
.dc-error-msg {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: #f87171;
  text-align: center;
}
.dc-ghost-btn {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  background: none;
  border: 1px solid var(--color-border-default);
  color: var(--color-text-muted);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-base);
  cursor: pointer;
}
/* ── Year progress strip ── */
.dc-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}
.dc-year-progress {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.dc-progress-dots {
  display: flex;
  gap: 5px;
  align-items: center;
}
.dc-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border-default);
  transition: background var(--transition-fast);
}
.dc-dot--done {
  background: var(--color-accent-default);
  opacity: 0.45;
}
.dc-dot--active {
  background: var(--color-accent-default);
  width: 10px;
  height: 10px;
}
.dc-progress-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  white-space: nowrap;
}
`;
  document.head.appendChild(style);
}
