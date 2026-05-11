// ASCEND — Three-lane system (task 2.6)
// Computes the player's active career lane after each Annual Review.
// Lanes shape NPC arcs, decision option weighting, and Year 3+ question context.

import type { GameState }   from '../core/state';
import type { ReviewRecord } from '../core/state';
import type { LaneKey }      from '../core/constants';

// ─────────────────────────────────────────────
// LANE METADATA (display + CSS)
// ─────────────────────────────────────────────

export interface LaneMeta {
  label:       string;
  shortLabel:  string;
  summary:     string;
  cssClass:    string;
  color:       string;   // for inline style fallback
}

export const LANE_META: Record<LaneKey, LaneMeta> = {
  internal_mobility: {
    label:      'Internal Track',
    shortLabel: 'INT',
    summary:    'You are building toward promotion within AUREL.',
    cssClass:   'lane-internal',
    color:      'var(--color-accent-default)',
  },
  external_offer: {
    label:      'External Market',
    shortLabel: 'EXT',
    summary:    'You are weighing options outside AUREL.',
    cssClass:   'lane-external',
    color:      '#D4AF37',
  },
  strategic_relationship: {
    label:      'Sponsor Track',
    shortLabel: 'REL',
    summary:    'Your advancement flows through relationship capital.',
    cssClass:   'lane-strategic',
    color:      '#7C6FAF',
  },
};

// ─────────────────────────────────────────────
// LANE SIGNAL HELPERS
// ─────────────────────────────────────────────

// Consequence tags that indicate active external interest
const EXTERNAL_SIGNAL_TAGS = [
  'external_offer_active',      // player replied to recruiter (Y2 Q7 opt B)
  'external_offer_considered',  // player told Dana about recruiter (Y2 Q7 opt C)
  'external_market_engaged',    // player discussed with Conrad (Y2 Q7 opt D)
];

// Flag keys written to state.flags by question decisions
const EXTERNAL_SIGNAL_FLAGS = [
  'external_offer_active',
  'external_offer_considered',
];

// Tier-1 sponsor threshold: relationship score >= this value
const DEEP_SPONSOR_THRESHOLD = 70;

// Any NPC at this level counts as a strong relationship
const HIGH_RELATIONSHIP_THRESHOLD = 75;

function hasExternalSignal(state: GameState): boolean {
  const tagMatch = EXTERNAL_SIGNAL_TAGS.some(t => state.consequenceTags.includes(t));
  const flagMatch = EXTERNAL_SIGNAL_FLAGS.some(f => state.flags[f]);
  return tagMatch || flagMatch;
}

function hasDeepSponsorRelationship(state: GameState): boolean {
  const dana = state.npcRelationships['dana_sutcliffe'] ?? 0;
  if (dana >= DEEP_SPONSOR_THRESHOLD) return true;
  return Object.values(state.npcRelationships).some(
    score => score >= HIGH_RELATIONSHIP_THRESHOLD,
  );
}

// ─────────────────────────────────────────────
// LANE COMPUTATION
// ─────────────────────────────────────────────

/**
 * Determines the player's active lane after a completed Annual Review.
 *
 * Priority order:
 *   1. external_offer  — player has active external signal AND was not promoted
 *   2. strategic_relationship — deep sponsor relationship AND held (not promoted)
 *   3. internal_mobility — default (promoted, or no strong signal either way)
 */
export function computeActiveLane(state: GameState, review: ReviewRecord): LaneKey {
  const promoted = review.outcome === 'promoted';

  // External offer: player has external interest signal AND ceiling is showing
  if (!promoted && hasExternalSignal(state)) {
    return 'external_offer';
  }

  // Strategic relationship: deep sponsor capital but not yet promoted
  if (!promoted && hasDeepSponsorRelationship(state)) {
    return 'strategic_relationship';
  }

  // Default: internal mobility — whether promoted or still climbing
  return 'internal_mobility';
}

// ─────────────────────────────────────────────
// LANE TRANSITION RULES
// ─────────────────────────────────────────────

/**
 * Can the player switch lanes mid-year?
 * Transitions are computed at each Annual Review; in-year decisions
 * update consequence tags and flags that feed the next computation.
 *
 * Switching into external_offer: player receives recruiter contact
 *   and responds (Y2 Q7, Y3 Q5, etc.) → tags added by consequence engine
 *
 * Switching out of external_offer → internal_mobility: player declines
 *   the external path (specific decision in the same question bank)
 *   → tags removed / counter-flag set
 *
 * Switching to strategic_relationship: sponsor relationship crosses
 *   threshold during the year → detected at review time
 */
export function laneTransitionDescription(
  fromLane: LaneKey | null,
  toLane: LaneKey,
): string {
  if (fromLane === toLane) return '';

  const from = fromLane ? LANE_META[fromLane].label : 'no lane';
  const to   = LANE_META[toLane].label;
  return `Lane changed: ${from} → ${to}`;
}

// ─────────────────────────────────────────────
// OPTION WEIGHT MODIFIERS
// ─────────────────────────────────────────────

/**
 * Returns a numeric modifier for a decision option based on the current lane.
 * Used by the consequence engine to weight stat deltas when the lane context
 * amplifies or dampens specific outcomes.
 *
 * Positive modifier = stat delta amplified by this multiplier.
 * Returns 1.0 (neutral) if no lane interaction.
 */
export function laneOptionModifier(
  lane: LaneKey | null,
  consequenceTags: string[],
): number {
  if (!lane) return 1.0;

  switch (lane) {
    case 'external_offer':
      // External track: market-reading choices hit harder; internal visibility less so
      if (consequenceTags.includes('systemic_read') || consequenceTags.includes('open_inquiry')) {
        return 1.2;
      }
      if (consequenceTags.includes('seen_by_sponsor')) {
        return 0.85;  // internal sponsor is less directly relevant
      }
      return 1.0;

    case 'strategic_relationship':
      // Relationship track: coalition and trust choices amplified
      if (consequenceTags.includes('coalition_builder') || consequenceTags.includes('seen_by_sponsor')) {
        return 1.2;
      }
      if (consequenceTags.includes('burned_peer')) {
        return 1.3;  // relationship damage is more costly on this track
      }
      return 1.0;

    case 'internal_mobility':
      // Internal track: high-fidelity and discipline choices amplified
      if (consequenceTags.includes('high_cost_high_fidelity')) {
        return 1.15;
      }
      if (consequenceTags.includes('reliability_concern')) {
        return 1.2;  // reliability concerns hurt more on internal track
      }
      return 1.0;
  }
}
