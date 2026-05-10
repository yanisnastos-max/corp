// ASCEND — Game constants
// Populated in task 1.1 (Project Scaffold)

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

export type StatKey   = typeof STAT_KEYS[number];
export type PillarKey = typeof PILLAR_KEYS[number];
export type AxisKey   = typeof AXIS_KEYS[number];
// NpcId is defined in state.ts to keep it co-located with GameState
