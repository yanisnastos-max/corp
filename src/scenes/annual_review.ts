// ASCEND — Annual Review (task 1.10)
// Two-column layout: Dana's assessment letter (left) + scorecard/formula/outcome (right).
// Computation is inline — no runtime fetch of review-rules.json required.
// Branch detection: Q10-D (honest read) and reliability_concern tag.

import { loadState, saveState } from '../utils/storage';
import { recordReview } from '../core/state';
import type { GameState } from '../core/state';
import { router } from '../core/router';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type DimensionBand = 'below_line' | 'in_discussion' | 'likely' | 'sponsor_dependent';
type Outcome       = 'promoted' | 'hold_stretch' | 'hold_standard' | 'below_line';

interface Scorecard {
  delivery:   DimensionBand;
  visibility: DimensionBand;
  trust:      DimensionBand;
  readiness:  DimensionBand;
}

interface ReviewComputed {
  attrAggregate:    number;   // 0–100
  perfScore:        number;   // 0–100
  sponsorScore:     number;   // 0–100 (relationship value)
  polScore:         number;   // 0–100 (weighted avg)
  compositeScore:   number;   // 0–100
  scorecard:        Scorecard;
  outcome:          Outcome;
  atLikelyPlus:     number;   // count of dimensions ≥ likely
  hasReliabilityConcern: boolean;
  q10DSelected:     boolean;
  danaTrusted:      boolean;  // dana relationship ≥ 50
}

// ─────────────────────────────────────────────
// MOUNT / UNMOUNT
// ─────────────────────────────────────────────

let _container: HTMLElement | null = null;
let _computed:  ReviewComputed  | null = null;
let _state:     GameState       | null = null;
let _settled    = false;   // true once player clicks "Begin Year N"

export function mountAnnualReview(container: HTMLElement): void {
  _container = container;
  _settled   = false;
  injectStyles();

  _state = loadState();
  if (!_state) {
    container.innerHTML = `
<div class="ar-error">No save found.
  <button onclick="history.back()">← Back</button>
</div>`;
    return;
  }

  _computed = compute(_state);
  render();

  requestAnimationFrame(() => {
    setTimeout(() => animateFormula(), 300);
  });
}

export function unmountAnnualReview(): void {
  document.getElementById('ar-styles')?.remove();
  _container = null;
  _computed  = null;
  _state     = null;
  _settled   = false;
}

// ─────────────────────────────────────────────
// COMPUTATION
// ─────────────────────────────────────────────

function compute(state: GameState): ReviewComputed {
  const s = state.stats;

  // 1. Attribute aggregate
  const remainingKeys = [
    'politicalAwareness', 'collaborativePull', 'adaptiveNerve',
    'marketSense', 'technicalCredibility', 'resilience', 'integrity',
  ] as const;
  const remainingAvg = remainingKeys.reduce((sum, k) => sum + (s[k] ?? 50), 0) / remainingKeys.length;
  const attrAggregate = Math.round(
    (s.executionDiscipline ?? 50) * 0.30 +
    (s.strategicInfluence  ?? 50) * 0.20 +
    (s.reputation          ?? 50) * 0.20 +
    remainingAvg                  * 0.30,
  );

  // 2. Performance score from consequence tags
  const tagWeights: Record<string, number> = {
    seen_by_sponsor:         8,
    high_cost_high_fidelity: 5,
    open_inquiry:            3,
    systemic_read:           2,
    reliability_concern:    -10,
    burned_peer:             -5,
  };
  let perfScore = 50;
  for (const tag of state.consequenceTags) {
    const w = tagWeights[tag];
    if (w !== undefined) perfScore += w;
  }
  perfScore = Math.max(0, Math.min(100, perfScore));

  // 3. Sponsor strength (Year 1–5: Dana Sutcliffe)
  const sponsorScore = state.npcRelationships['dana_sutcliffe'] ?? 50;

  // 4. Political capital (Conrad + Grace, equal weight)
  const conradScore = state.npcRelationships['conrad_mensah'] ?? 50;
  const graceScore  = state.npcRelationships['grace_oduya']   ?? 50;
  const polScore    = Math.round((conradScore + graceScore) / 2);

  // 5. Composite
  const compositeScore = Math.round(
    attrAggregate * 0.40 +
    perfScore     * 0.30 +
    sponsorScore  * 0.20 +
    polScore      * 0.10,
  );

  // 6. Scorecard dimensions
  const hasReliabilityConcern = state.consequenceTags.includes('reliability_concern');
  const integrity = s.integrity ?? 50;

  const delivery: DimensionBand =
    perfScore >= 80 ? 'sponsor_dependent' :
    perfScore >= 60 ? 'likely' :
    perfScore >= 40 ? 'in_discussion' : 'below_line';

  const visibility: DimensionBand =
    (s.strategicInfluence ?? 50) >= 75 ? 'sponsor_dependent' :
    (s.strategicInfluence ?? 50) >= 55 ? 'likely' :
    (s.strategicInfluence ?? 50) >= 35 ? 'in_discussion' : 'below_line';

  const trust: DimensionBand =
    (integrity >= 80 && sponsorScore >= 70 && !hasReliabilityConcern) ? 'sponsor_dependent' :
    (integrity >= 60 && !hasReliabilityConcern)                        ? 'likely' :
    (integrity >= 40 || hasReliabilityConcern)                         ? 'in_discussion' : 'below_line';

  const readiness: DimensionBand =
    attrAggregate >= 75 ? 'sponsor_dependent' :
    attrAggregate >= 60 ? 'likely' :
    attrAggregate >= 45 ? 'in_discussion' : 'below_line';

  const scorecard: Scorecard = { delivery, visibility, trust, readiness };

  const likelyPlus: DimensionBand[] = ['likely', 'sponsor_dependent'];
  const atLikelyPlus = Object.values(scorecard).filter(b => likelyPlus.includes(b)).length;

  const outcome: Outcome =
    atLikelyPlus >= 3                                             ? 'promoted' :
    atLikelyPlus === 2                                            ? 'hold_stretch' :
    Object.values(scorecard).some(b => b === 'below_line')        ? 'below_line' :
                                                                    'hold_standard';

  // Branch detection
  const q10Decision = state.decisions.find(d => d.questionId === 'y01q10');
  const q10DSelected = q10Decision?.optionId === 'D';
  const danaTrusted  = sponsorScore >= 50;

  return {
    attrAggregate, perfScore, sponsorScore, polScore, compositeScore,
    scorecard, outcome, atLikelyPlus, hasReliabilityConcern,
    q10DSelected, danaTrusted,
  };
}

// ─────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────

function render(): void {
  if (!_container || !_computed || !_state) return;
  const c = _computed;
  const state = _state;
  const year  = state.year;
  const calYear = 2033 + year;

  _container.innerHTML = `
<div class="ar-header">
  <div class="ar-header-left">
    <span class="ar-wordmark">AUREL</span>
    <div class="ar-h-divider"></div>
    <span class="ar-header-ctx">ANNUAL REVIEW · YEAR ${year} · ${calYear}</span>
  </div>
</div>

<div class="ar-page">

  <!-- LEFT: Assessment letter -->
  <div class="ar-assessment">
    <div class="ar-eyebrow">
      <span class="ar-eyebrow-label">Performance Assessment</span>
      <div class="ar-eyebrow-rule"></div>
      <span class="ar-eyebrow-date">December ${calYear}</span>
    </div>

    <div class="ar-from">
      <div class="ar-from-row">
        <span class="ar-from-key">To</span>
        <span class="ar-from-val"><strong>${state.player.name}</strong>, Analyst L${year}</span>
      </div>
      <div class="ar-from-row">
        <span class="ar-from-key">From</span>
        <span class="ar-from-val"><strong>Dana Sutcliffe</strong>, Senior Manager, Strategy &amp; Foresight</span>
      </div>
      <div class="ar-from-row">
        <span class="ar-from-key">Re</span>
        <span class="ar-from-val">Year ${year} Formal Review — Calibration Period</span>
      </div>
    </div>

    <div class="ar-body">
      ${assessmentBody(c, state)}
    </div>
  </div>

  <!-- RIGHT: Scorecard + Formula + Outcome -->
  <div class="ar-right-col">

    <div class="ar-scorecard">
      <div class="ar-section-label">Performance Scorecard</div>
      ${scorecardGrid(c.scorecard)}
      <div class="ar-sc-footnote">
        Promotion threshold: 3 of 4 at
        <span class="ar-gold">Likely+</span> &nbsp;·&nbsp;
        Current: <span class="ar-text-sec">${c.atLikelyPlus} of 4</span>
      </div>
    </div>

    <div class="ar-formula">
      <div class="ar-section-label">Score Calculation</div>
      <div class="ar-formula-rows">
        ${formulaRow('Attribute Aggregate', '40%', 'fill-attr', c.attrAggregate, c.attrAggregate * 0.40, 'attr')}
        ${formulaRow('Performance Score',   '30%', 'fill-perf', c.perfScore,     c.perfScore     * 0.30, 'perf')}
        ${formulaRow('Sponsor Strength',    '20%', 'fill-sponsor', c.sponsorScore, c.sponsorScore * 0.20, 'sponsor')}
        ${formulaRow('Political Capital',   '10%', 'fill-pol',  c.polScore,      c.polScore      * 0.10, 'pol')}
      </div>
      <div class="ar-formula-total">
        <span class="ar-formula-total-label">Composite Score</span>
        <div>
          <span class="ar-total-score" id="ar-total-score">${c.compositeScore}</span>
          <span class="ar-total-band">/100</span>
        </div>
      </div>
    </div>

    <div class="ar-outcome">
      <div class="ar-section-label">Year ${year + 1} Determination</div>
      ${outcomeCard(c, year)}
    </div>

  </div>

  <!-- BOTTOM BAR -->
  <div class="ar-bottom-bar">
    <button class="ar-btn-primary" id="ar-continue">Begin Year ${year + 1} →</button>
  </div>

</div>`;

  document.getElementById('ar-continue')?.addEventListener('click', settle);
}

// ─────────────────────────────────────────────
// TEMPLATE HELPERS
// ─────────────────────────────────────────────

const BAND_LABELS: Record<DimensionBand, string> = {
  below_line:       'Below Line',
  in_discussion:    'In Discussion',
  likely:           'Likely',
  sponsor_dependent:'Sponsor Dep.',
};

const BANDS: DimensionBand[] = ['below_line', 'in_discussion', 'likely', 'sponsor_dependent'];

function bandClass(dim: DimensionBand, col: DimensionBand): string {
  if (dim !== col) return '';
  if (col === 'likely' || col === 'sponsor_dependent') return ' dot-high';
  if (col === 'in_discussion') return ' dot-mid';
  return ' dot-low';
}

function scorecardGrid(sc: Scorecard): string {
  const dims: [string, DimensionBand][] = [
    ['Delivery',   sc.delivery],
    ['Visibility', sc.visibility],
    ['Trust',      sc.trust],
    ['Readiness',  sc.readiness],
  ];

  const headerRow = `
    <div class="sc-cell sc-head"></div>
    ${BANDS.map(b => `<div class="sc-cell sc-head"><span class="sc-head-text">${BAND_LABELS[b].replace(' ', '<br>')}</span></div>`).join('')}`;

  const dimRows = dims.map(([label, band]) =>
    `<div class="sc-cell sc-dim"><span class="sc-dim-text">${label}</span></div>
     ${BANDS.map(col => `<div class="sc-cell"><div class="band-dot${bandClass(band, col)}"></div></div>`).join('')}`
  ).join('');

  return `<div class="ar-scorecard-grid">${headerRow}${dimRows}</div>`;
}

function formulaRow(
  name: string, weight: string, fillClass: string,
  rawScore: number, contribution: number, id: string,
): string {
  return `
<div class="ar-formula-row">
  <div>
    <div class="ar-formula-name">${name}</div>
    <div class="ar-formula-weight">${weight} weight</div>
  </div>
  <div class="ar-formula-bar-wrap">
    <div class="ar-formula-track">
      <div class="ar-formula-fill ${fillClass}" id="fill-${id}" data-target="${rawScore}"></div>
    </div>
  </div>
  <div class="ar-formula-contrib" id="contrib-${id}">—</div>
</div>`;
}

function outcomeCard(c: ReviewComputed, year: number): string {
  const { outcome, scorecard, atLikelyPlus } = c;

  const config = {
    promoted: {
      badge: 'PROMOTED',
      badgeClass: 'badge-promote',
      title: `L${year + 1} Promotion Confirmed`,
      desc: 'Three or more dimensions reached Likely or above. The case was made and it held. ' +
            'Dana has put you forward to the calibration committee. You will move into Year ' +
            `${year + 1} at the next level.`,
      req: `Year ${year + 1}: Maintain delivery at Likely+. Expand visibility in cross-functional rooms.`,
    },
    hold_stretch: {
      badge: 'HOLD — STRETCH',
      badgeClass: 'badge-hold',
      title: 'Trajectory: Strong — Stretch Assignment',
      desc: `Two dimensions are in Discussion. Dana is offering a cross-functional brief ` +
            `in Q1 of Year ${year + 1} to move ${weakDims(scorecard).join(' and ')} from Discussion to Likely. ` +
            `You are expected to lead at least one deliverable independently.`,
      req: `Year ${year + 1} target: ${weakDims(scorecard).map(d => `${d} → Likely`).join(' · ')}`,
    },
    hold_standard: {
      badge: 'HOLD',
      badgeClass: 'badge-hold',
      title: 'Continuing at Current Level',
      desc: `Year ${year} showed progress but not enough to make the calibration case. ` +
            `Three dimensions need to reach Likely before a promotion conversation can be opened. ` +
            `Focus on ${weakDims(scorecard).slice(0, 2).join(' and ')} through Year ${year + 1}.`,
      req: `Year ${year + 1} target: ${atLikelyPlus} of 4 at Likely+ · Need ${3 - atLikelyPlus} more`,
    },
    below_line: {
      badge: 'BELOW LINE',
      badgeClass: 'badge-below',
      title: 'Performance Improvement Required',
      desc: `One or more dimensions fell below the minimum threshold. Dana will schedule a ` +
            `structured check-in in Q1 of Year ${year + 1}. This is recoverable — ` +
            `the path requires consistent delivery across the next two cycles.`,
      req: `Mandatory Q1 check-in · Delivery and Trust must return to In Discussion by mid-year`,
    },
  };

  const cfg = config[outcome];
  return `
<div class="ar-outcome-card">
  <div class="ar-outcome-header">
    <span class="ar-outcome-type">Decision</span>
    <span class="ar-outcome-badge ${cfg.badgeClass}">${cfg.badge}</span>
  </div>
  <div class="ar-outcome-title">${cfg.title}</div>
  <div class="ar-outcome-desc">${cfg.desc}</div>
  <div class="ar-outcome-req">${cfg.req}</div>
</div>`;
}

function weakDims(sc: Scorecard): string[] {
  const order: (keyof Scorecard)[] = ['visibility', 'readiness', 'trust', 'delivery'];
  const weak = order.filter(k => sc[k] === 'in_discussion' || sc[k] === 'below_line');
  return weak.map(k => k.charAt(0).toUpperCase() + k.slice(1));
}

// ─────────────────────────────────────────────
// ASSESSMENT LETTER
// ─────────────────────────────────────────────

function assessmentBody(c: ReviewComputed, state: GameState): string {
  const hasReliability = c.hasReliabilityConcern;
  const q10D  = c.q10DSelected && c.danaTrusted;
  const promoted = c.outcome === 'promoted';

  let body = '';

  if (hasReliability) {
    body = `<p>
      You spent Year ${state.year} learning how to be useful. What you built this year is a
      reputation for <em>closing loops</em> — mostly. There were instances in the back half
      of the year where I had to follow up on deliverables I had expected to be proactively
      flagged. These were not failures of quality. They were failures of communication.
    </p>
    <p>
      I am noting this in writing because it is recoverable — and because I want you to
      understand the difference between doing the work and being someone whose work can be
      relied on without supervision. Year ${state.year + 1} is when that distinction starts
      to matter for calibration.
    </p>
    <p>
      Your strategic read is developing. Your delivery record is otherwise good. The trust
      dimension is where the concern is registering.
    </p>`;
  } else if (promoted) {
    body = `<p>
      You spent Year ${state.year} learning how to be useful — and you made the case.
      What you built this year is not just a record of delivery, it is a pattern that the
      calibration committee found legible. That is rarer than the work itself.
    </p>
    <p>
      Your execution was the strongest in the Year ${state.year} cohort. More importantly,
      your strategic read has started to compound: I have seen it in how you handle
      competing priorities, and in how you navigate rooms where the stakes are implicit
      rather than stated. That is the skill that scales.
    </p>
    <p>
      At L${state.year + 1} you will be expected to lead, not just deliver. The brief
      changes. I will be watching how you handle the transition — specifically whether
      your reliability at close range translates to reliability at scale.
    </p>`;
  } else {
    body = `<p>
      You spent Year ${state.year} learning how to be useful. That sounds modest — it isn't.
      Most analysts in calibration spend the first year learning how to <em>seem</em> useful,
      which is a different skill and a less durable one. What you built this year is a
      reputation for closing loops. Things that landed on your desk did not quietly stall.
    </p>
    <p>
      Your delivery record is strong. Your strategic read is developing — I have seen it in
      how you navigate competing priorities and in how you hold a position under pressure.
      Those two things are starting to converge, which is the thing I am watching for.
    </p>
    <p>
      Where I need more from you in Year ${state.year + 1} is visibility. You are doing good
      work at close range. The room needs to know that — not through self-promotion, but
      through presence in the right conversations at the right moments, with something
      specific to add.
    </p>`;
  }

  // Branch note: Q10-D honest read (only if no reliability concern)
  if (q10D && !hasReliability) {
    body += `
<div class="ar-branch-note">
  <div class="ar-branch-tag">Q10 · Honest Read</div>
  <div class="ar-branch-text">"You gave me your actual view when a safer response was available.
  People who do that tend to be useful for longer. I'm filing that. Don't make a habit of
  announcing it."</div>
</div>`;
  }

  return body;
}

// ─────────────────────────────────────────────
// FORMULA ANIMATION
// ─────────────────────────────────────────────

function animateFormula(): void {
  const ids = ['attr', 'perf', 'sponsor', 'pol'];

  ids.forEach((id, i) => {
    const fill   = document.getElementById(`fill-${id}`) as HTMLElement | null;
    const contrib = document.getElementById(`contrib-${id}`);
    if (!fill || !contrib || !_computed) return;

    const raw: Record<string, number> = {
      attr:    _computed.attrAggregate,
      perf:    _computed.perfScore,
      sponsor: _computed.sponsorScore,
      pol:     _computed.polScore,
    };
    const contributions: Record<string, number> = {
      attr:    _computed.attrAggregate * 0.40,
      perf:    _computed.perfScore     * 0.30,
      sponsor: _computed.sponsorScore  * 0.20,
      pol:     _computed.polScore      * 0.10,
    };

    setTimeout(() => {
      fill.style.width = `${raw[id]}%`;
      setTimeout(() => {
        contrib.textContent = `+${contributions[id]!.toFixed(1)}`;
      }, 450);
    }, 200 + i * 160);
  });

  setTimeout(() => {
    const el = document.getElementById('ar-total-score');
    if (el) el.classList.add('revealed');
  }, 200 + 4 * 160 + 500);
}

// ─────────────────────────────────────────────
// SETTLE (advance year)
// ─────────────────────────────────────────────

function settle(): void {
  if (_settled || !_state || !_computed) return;
  _settled = true;

  const c = _computed;
  const scorecardRecord: Record<string, string> = {
    delivery:   c.scorecard.delivery,
    visibility: c.scorecard.visibility,
    trust:      c.scorecard.trust,
    readiness:  c.scorecard.readiness,
  };

  const comp = 60000 + (_state.year - 1) * 5000 + (c.outcome === 'promoted' ? 8000 : 0);

  let newState = recordReview(_state, {
    year:     _state.year,
    score:    c.compositeScore,
    outcome:  c.outcome === 'promoted' ? 'promoted' :
              c.outcome === 'hold_stretch' ? 'hold_stretch' :
              c.outcome === 'below_line' ? 'below_line' : 'hold_standard',
    scorecard: scorecardRecord,
    comp,
  });

  saveState(newState);
  router.push('decision');
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

function injectStyles(): void {
  if (document.getElementById('ar-styles')) return;
  const style = document.createElement('style');
  style.id = 'ar-styles';
  style.textContent = `
    /* ── Layout ─────────────────────────────── */
    #scene-root { overflow: hidden; height: 100vh; display: flex; flex-direction: column; }

    .ar-header {
      position: fixed; top: 0; left: 0; right: 0; z-index: 10;
      height: 52px; display: flex; align-items: center;
      justify-content: space-between; padding: 0 var(--space-6);
      background: var(--color-surface-base);
      border-bottom: 1px solid var(--color-border-subtle);
    }
    .ar-header-left { display: flex; align-items: center; gap: var(--space-4); }
    .ar-wordmark {
      font-family: var(--font-ui); font-size: var(--text-sm);
      font-weight: var(--weight-semibold); letter-spacing: var(--tracking-widest);
      text-transform: uppercase; color: var(--color-text-primary);
    }
    .ar-h-divider { width: 1px; height: 16px; background: var(--color-border-default); }
    .ar-header-ctx {
      font-family: var(--font-mono); font-size: var(--text-xs);
      color: var(--color-text-muted); letter-spacing: var(--tracking-wide);
    }

    .ar-page {
      margin-top: 52px; flex: 1;
      display: grid;
      grid-template-columns: 1fr 420px;
      grid-template-rows: 1fr auto;
      min-height: calc(100vh - 52px);
      max-width: 1200px; margin-left: auto; margin-right: auto; width: 100%;
    }

    /* ── Assessment (left) ───────────────────── */
    .ar-assessment {
      grid-column: 1; grid-row: 1;
      padding: var(--space-10) var(--space-10) var(--space-8);
      border-right: 1px solid var(--color-border-subtle);
      overflow-y: auto;
    }

    .ar-eyebrow {
      display: flex; align-items: center; gap: var(--space-3);
      margin-bottom: var(--space-6);
    }
    .ar-eyebrow-label {
      font-family: var(--font-mono); font-size: var(--text-xs);
      color: var(--color-text-accent); letter-spacing: var(--tracking-widest);
      text-transform: uppercase; white-space: nowrap;
    }
    .ar-eyebrow-rule { flex: 1; height: 1px; background: var(--color-border-subtle); }
    .ar-eyebrow-date {
      font-family: var(--font-mono); font-size: var(--text-xs);
      color: var(--color-text-muted); white-space: nowrap;
    }

    .ar-from { margin-bottom: var(--space-8); }
    .ar-from-row {
      display: flex; gap: var(--space-2); align-items: baseline;
      margin-bottom: var(--space-1);
    }
    .ar-from-key {
      font-family: var(--font-mono); font-size: var(--text-xs);
      color: var(--color-text-muted); letter-spacing: var(--tracking-wide);
      text-transform: uppercase; min-width: 40px;
    }
    .ar-from-val { font-family: var(--font-ui); font-size: var(--text-sm); color: var(--color-text-secondary); }
    .ar-from-val strong { color: var(--color-text-primary); font-weight: var(--weight-semibold); }

    .ar-body {
      font-family: var(--font-narrative); font-size: var(--text-md);
      line-height: var(--leading-relaxed); color: var(--color-text-secondary);
    }
    .ar-body p { margin-bottom: var(--space-5); }
    .ar-body p:last-child { margin-bottom: 0; }
    .ar-body em { color: var(--color-text-primary); font-style: normal; font-weight: 600; }

    .ar-branch-note {
      margin-top: var(--space-6); padding: var(--space-4);
      border-left: 2px solid var(--color-accent-default);
      background: color-mix(in srgb, var(--color-accent-default) 6%, transparent);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    }
    .ar-branch-tag {
      font-family: var(--font-mono); font-size: 10px;
      letter-spacing: var(--tracking-widest); text-transform: uppercase;
      color: var(--color-accent-default); margin-bottom: var(--space-2);
    }
    .ar-branch-text {
      font-family: var(--font-narrative); font-size: var(--text-sm);
      font-style: italic; color: var(--color-text-secondary);
      line-height: var(--leading-relaxed);
    }

    /* ── Right column ────────────────────────── */
    .ar-right-col {
      grid-column: 2; grid-row: 1;
      display: flex; flex-direction: column; overflow-y: auto;
    }

    .ar-section-label {
      font-family: var(--font-mono); font-size: var(--text-xs);
      color: var(--color-text-muted); letter-spacing: var(--tracking-widest);
      text-transform: uppercase; margin-bottom: var(--space-5);
    }

    /* Scorecard */
    .ar-scorecard { padding: var(--space-8) var(--space-6) var(--space-6); border-bottom: 1px solid var(--color-border-subtle); }

    .ar-scorecard-grid {
      display: grid; grid-template-columns: 90px repeat(4, 1fr);
      gap: 1px; background: var(--color-border-subtle);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md); overflow: hidden;
    }
    .sc-cell {
      background: var(--color-surface-raised);
      padding: var(--space-2) var(--space-3);
      display: flex; align-items: center; justify-content: center;
    }
    .sc-head { background: var(--color-surface-overlay); }
    .sc-dim  { justify-content: flex-start; }
    .sc-head-text {
      font-family: var(--font-mono); font-size: 9px;
      letter-spacing: var(--tracking-widest); text-transform: uppercase;
      color: var(--color-text-muted); text-align: center;
    }
    .sc-dim-text {
      font-family: var(--font-ui); font-size: var(--text-xs);
      font-weight: var(--weight-medium); color: var(--color-text-secondary);
    }
    .band-dot {
      width: 8px; height: 8px; border-radius: var(--radius-full);
      border: 1.5px solid var(--color-border-subtle); background: transparent;
    }
    .band-dot.dot-high {
      background: var(--color-gold-400); border-color: var(--color-gold-400);
      box-shadow: 0 0 8px color-mix(in srgb, var(--color-gold-400) 60%, transparent);
      width: 10px; height: 10px;
    }
    .band-dot.dot-mid  { background: #6B7280; border-color: #6B7280; box-shadow: 0 0 6px #6B728080; }
    .band-dot.dot-low  { background: #4B5563; border-color: #4B5563; box-shadow: 0 0 6px #4B556360; }

    .ar-sc-footnote {
      margin-top: var(--space-3); font-family: var(--font-mono); font-size: 10px;
      color: var(--color-text-muted);
    }
    .ar-gold { color: var(--color-gold-400); }
    .ar-text-sec { color: var(--color-text-secondary); }

    /* Formula */
    .ar-formula { padding: var(--space-6); border-bottom: 1px solid var(--color-border-subtle); }
    .ar-formula-rows { display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-5); }
    .ar-formula-row {
      display: grid; grid-template-columns: 120px 1fr 48px;
      gap: var(--space-3); align-items: center;
    }
    .ar-formula-name { font-family: var(--font-ui); font-size: var(--text-xs); color: var(--color-text-secondary); }
    .ar-formula-weight { font-family: var(--font-mono); font-size: 10px; color: var(--color-text-muted); margin-top: 2px; }
    .ar-formula-bar-wrap { display: flex; align-items: center; gap: var(--space-2); flex: 1; }
    .ar-formula-track {
      flex: 1; height: 4px; background: var(--color-border-subtle);
      border-radius: var(--radius-full); overflow: hidden;
    }
    .ar-formula-fill {
      height: 100%; border-radius: var(--radius-full); width: 0;
      transition: width 600ms var(--ease-default);
    }
    .fill-attr    { background: #7C6FAF; }
    .fill-perf    { background: var(--color-gold-400); }
    .fill-sponsor { background: var(--color-accent-default); }
    .fill-pol     { background: #3A7D6B; }
    .ar-formula-contrib {
      font-family: var(--font-mono); font-size: var(--text-xs);
      color: var(--color-text-muted); text-align: right;
    }

    .ar-formula-total {
      display: flex; align-items: baseline; justify-content: space-between;
      padding-top: var(--space-3); border-top: 1px solid var(--color-border-subtle);
    }
    .ar-formula-total-label {
      font-family: var(--font-mono); font-size: var(--text-xs);
      color: var(--color-text-muted); letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
    }
    .ar-total-score {
      font-family: var(--font-ui); font-size: var(--text-2xl);
      font-weight: var(--weight-semibold); color: var(--color-text-primary);
      opacity: 0; transition: opacity 400ms var(--ease-default);
    }
    .ar-total-score.revealed { opacity: 1; }
    .ar-total-band {
      font-family: var(--font-mono); font-size: var(--text-xs);
      color: var(--color-gold-400); letter-spacing: var(--tracking-wide);
      margin-left: var(--space-1);
    }

    /* Outcome */
    .ar-outcome { padding: var(--space-6); flex: 1; }
    .ar-outcome-card {
      padding: var(--space-5); border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md); background: var(--color-surface-overlay);
    }
    .ar-outcome-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: var(--space-3);
    }
    .ar-outcome-type {
      font-family: var(--font-mono); font-size: 10px;
      letter-spacing: var(--tracking-widest); text-transform: uppercase;
      color: var(--color-text-muted);
    }
    .ar-outcome-badge {
      font-family: var(--font-mono); font-size: 10px;
      letter-spacing: var(--tracking-wide); text-transform: uppercase;
      padding: 3px var(--space-3); border-radius: var(--radius-sm); border: 1px solid;
    }
    .badge-promote {
      color: var(--color-accent-default);
      border-color: color-mix(in srgb, var(--color-accent-default) 30%, transparent);
      background: color-mix(in srgb, var(--color-accent-default) 8%, transparent);
    }
    .badge-hold {
      color: var(--color-gold-400);
      border-color: color-mix(in srgb, var(--color-gold-400) 30%, transparent);
      background: color-mix(in srgb, var(--color-gold-400) 8%, transparent);
    }
    .badge-below {
      color: #9CA3AF;
      border-color: color-mix(in srgb, #9CA3AF 30%, transparent);
      background: color-mix(in srgb, #9CA3AF 8%, transparent);
    }
    .ar-outcome-title {
      font-family: var(--font-ui); font-size: var(--text-md);
      font-weight: var(--weight-semibold); color: var(--color-text-primary);
      margin-bottom: var(--space-1);
    }
    .ar-outcome-desc {
      font-family: var(--font-narrative); font-size: var(--text-sm);
      font-style: italic; color: var(--color-text-secondary);
      line-height: var(--leading-relaxed);
    }
    .ar-outcome-req {
      font-family: var(--font-mono); font-size: 10px;
      color: var(--color-text-muted); letter-spacing: var(--tracking-wide);
      margin-top: var(--space-3);
    }
    .ar-outcome-req span { color: var(--color-gold-400); }

    /* Bottom bar */
    .ar-bottom-bar {
      grid-column: 1 / -1; grid-row: 2;
      display: flex; align-items: center; justify-content: flex-end;
      gap: var(--space-3); padding: var(--space-4) var(--space-8);
      border-top: 1px solid var(--color-border-subtle);
      background: var(--color-surface-base);
    }
    .ar-btn-primary {
      background: var(--color-accent-default);
      border: 1px solid var(--color-accent-default);
      border-radius: var(--radius-sm); color: var(--color-surface-base);
      cursor: pointer; padding: var(--space-2) var(--space-6);
      font-family: var(--font-ui); font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      transition: background var(--transition-fast);
    }
    .ar-btn-primary:hover {
      background: color-mix(in srgb, var(--color-accent-default) 85%, white);
    }

    .ar-error {
      display: flex; align-items: center; justify-content: center;
      gap: var(--space-4); flex-direction: column; min-height: 100vh;
      font-family: var(--font-mono); color: var(--color-text-muted);
    }

    @media (max-width: 800px) {
      .ar-page { grid-template-columns: 1fr; grid-template-rows: auto auto auto; }
      .ar-assessment { border-right: none; border-bottom: 1px solid var(--color-border-subtle); padding: var(--space-6); }
      .ar-right-col { grid-column: 1; }
    }
  `;
  document.head.appendChild(style);
}
