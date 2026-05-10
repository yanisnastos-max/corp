// ASCEND — NPC relationship helpers
// Full implementation: task 1.6
import type { GameState } from '../core/state';

type Band = 'cold' | 'functional' | 'warm' | 'trusted' | 'invested';

export function npcBand(state: GameState, npcId: string): Band {
  const score = state.npcRelationships[npcId] ?? 0;
  if (score < 20)  return 'cold';
  if (score < 40)  return 'functional';
  if (score < 65)  return 'warm';
  if (score < 85)  return 'trusted';
  return 'invested';
}
