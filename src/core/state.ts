// ASCEND — GameState type, factory, and pure reducers
// Immutable pattern: every reducer returns a new GameState object.
import type { StatKey, PillarKey, AxisKey } from './constants';
import { STAT_KEYS, PILLAR_KEYS, AXIS_KEYS } from './constants';

export type NpcId = string;

export interface DecisionRecord {
  questionId: string;
  optionId:   string;
  year:       number;
  week:       number;
}

export interface ReviewRecord {
  year:      number;
  score:     number;
  outcome:   'promoted' | 'hold_stretch' | 'hold_standard' | 'below_line';
  scorecard: Record<string, string>;
  comp:      number;   // base salary at end of year
}

export interface GameState {
  version:           number;
  player: {
    name:         string;
    pronouns:     string;
    backgroundId: string;
    traitIds:     string[];
  };
  year:              number;           // 1–12
  week:              number;           // 1–52
  questionIndex:     number;           // 0-based within the year
  stats:             Record<StatKey,   number>;   // 0–100
  pillars:           Record<PillarKey, number>;   // 1–40
  axes:              Record<AxisKey,   number>;   // -5 to +5
  npcRelationships:  Record<NpcId,     number>;   // -100 to 100
  consequenceTags:   string[];
  decisions:         DecisionRecord[];
  reviewHistory:     ReviewRecord[];
  flags:             Record<string, boolean>;
  eventLog:          string[];         // human-readable game log (task 1.3)
}

// ─────────────────────────────────────────────
// FACTORY
// ─────────────────────────────────────────────

export function createInitialState(): GameState {
  const stats = Object.fromEntries(
    STAT_KEYS.map(k => [k, 50])
  ) as Record<StatKey, number>;

  const pillars = Object.fromEntries(
    PILLAR_KEYS.map(k => [k, 10])
  ) as Record<PillarKey, number>;

  const axes = Object.fromEntries(
    AXIS_KEYS.map(k => [k, 0])
  ) as Record<AxisKey, number>;

  return {
    version:          1,
    player:           { name: '', pronouns: '', backgroundId: '', traitIds: [] },
    year:             1,
    week:             1,
    questionIndex:    0,
    stats,
    pillars,
    axes,
    npcRelationships: {},
    consequenceTags:  [],
    decisions:        [],
    reviewHistory:    [],
    flags:            {},
    eventLog:         ['Game started.'],
  };
}

// ─────────────────────────────────────────────
// REDUCERS (pure — return new state)
// ─────────────────────────────────────────────

export function setPlayer(
  state: GameState,
  player: GameState['player'],
): GameState {
  return { ...state, player, eventLog: [...state.eventLog, `Player created: ${player.name}`] };
}

export function recordDecision(
  state: GameState,
  record: DecisionRecord,
): GameState {
  return {
    ...state,
    decisions:    [...state.decisions, record],
    questionIndex: state.questionIndex + 1,
    eventLog:     [...state.eventLog, `Y${record.year} decision: ${record.questionId} → ${record.optionId}`],
  };
}

export function addConsequenceTag(state: GameState, tag: string): GameState {
  return { ...state, consequenceTags: [...state.consequenceTags, tag] };
}

export function addConsequenceTags(state: GameState, tags: string[]): GameState {
  return { ...state, consequenceTags: [...state.consequenceTags, ...tags] };
}

export function updateStats(
  state: GameState,
  deltas: Partial<Record<StatKey, number>>,
): GameState {
  const stats = { ...state.stats };
  for (const [k, d] of Object.entries(deltas) as [StatKey, number][]) {
    stats[k] = Math.min(100, Math.max(0, (stats[k] ?? 50) + d));
  }
  return { ...state, stats };
}

export function updatePillars(
  state: GameState,
  deltas: Partial<Record<PillarKey, number>>,
): GameState {
  const pillars = { ...state.pillars };
  for (const [k, d] of Object.entries(deltas) as [PillarKey, number][]) {
    pillars[k] = Math.min(40, Math.max(1, (pillars[k] ?? 10) + d));
  }
  return { ...state, pillars };
}

export function updateAxes(
  state: GameState,
  deltas: Partial<Record<AxisKey, number>>,
): GameState {
  const axes = { ...state.axes };
  for (const [k, d] of Object.entries(deltas) as [AxisKey, number][]) {
    axes[k] = Math.min(5, Math.max(-5, (axes[k] ?? 0) + d));
  }
  return { ...state, axes };
}

export function updateNpcRelationship(
  state: GameState,
  npcId: NpcId,
  delta: number,
): GameState {
  const prev = state.npcRelationships[npcId] ?? 50;
  return {
    ...state,
    npcRelationships: {
      ...state.npcRelationships,
      [npcId]: Math.min(100, Math.max(-100, prev + delta)),
    },
  };
}

export function recordReview(state: GameState, record: ReviewRecord): GameState {
  return {
    ...state,
    reviewHistory: [...state.reviewHistory, record],
    year:          state.year + 1,
    week:          1,
    questionIndex: 0,
    eventLog:      [...state.eventLog, `Y${record.year} review: ${record.outcome} · score ${record.score}`],
  };
}

export function setFlag(state: GameState, key: string, value: boolean): GameState {
  return { ...state, flags: { ...state.flags, [key]: value } };
}

export function logEvent(state: GameState, message: string): GameState {
  return { ...state, eventLog: [...state.eventLog, message] };
}
