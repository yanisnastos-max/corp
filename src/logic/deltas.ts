// ASCEND — Delta application (pure functions)
// Full implementation: task 1.6
// Stat clamp: [0, 100] · NPC clamp: [-100, 100]
import type { GameState } from '../core/state';

export function applyStatDeltas(state: GameState, _deltas: Array<{stat: string; delta: number}>): GameState {
  return { ...state }; // stub
}

export function applyNpcDeltas(state: GameState, _deltas: Array<{npcId: string; delta: number}>): GameState {
  return { ...state }; // stub
}
