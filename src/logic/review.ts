// ASCEND — Annual review formula + scorecard
// Full implementation: task 1.7
// Formula: 40% attr aggregate + 30% performance + 20% sponsor + 10% political
// Promotion: 3+ of 4 scorecard dimensions at likely+
import type { GameState } from '../core/state';

export function computeReviewScore(_state: GameState, _rules: unknown): number {
  return 0; // stub
}

export function computeScorecard(_state: GameState, _rules: unknown): Record<string, string> {
  return {}; // stub
}

export function computeOutcome(_scorecard: Record<string, string>): string {
  return 'hold_standard'; // stub
}
