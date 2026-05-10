// ASCEND — Math helpers (pure)
export const clamp  = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const lerp   = (a: number, b: number, t: number) => a + (b - a) * t;
export const weightedAverage = (pairs: Array<[number, number]>): number => {
  const [sumW, sumWV] = pairs.reduce(([w, wv], [v, weight]) => [w + weight, wv + v * weight], [0, 0]);
  return sumW === 0 ? 0 : sumWV / sumW;
};
