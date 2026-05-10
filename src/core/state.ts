// ASCEND — GameState type definition and persistence helpers
// Full implementation: task 1.2
import type { StatKey, PillarKey, AxisKey, NpcId } from './constants';

export interface DecisionRecord {
  questionId: string;
  optionId: string;
  week: number;
}

export interface ReviewRecord {
  year: number;
  score: number;
  outcome: 'promoted' | 'hold_stretch' | 'hold_standard' | 'below_line';
  scorecard: Record<string, string>;
}

export interface GameState {
  version: number;
  player: { name: string; pronouns: string; backgroundId: string; traitIds: string[] };
  year: number;
  week: number;
  questionIndex: number;
  stats: Record<StatKey, number>;
  pillars: Record<PillarKey, number>;
  axes: Record<AxisKey, number>;
  npcRelationships: Record<NpcId, number>;
  consequenceTags: string[];
  decisions: DecisionRecord[];
  reviewHistory: ReviewRecord[];
  flags: Record<string, boolean>;
}
