// ASCEND — People Panel (task 1.9)
// NPC list with relationship bands, sort controls, expandable detail cards.
// Tier 1 NPCs loaded from JSON; relationships read from GameState.

import { loadTier1Npcs } from '../data';
import type { NpcDefinition } from '../data';
import { loadState } from '../utils/storage';
import { router } from '../core/router';

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

const BAND_LABELS: Record<Band, string> = {
  cold:       'Cold',
  functional: 'Functional',
  warm:       'Warm',
  trusted:    'Trusted',
};

// Avatar background colours per band
const BAND_AVATAR_BG: Record<Band, string> = {
  cold:       '#374151',
  functional: '#4B5563',
  warm:       '#92400e',
  trusted:    'var(--color-accent-default)',
};

// ─────────────────────────────────────────────
// LOCAL STATE
// ─────────────────────────────────────────────

type SortKey = 'score' | 'name';

interface PanelState {
  npcs:       NpcDefinition[];
  scores:     Record<string, number>;
  sort:       SortKey;
  selected:   string | null;   // npc id
}

let _panel: PanelState = { npcs: [], scores: {}, sort: 'score', selected: null };
let _container: HTMLElement | null = null;

// ─────────────────────────────────────────────
// MOUNT / UNMOUNT
// ─────────────────────────────────────────────

export async function mountPeoplePanel(container: HTMLElement): Promise<void> {
  _container = container;
  _panel = { npcs: [], scores: {}, sort: 'score', selected: null };

  injectStyles();
  container.innerHTML = `<div class="pp-loading"><span class="pp-dot"></span><span class="pp-dot"></span><span class="pp-dot"></span></div>`;

  const state = loadState();
  const scores: Record<string, number> = {};

  try {
    const npcs = await loadTier1Npcs();
    // Build score map: use saved relationship or default 50
    for (const npc of npcs) {
      scores[npc.id] = state?.npcRelationships[npc.id] ?? 50;
    }
    _panel = { npcs, scores, sort: 'score', selected: null };
    render();
  } catch (e) {
    container.innerHTML = `
<div class="pp-error">
  <p>Could not load people: ${String(e)}</p>
  <button onclick="history.back()" class="pp-back-btn">Back</button>
</div>`;
  }
}

export function unmountPeoplePanel(): void {
  document.getElementById('pp-styles')?.remove();
  const stored = (_container as (HTMLElement & { _ppKeyDown?: (e: KeyboardEvent) => void }) | null);
  if (stored?._ppKeyDown) document.removeEventListener('keydown', stored._ppKeyDown);
  _container = null;
}

export async function mount(container: HTMLElement): Promise<void> {
  return mountPeoplePanel(container);
}
export async function unmount(): Promise<void> {
  unmountPeoplePanel();
}

// ─────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────

function render(): void {
  if (!_container) return;

  const state     = loadState();
  const year      = state?.year ?? 1;
  const qIdx      = state?.questionIndex ?? 0;
  const qLabel    = qIdx > 0 ? `Q${qIdx}` : 'Start';
  const sorted    = sortedNpcs();

  _container.innerHTML = `
<div class="pp-wrap">
  <aside class="pp-panel" role="complementary" aria-label="People panel">

    <div class="pp-header">
      <div class="pp-header-left">
        <span class="pp-title">People</span>
        <span class="pp-subtitle">YEAR ${year} · ${qLabel}</span>
      </div>
      <div class="pp-header-actions">
        <button class="pp-close" id="pp-close" aria-label="Close panel">✕</button>
      </div>
    </div>

    <div class="pp-sort-bar">
      <span class="pp-sort-label">Sort</span>
      <div class="pp-sort-pills">
        <button class="pp-sort-pill ${_panel.sort === 'score' ? 'active' : ''}" data-sort="score" aria-pressed="${_panel.sort === 'score'}">Relationship</button>
        <button class="pp-sort-pill ${_panel.sort === 'name'  ? 'active' : ''}" data-sort="name" aria-pressed="${_panel.sort === 'name'}">Name</button>
      </div>
    </div>

    <div class="pp-body">
      <ul class="pp-list" role="list">
        ${sorted.map(npc => npcRow(npc)).join('')}
      </ul>
    </div>

  </aside>
</div>`;

  wire();
}

// ─────────────────────────────────────────────
// NPC ROW
// ─────────────────────────────────────────────

function npcRow(npc: NpcDefinition): string {
  const score    = _panel.scores[npc.id] ?? 50;
  const band     = getBand(score);
  const initials = npc.name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase();
  const isSelected = _panel.selected === npc.id;
  const relPct   = Math.max(0, Math.min(100, score));

  return `
<li class="pp-npc-row band-${band} ${isSelected ? 'selected' : ''}" data-id="${npc.id}" role="listitem">
  <div class="pp-npc-avatar" style="background:${BAND_AVATAR_BG[band]}">${initials}</div>
  <div class="pp-npc-info">
    <div class="pp-npc-name-row">
      <span class="pp-npc-name">${npc.name}</span>
      <span class="pp-npc-role-tag">${npc.ladderTitle}</span>
    </div>
    <div class="pp-npc-rel-wrap">
      <div class="pp-npc-rel-track">
        <div class="pp-npc-rel-fill" style="width:${relPct}%"></div>
      </div>
      <span class="pp-npc-score">${score}</span>
    </div>
    <p class="pp-npc-archetype">${npc.archetype}</p>
  </div>
  <span class="pp-band-badge">${BAND_LABELS[band]}</span>
</li>
${isSelected ? detailCard(npc, score, band) : ''}`;
}

function detailCard(npc: NpcDefinition, score: number, band: Band): string {
  return `
<li class="pp-detail visible" role="listitem" aria-live="polite">
  <p class="pp-detail-role">${npc.publicRole}</p>
  <div class="pp-detail-meta">
    <span class="pp-detail-chip">Archetype: ${npc.archetype}</span>
    <span class="pp-detail-chip band-chip-${band}">${BAND_LABELS[band]} · ${score}</span>
  </div>
  <p class="pp-detail-contradiction">${npc.contradiction}</p>
</li>`;
}

// ─────────────────────────────────────────────
// SORT
// ─────────────────────────────────────────────

function sortedNpcs(): NpcDefinition[] {
  return [..._panel.npcs].sort((a, b) => {
    if (_panel.sort === 'score') {
      return (_panel.scores[b.id] ?? 50) - (_panel.scores[a.id] ?? 50);
    }
    return a.name.localeCompare(b.name);
  });
}

// ─────────────────────────────────────────────
// WIRE
// ─────────────────────────────────────────────

function wire(): void {
  document.getElementById('pp-close')?.addEventListener('click', () => {
    router.push('decision');
  });

  // Keyboard: Escape closes panel
  function onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') router.push('decision');
  }
  document.addEventListener('keydown', onKeyDown);
  (_container as HTMLElement & { _ppKeyDown?: typeof onKeyDown })._ppKeyDown = onKeyDown;

  document.querySelectorAll<HTMLButtonElement>('.pp-sort-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      _panel = { ..._panel, sort: btn.dataset['sort'] as SortKey, selected: null };
      render();
    });
  });

  document.querySelectorAll<HTMLLIElement>('.pp-npc-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.dataset['id'] ?? '';
      _panel = { ..._panel, selected: _panel.selected === id ? null : id };
      render();
    });
  });
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

function injectStyles(): void {
  if (document.getElementById('pp-styles')) return;
  const style = document.createElement('style');
  style.id = 'pp-styles';
  style.textContent = `
.pp-wrap {
  display: flex;
  align-items: stretch;
  min-height: 100vh;
  justify-content: flex-end;
}
.pp-panel {
  width: 380px;
  flex-shrink: 0;
  background: var(--color-surface-raised);
  border-left: 1px solid var(--color-border-subtle);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  animation: pp-slide-in 0.22s var(--easing-enter) both;
}
@keyframes pp-slide-in {
  from { transform: translateX(24px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
@media (max-width: 600px) {
  .pp-panel { width: 100%; border-left: none; }
}
/* Header */
.pp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border-subtle);
  flex-shrink: 0;
}
.pp-header-left { display: flex; flex-direction: column; gap: 2px; }
.pp-title {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text-primary);
  letter-spacing: .06em;
  text-transform: uppercase;
}
.pp-subtitle {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: var(--color-text-muted);
  letter-spacing: .08em;
  text-transform: uppercase;
}
.pp-close {
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
.pp-close:hover { border-color: var(--color-border-strong); color: var(--color-text-primary); }
/* Sort bar */
.pp-sort-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--color-border-subtle);
  flex-shrink: 0;
}
.pp-sort-label {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: var(--color-text-muted);
  letter-spacing: .08em;
  text-transform: uppercase;
  white-space: nowrap;
}
.pp-sort-pills { display: flex; gap: var(--space-1); }
.pp-sort-pill {
  background: none;
  border: 1px solid var(--color-border-subtle);
  border-radius: 99px;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 2px var(--space-3);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: .06em;
  text-transform: uppercase;
  transition: all var(--transition-fast);
}
.pp-sort-pill.active {
  border-color: var(--color-accent-default);
  color: var(--color-accent-default);
  background: rgba(99,102,241,0.1);
}
.pp-sort-pill:hover:not(.active) {
  border-color: var(--color-border-default);
  color: var(--color-text-secondary);
}
/* Body */
.pp-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border-subtle) transparent;
}
.pp-list {
  list-style: none;
  margin: 0;
  padding: var(--space-2) 0;
}
/* NPC row */
.pp-npc-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  cursor: pointer;
  transition: background var(--transition-fast);
  position: relative;
}
.pp-npc-row:hover { background: rgba(255,255,255,0.03); }
.pp-npc-row.selected { background: rgba(99,102,241,0.06); }
.pp-npc-row.selected::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 2px;
  background: var(--color-accent-default);
}
/* Avatar */
.pp-npc-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-surface-base);
  position: relative;
  box-shadow: 0 0 0 2px var(--color-surface-raised);
}
.band-cold .pp-npc-avatar     { outline: 2px solid #374151; }
.band-functional .pp-npc-avatar{ outline: 2px solid #4B5563; }
.band-warm .pp-npc-avatar     { outline: 2px solid #d97706; }
.band-trusted .pp-npc-avatar  { outline: 2px solid var(--color-accent-default); }
/* NPC info */
.pp-npc-info { flex: 1; min-width: 0; }
.pp-npc-name-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: 3px;
}
.pp-npc-name {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pp-npc-role-tag {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}
.pp-npc-rel-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: 3px;
}
.pp-npc-rel-track {
  flex: 1;
  height: 3px;
  background: var(--color-border-subtle);
  border-radius: 99px;
  overflow: hidden;
}
.pp-npc-rel-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s var(--easing-enter);
}
.band-cold .pp-npc-rel-fill       { background: #4B5563; }
.band-functional .pp-npc-rel-fill  { background: #6B7280; }
.band-warm .pp-npc-rel-fill       { background: #d97706; }
.band-trusted .pp-npc-rel-fill    { background: var(--color-accent-default); }
.pp-npc-score {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  min-width: 22px;
  text-align: right;
}
.pp-npc-archetype {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: var(--color-text-disabled);
  margin: 0;
}
/* Band badge */
.pp-band-badge {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: .06em;
  text-transform: uppercase;
  padding: 2px var(--space-2);
  border-radius: 2px;
  border: 1px solid;
}
.band-cold .pp-band-badge       { color: #6B7280; border-color: #374151; background: #1F2937; }
.band-functional .pp-band-badge  { color: #9CA3AF; border-color: #4B5563; background: rgba(107,114,128,0.1); }
.band-warm .pp-band-badge       { color: #d97706; border-color: rgba(217,119,6,0.3); background: rgba(217,119,6,0.08); }
.band-trusted .pp-band-badge    { color: var(--color-accent-default); border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.08); }
/* Detail card */
.pp-detail {
  margin: 0 var(--space-5) var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface-overlay);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-base);
  animation: pp-detail-in 0.18s var(--easing-enter) both;
  list-style: none;
}
@keyframes pp-detail-in {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.pp-detail-role {
  font-family: var(--font-narrative);
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-3);
}
.pp-detail-meta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
}
.pp-detail-chip {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: .06em;
  text-transform: uppercase;
  padding: 2px var(--space-2);
  border: 1px solid var(--color-border-subtle);
  border-radius: 2px;
  color: var(--color-text-muted);
}
.pp-detail-contradiction {
  font-family: var(--font-narrative);
  font-size: var(--text-xs);
  font-style: italic;
  line-height: 1.6;
  color: var(--color-text-muted);
  margin: 0;
  border-left: 2px solid var(--color-border-default);
  padding-left: var(--space-3);
}
/* Loading */
.pp-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 100vh;
}
.pp-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--color-accent-default);
  opacity: 0.4;
  animation: pp-pulse 1.2s ease-in-out infinite;
}
.pp-dot:nth-child(2) { animation-delay: .2s; }
.pp-dot:nth-child(3) { animation-delay: .4s; }
@keyframes pp-pulse {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50%       { opacity: 1;   transform: scale(1); }
}
.pp-error, .pp-back-btn {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  min-height: 100vh; gap: var(--space-4);
  font-family: var(--font-mono); font-size: var(--text-sm);
  color: var(--color-text-muted);
}
`;
  document.head.appendChild(style);
}
