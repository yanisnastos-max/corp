// ASCEND — Game constants

export const STAT_KEYS = [
  'executionDiscipline', 'strategicInfluence', 'reputation',
  'politicalAwareness', 'collaborativePull', 'adaptiveNerve',
  'marketSense', 'technicalCredibility', 'resilience', 'integrity',
] as const;

export const PILLAR_KEYS = ['curiosity', 'insight', 'engagement', 'determination'] as const;

export const AXIS_KEYS = [
  'analytical_intuitive', 'collaborative_independent',
  'cautious_bold', 'systemic_tactical',
] as const;

export type LaneKey   = 'internal_mobility' | 'external_offer' | 'strategic_relationship';
export type StatKey   = typeof STAT_KEYS[number];
export type PillarKey = typeof PILLAR_KEYS[number];
export type AxisKey   = typeof AXIS_KEYS[number];
