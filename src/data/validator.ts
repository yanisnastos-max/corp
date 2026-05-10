// ASCEND — Runtime schema validation (dev mode only)
// Full implementation: task 1.5
// Iron rule: every question option must have ≥1 positive AND ≥1 negative statDelta

export function validateQuestion(q: unknown): void {
  if (!import.meta.env.DEV) return;
  // Stub — full validation in task 1.5
  if (!q || typeof q !== 'object') throw new Error('Invalid question object');
}
