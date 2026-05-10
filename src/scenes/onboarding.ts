// ASCEND — Scene: Onboarding Wizard (task 1.5)
// 5 steps: name+pronouns → background → traits → work-style preview → first-day letter
// On complete: writes fully-initialised GameState and routes to #decision.

import { loadBackgrounds, loadTraits } from '../data';
import type { Background, Trait, CognitiveAxisDeltas } from '../data';
import { createInitialState, setPlayer, updateStats, updateAxes, logEvent } from '../core/state';
import type { GameState } from '../core/state';
import type { StatKey, AxisKey } from '../core/constants';
import { saveState } from '../utils/storage';
import { router } from '../core/router';

// ─────────────────────────────────────────────
// LOCAL STATE
// ─────────────────────────────────────────────

interface WizardState {
  step:         1 | 2 | 3 | 4 | 5;
  name:         string;
  pronouns:     string;
  backgroundId: string;
  traitIds:     string[];
  backgrounds:  Background[];
  traits:       Trait[];
}

const PRONOUN_OPTIONS = ['He/Him', 'She/Her', 'They/Them', 'Ze/Zir', 'Custom'];
const TRAIT_COUNT     = 3;

let _container: HTMLElement | null = null;
let _wizard: WizardState           = fresh();

function fresh(): WizardState {
  return { step: 1, name: '', pronouns: 'They/Them', backgroundId: '', traitIds: [], backgrounds: [], traits: [] };
}

// ─────────────────────────────────────────────
// AXIS MAPPING (trait JSON keys → AxisKey)
// ─────────────────────────────────────────────

const AXIS_MAP: Record<string, AxisKey> = {
  socialEnergy:   'collaborative_independent',
  signalReading:  'analytical_intuitive',
  decisionLens:   'cautious_bold',
  operatingStyle: 'systemic_tactical',
};

function mapAxisDeltas(cog: CognitiveAxisDeltas): Partial<Record<AxisKey, number>> {
  const out: Partial<Record<AxisKey, number>> = {};
  for (const [k, v] of Object.entries(cog)) {
    const axis = AXIS_MAP[k];
    if (axis !== undefined && typeof v === 'number') {
      out[axis] = (out[axis] ?? 0) + v;
    }
  }
  return out;
}

// ─────────────────────────────────────────────
// MOUNT / UNMOUNT
// ─────────────────────────────────────────────

export async function mountOnboarding(container: HTMLElement): Promise<void> {
  _container = container;
  _wizard    = fresh();

  injectStyles();
  container.innerHTML = `<div class="ob-wrap"><p class="ob-loading">Loading…</p></div>`;

  const [bgFile, traitFile] = await Promise.all([loadBackgrounds(), loadTraits()]);
  _wizard.backgrounds = bgFile.backgrounds;
  _wizard.traits      = traitFile.traits;

  render();
}

export function unmountOnboarding(): void {
  _container = null;
  document.getElementById('ob-styles')?.remove();
}

// ─────────────────────────────────────────────
// RENDER DISPATCH
// ─────────────────────────────────────────────

function render(): void {
  if (!_container) return;
  const wrap = _container.querySelector('.ob-wrap') ?? (() => {
    const d = document.createElement('div');
    d.className = 'ob-wrap';
    _container!.appendChild(d);
    return d;
  })();

  wrap.innerHTML = `
    ${progress()}
    <div class="ob-body" id="ob-body">
      ${stepContent()}
    </div>
    ${nav()}
  `;

  wireNav();
  wireStep();

  // Fade in
  const body = document.getElementById('ob-body');
  if (body) {
    body.style.opacity = '0';
    requestAnimationFrame(() => requestAnimationFrame(() => { body.style.opacity = '1'; }));
  }
}

// ─────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────

function progress(): string {
  const labels = ['Identity', 'Background', 'Traits', 'Profile', 'Welcome'];
  return `
<div class="ob-progress">
  ${labels.map((l, i) => `
  <div class="ob-step-pip ${i + 1 < _wizard.step ? 'done' : ''} ${i + 1 === _wizard.step ? 'active' : ''}">
    <div class="ob-pip-dot"></div>
    <span class="ob-pip-label">${l}</span>
  </div>`).join('<div class="ob-pip-line"></div>')}
</div>`;
}

// ─────────────────────────────────────────────
// NAV BUTTONS
// ─────────────────────────────────────────────

function nav(): string {
  const isFirst = _wizard.step === 1;
  const isLast  = _wizard.step === 5;
  const nextLabel = isLast ? 'Enter AUREL →' : 'Next →';
  const canNext = canAdvance();

  return `
<div class="ob-nav">
  <button class="ob-btn ob-btn-ghost" id="ob-back">← Back</button>
  <button class="ob-btn ob-btn-primary" id="ob-next" ${canNext ? '' : 'disabled'}>${nextLabel}</button>
</div>`;
}

function canAdvance(): boolean {
  switch (_wizard.step) {
    case 1: return _wizard.name.trim().length >= 2;
    case 2: return _wizard.backgroundId !== '';
    case 3: return _wizard.traitIds.length === TRAIT_COUNT;
    case 4: return true;
    case 5: return true;
  }
}

// ─────────────────────────────────────────────
// STEP CONTENT
// ─────────────────────────────────────────────

function stepContent(): string {
  switch (_wizard.step) {
    case 1: return step1();
    case 2: return step2();
    case 3: return step3();
    case 4: return step4();
    case 5: return step5();
  }
}

// ── Step 1: Name + Pronouns ──

function step1(): string {
  return `
<div class="ob-step">
  <p class="ob-eyebrow">Step 1 of 5</p>
  <h1 class="ob-heading">Who are you?</h1>
  <p class="ob-subheading">You'll go by this name in AUREL London. Your colleagues will use it from day one.</p>
  <div class="ob-field">
    <label class="ob-label" for="ob-name">Your name</label>
    <input class="ob-input" id="ob-name" type="text" maxlength="40"
      placeholder="Enter your name" value="${esc(_wizard.name)}" autocomplete="off" spellcheck="false">
  </div>
  <div class="ob-field">
    <label class="ob-label">Pronouns</label>
    <div class="ob-pronoun-row">
      ${PRONOUN_OPTIONS.map(p => `
      <button class="ob-pronoun-btn ${_wizard.pronouns === p ? 'selected' : ''}" data-pronoun="${p}">${p}</button>`).join('')}
    </div>
    ${_wizard.pronouns === 'Custom'
      ? `<input class="ob-input ob-input-sm" id="ob-custom-pronoun" type="text" maxlength="30"
           placeholder="e.g. Fae/Faer" value="${_wizard.pronouns !== 'Custom' ? '' : ''}">`
      : ''}
  </div>
</div>`;
}

// ── Step 2: Background ──

function step2(): string {
  return `
<div class="ob-step">
  <p class="ob-eyebrow">Step 2 of 5</p>
  <h1 class="ob-heading">Where are you coming from?</h1>
  <p class="ob-subheading">Your background shapes your starting position. It doesn't define your ceiling.</p>
  <div class="ob-bg-grid">
    ${_wizard.backgrounds.map(bg => {
      const sel = _wizard.backgroundId === bg.id;
      const gains = bg.primaryBonuses.filter(b => b.delta > 0).map(b => `+${b.delta} ${formatStat(b.stat)}`).join(' · ');
      return `
    <button class="ob-bg-card ${sel ? 'selected' : ''}" data-bg="${bg.id}">
      <p class="ob-bg-name">${bg.name}</p>
      <p class="ob-bg-tagline">${bg.tagline}</p>
      <p class="ob-bg-stats">${gains}</p>
    </button>`;
    }).join('')}
  </div>
</div>`;
}

// ── Step 3: Traits ──

function step3(): string {
  const remaining = TRAIT_COUNT - _wizard.traitIds.length;
  const countMsg  = remaining === 0
    ? 'All three selected.'
    : `Choose ${remaining} more trait${remaining === 1 ? '' : 's'}.`;

  return `
<div class="ob-step">
  <p class="ob-eyebrow">Step 3 of 5</p>
  <h1 class="ob-heading">How do you operate?</h1>
  <p class="ob-subheading">${countMsg}</p>
  <div class="ob-trait-grid">
    ${_wizard.traits.map(t => {
      const sel      = _wizard.traitIds.includes(t.id);
      const maxed    = !sel && _wizard.traitIds.length >= TRAIT_COUNT;
      return `
    <button class="ob-trait-card ${sel ? 'selected' : ''} ${maxed ? 'maxed' : ''}"
      data-trait="${t.id}" ${maxed ? 'disabled' : ''}>
      <p class="ob-trait-text">${t.displayText}</p>
      <p class="ob-trait-context">${t.selectionContext}</p>
    </button>`;
    }).join('')}
  </div>
</div>`;
}

// ── Step 4: Work-style Preview ──

function step4(): string {
  const bg     = _wizard.backgrounds.find(b => b.id === _wizard.backgroundId);
  const traits = _wizard.traitIds.map(id => _wizard.traits.find(t => t.id === id)).filter(Boolean) as Trait[];

  const para = bg
    ? [
        bg.workStyleFragments.opening,
        traits[0]?.workStyleFragment ?? bg.workStyleFragments.middle,
        bg.workStyleFragments.middle,
        traits[1]?.workStyleFragment ?? '',
        bg.workStyleFragments.closing,
      ].filter(Boolean).join(' ')
    : '';

  return `
<div class="ob-step ob-step-preview">
  <p class="ob-eyebrow">Step 4 of 5</p>
  <h1 class="ob-heading">Your working profile</h1>
  <p class="ob-subheading">Based on your background and the way you operate.</p>
  <div class="ob-profile-card">
    <div class="ob-profile-header">
      <div>
        <p class="ob-profile-name">${esc(_wizard.name)}</p>
        <p class="ob-profile-role">${bg?.startingRole ?? 'Associate'} · ${_wizard.pronouns}</p>
      </div>
      <div class="ob-profile-bg-badge">${bg?.name ?? ''}</div>
    </div>
    <div class="ob-profile-divider"></div>
    <p class="ob-profile-para">${esc(para)}</p>
    <div class="ob-profile-traits">
      ${traits.map(t => `<span class="ob-trait-chip">${t.displayText.split('.')[0] ?? t.displayText}</span>`).join('')}
    </div>
  </div>
  <p class="ob-preview-note">This profile is yours alone. AUREL will form its own opinion.</p>
</div>`;
}

// ── Step 5: First-Day Letter ──

function step5(): string {
  const bg       = _wizard.backgrounds.find(b => b.id === _wizard.backgroundId);
  const formal   = bg?.firstDayLetterVariant === 'formal_welcome';
  const greeting = formal
    ? `Dear ${esc(_wizard.name)},`
    : `${esc(_wizard.name)} —`;

  const opening = formal
    ? `On behalf of the Workplace Experience team at AUREL London, welcome. Your start date marks the beginning of what we hope will be a significant tenure with this company.`
    : `Welcome to AUREL London. We'll skip the usual speech. You know what you signed up for, roughly.`;

  return `
<div class="ob-step ob-step-letter">
  <p class="ob-eyebrow">Step 5 of 5</p>
  <h1 class="ob-heading">Your first day</h1>
  <div class="ob-letter">
    <div class="ob-letter-header">
      <span class="ob-letter-from">AUREL London · Workplace Experience</span>
      <span class="ob-letter-date">3 March 2034</span>
    </div>
    <div class="ob-letter-body">
      <p class="ob-letter-greeting">${greeting}</p>
      <p>${opening}</p>
      <p>You've been assigned to ${bg?.startingRole ?? 'the Associate track'}, King's Cross. Your line manager is Dana Sutcliffe. Your first team sync is at 09:30.</p>
      <p>A few things worth knowing on arrival: the building has four floors and a basement that officially does not exist for meetings. The coffee on Level 3 is better than Level 2. The Level 2 coffee is where deals get made. You will figure out which one you are.</p>
      <p>We don't do a formal induction. The assumption is that you are already the person AUREL hired. If that turns out not to be the case, you'll know before we tell you.</p>
      <p>Everything from this point is on the record.</p>
      <p class="ob-letter-sign">Workplace Experience<br>AUREL London</p>
    </div>
    <div class="ob-letter-footer">
      <span>AUREL · King's Cross · London N1C 4DN · 2034</span>
    </div>
  </div>
</div>`;
}

// ─────────────────────────────────────────────
// WIRE INTERACTIONS
// ─────────────────────────────────────────────

function wireNav(): void {
  document.getElementById('ob-back')?.addEventListener('click', () => {
    if (_wizard.step > 1) {
      _wizard = { ..._wizard, step: (_wizard.step - 1) as WizardState['step'] };
      render();
    } else {
      router.push('landing');
    }
  });

  document.getElementById('ob-next')?.addEventListener('click', () => {
    if (!canAdvance()) return;
    if (_wizard.step < 5) {
      _wizard = { ..._wizard, step: (_wizard.step + 1) as WizardState['step'] };
      render();
    } else {
      complete();
    }
  });
}

function wireStep(): void {
  switch (_wizard.step) {
    case 1: wire1(); break;
    case 2: wire2(); break;
    case 3: wire3(); break;
  }
}

function wire1(): void {
  const nameInput = document.getElementById('ob-name') as HTMLInputElement | null;
  nameInput?.addEventListener('input', () => {
    _wizard.name = nameInput.value;
    refreshNav();
  });
  nameInput?.focus();

  document.querySelectorAll<HTMLButtonElement>('.ob-pronoun-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _wizard.pronouns = btn.dataset['pronoun'] ?? _wizard.pronouns;
      render();
    });
  });
}

function wire2(): void {
  document.querySelectorAll<HTMLButtonElement>('.ob-bg-card').forEach(card => {
    card.addEventListener('click', () => {
      _wizard.backgroundId = card.dataset['bg'] ?? '';
      render();
    });
  });
}

function wire3(): void {
  document.querySelectorAll<HTMLButtonElement>('.ob-trait-card:not([disabled])').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset['trait'] ?? '';
      if (_wizard.traitIds.includes(id)) {
        _wizard.traitIds = _wizard.traitIds.filter(t => t !== id);
      } else if (_wizard.traitIds.length < TRAIT_COUNT) {
        _wizard.traitIds = [..._wizard.traitIds, id];
      }
      render();
    });
  });
}

function refreshNav(): void {
  const nextBtn = document.getElementById('ob-next') as HTMLButtonElement | null;
  if (nextBtn) nextBtn.disabled = !canAdvance();
}

// ─────────────────────────────────────────────
// COMPLETE — build GameState and save
// ─────────────────────────────────────────────

function complete(): void {
  const bg     = _wizard.backgrounds.find(b => b.id === _wizard.backgroundId);
  const traits = _wizard.traitIds.map(id => _wizard.traits.find(t => t.id === id)).filter(Boolean) as Trait[];

  let state: GameState = createInitialState();

  // Player identity
  state = setPlayer(state, {
    name:         _wizard.name.trim(),
    pronouns:     _wizard.pronouns,
    backgroundId: _wizard.backgroundId,
    traitIds:     _wizard.traitIds,
  });

  // Background stat bonuses
  if (bg) {
    const statDeltas: Partial<Record<StatKey, number>> = {};
    for (const bonus of [...bg.primaryBonuses, ...bg.secondaryBonuses]) {
      statDeltas[bonus.stat] = (statDeltas[bonus.stat] ?? 0) + bonus.delta;
    }
    state = updateStats(state, statDeltas);
    state = logEvent(state, `Background applied: ${bg.name}`);
  }

  // Trait cognitive axis deltas
  let combinedAxes: Partial<Record<AxisKey, number>> = {};
  for (const trait of traits) {
    const deltas = mapAxisDeltas(trait.cognitiveAxisDeltas);
    for (const [k, v] of Object.entries(deltas) as [AxisKey, number][]) {
      combinedAxes[k] = (combinedAxes[k] ?? 0) + v;
    }
    state = logEvent(state, `Trait applied: ${trait.id}`);
  }
  state = updateAxes(state, combinedAxes);

  saveState(state);
  router.push('decision');
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatStat(stat: string): string {
  return stat.replace(/([A-Z])/g, ' $1').trim();
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

function injectStyles(): void {
  document.getElementById('ob-styles')?.remove();
  const style = document.createElement('style');
  style.id    = 'ob-styles';
  style.textContent = `
    .ob-wrap {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      max-width: 760px;
      margin: 0 auto;
      padding: var(--space-8) var(--space-6) var(--space-12);
      box-sizing: border-box;
    }

    /* Progress */
    .ob-progress {
      display: flex;
      align-items: center;
      margin-bottom: var(--space-12);
    }
    .ob-step-pip {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
    }
    .ob-pip-dot {
      width: 8px;
      height: 8px;
      border-radius: var(--radius-full);
      background: var(--color-border-default);
      transition: background var(--transition-standard);
    }
    .ob-step-pip.active .ob-pip-dot  { background: var(--color-accent-default); }
    .ob-step-pip.done .ob-pip-dot    { background: var(--color-accent-default); opacity: 0.4; }
    .ob-pip-label {
      font-family: var(--font-ui);
      font-size: var(--text-2xs);
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      color: var(--color-text-muted);
    }
    .ob-step-pip.active .ob-pip-label { color: var(--color-text-accent); }
    .ob-pip-line {
      flex: 1;
      height: 1px;
      background: var(--color-border-subtle);
      margin: 0 var(--space-2);
      margin-bottom: 18px;
    }

    /* Body */
    .ob-body {
      flex: 1;
      transition: opacity var(--transition-reveal);
    }
    .ob-step { padding-bottom: var(--space-8); }
    .ob-eyebrow {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      letter-spacing: var(--tracking-widest);
      text-transform: uppercase;
      color: var(--color-text-accent);
      margin-bottom: var(--space-3);
    }
    .ob-heading {
      font-family: var(--font-ui);
      font-size: var(--text-3xl);
      font-weight: var(--weight-bold);
      color: var(--color-text-primary);
      letter-spacing: var(--tracking-tight);
      line-height: var(--leading-tight);
      margin-bottom: var(--space-3);
    }
    .ob-subheading {
      font-family: var(--font-narrative);
      font-size: var(--text-md);
      color: var(--color-text-muted);
      line-height: var(--leading-relaxed);
      margin-bottom: var(--space-8);
    }

    /* Fields */
    .ob-field { margin-bottom: var(--space-6); }
    .ob-label {
      display: block;
      font-family: var(--font-ui);
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      color: var(--color-text-muted);
      margin-bottom: var(--space-2);
    }
    .ob-input {
      width: 100%;
      max-width: 400px;
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-base);
      color: var(--color-text-primary);
      font-family: var(--font-ui);
      font-size: var(--text-base);
      padding: var(--space-3) var(--space-4);
      outline: none;
      transition: border-color var(--transition-fast);
      box-sizing: border-box;
    }
    .ob-input:focus { border-color: var(--color-accent-default); }
    .ob-input-sm { margin-top: var(--space-3); max-width: 260px; font-size: var(--text-sm); }
    .ob-pronoun-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    .ob-pronoun-btn {
      font-family: var(--font-ui);
      font-size: var(--text-sm);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-base);
      border: 1px solid var(--color-border-default);
      background: var(--color-surface-raised);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .ob-pronoun-btn:hover   { border-color: var(--color-border-strong); color: var(--color-text-primary); }
    .ob-pronoun-btn.selected {
      border-color: var(--color-accent-default);
      background: var(--color-accent-subtle);
      color: var(--color-text-primary);
    }

    /* Background grid */
    .ob-bg-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-3);
    }
    .ob-bg-card {
      text-align: left;
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);
      padding: var(--space-4) var(--space-5);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .ob-bg-card:hover    { border-color: var(--color-border-strong); background: var(--color-surface-overlay); }
    .ob-bg-card.selected { border-color: var(--color-accent-default); background: var(--color-accent-subtle); }
    .ob-bg-name {
      font-family: var(--font-ui);
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--color-text-primary);
      margin-bottom: var(--space-1);
    }
    .ob-bg-tagline {
      font-family: var(--font-narrative);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      line-height: var(--leading-snug);
      margin-bottom: var(--space-3);
    }
    .ob-bg-stats {
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      color: var(--color-text-accent);
      letter-spacing: var(--tracking-wide);
    }

    /* Trait grid */
    .ob-trait-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--space-3);
    }
    .ob-trait-card {
      text-align: left;
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);
      padding: var(--space-4) var(--space-5);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .ob-trait-card:hover    { border-color: var(--color-border-strong); background: var(--color-surface-overlay); }
    .ob-trait-card.selected { border-color: var(--color-accent-default); background: var(--color-accent-subtle); }
    .ob-trait-card.maxed   { opacity: 0.35; cursor: not-allowed; }
    .ob-trait-text {
      font-family: var(--font-narrative);
      font-size: var(--text-sm);
      font-weight: var(--weight-regular);
      color: var(--color-text-primary);
      line-height: var(--leading-snug);
      margin-bottom: var(--space-2);
    }
    .ob-trait-context {
      font-family: var(--font-ui);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      line-height: var(--leading-normal);
    }

    /* Work-style preview */
    .ob-profile-card {
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      margin-bottom: var(--space-4);
    }
    .ob-profile-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-4);
    }
    .ob-profile-name {
      font-family: var(--font-ui);
      font-size: var(--text-xl);
      font-weight: var(--weight-semibold);
      color: var(--color-text-primary);
    }
    .ob-profile-role {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      margin-top: var(--space-1);
    }
    .ob-profile-bg-badge {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      letter-spacing: var(--tracking-wide);
      color: var(--color-text-accent);
      border: 1px solid var(--color-accent-default);
      border-radius: var(--radius-full);
      padding: var(--space-1) var(--space-3);
      white-space: nowrap;
    }
    .ob-profile-divider {
      height: 1px;
      background: var(--color-border-subtle);
      margin-bottom: var(--space-4);
    }
    .ob-profile-para {
      font-family: var(--font-narrative);
      font-size: var(--text-md);
      line-height: var(--leading-relaxed);
      color: var(--color-text-primary);
      margin-bottom: var(--space-4);
    }
    .ob-profile-traits { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .ob-trait-chip {
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      letter-spacing: var(--tracking-wide);
      color: var(--color-text-muted);
      background: var(--color-surface-base);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-full);
      padding: var(--space-1) var(--space-3);
    }
    .ob-preview-note {
      font-family: var(--font-narrative);
      font-size: var(--text-sm);
      font-style: italic;
      color: var(--color-text-muted);
    }

    /* First-day letter */
    .ob-letter {
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .ob-letter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--color-border-subtle);
      background: var(--color-surface-overlay);
    }
    .ob-letter-from {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      color: var(--color-text-accent);
    }
    .ob-letter-date {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
    .ob-letter-body {
      padding: var(--space-8) var(--space-8);
      font-family: var(--font-narrative);
      font-size: var(--text-md);
      line-height: var(--leading-relaxed);
      color: var(--color-text-primary);
    }
    .ob-letter-body p { margin-bottom: var(--space-4); }
    .ob-letter-greeting {
      font-weight: var(--weight-medium);
      margin-bottom: var(--space-6) !important;
    }
    .ob-letter-sign {
      margin-top: var(--space-6) !important;
      color: var(--color-text-muted);
      font-style: italic;
    }
    .ob-letter-footer {
      padding: var(--space-3) var(--space-6);
      border-top: 1px solid var(--color-border-subtle);
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      color: var(--color-text-disabled);
      letter-spacing: var(--tracking-wide);
    }

    /* Nav */
    .ob-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--space-8);
      border-top: 1px solid var(--color-border-subtle);
      margin-top: var(--space-8);
    }
    .ob-btn {
      font-family: var(--font-ui);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      padding: var(--space-3) var(--space-8);
      border-radius: var(--radius-base);
      cursor: pointer;
      border: 1px solid transparent;
      transition: all var(--transition-fast);
      min-width: 120px;
      text-align: center;
    }
    .ob-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .ob-btn-primary {
      background: var(--color-accent-default);
      color: var(--color-surface-base);
      border-color: var(--color-accent-default);
    }
    .ob-btn-primary:not(:disabled):hover {
      background: var(--color-accent-hover);
      border-color: var(--color-accent-hover);
    }
    .ob-btn-ghost {
      background: transparent;
      color: var(--color-text-secondary);
      border-color: var(--color-border-default);
    }
    .ob-btn-ghost:not(:disabled):hover {
      background: var(--color-surface-raised);
      border-color: var(--color-border-strong);
    }
    .ob-loading {
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      padding: var(--space-20);
      text-align: center;
    }
  `;
  document.head.appendChild(style);
}
