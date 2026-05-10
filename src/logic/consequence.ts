// ASCEND — Consequence tag queries (pure functions)
// Full implementation: task 1.6
import type { GameState } from '../core/state';

export const hasTag   = (s: GameState, tag: string): boolean => s.consequenceTags.includes(tag);
export const countTag = (s: GameState, tag: string): number  => s.consequenceTags.filter(t => t === tag).length;
export const hasTagFromQuestion = (s: GameState, tag: string, qId: string): boolean =>
  s.decisions.some(d => d.questionId === qId) && hasTag(s, tag);
