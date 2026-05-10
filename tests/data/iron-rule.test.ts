// Validates iron rule: every question option must have ≥1 gain AND ≥1 cost
// Full implementation: task 1.5
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Iron rule — question options', () => {
  const questionsDir = join(process.cwd(), 'data/questions/year1');
  const files = readdirSync(questionsDir).filter(f => f.endsWith('.json'));

  files.forEach(file => {
    it(`${file}: every option has ≥1 gain and ≥1 cost`, () => {
      const q = JSON.parse(readFileSync(join(questionsDir, file), 'utf8'));
      for (const option of q.options) {
        const gains  = option.statDeltas.filter((d: {delta: number}) => d.delta > 0);
        const costs  = option.statDeltas.filter((d: {delta: number}) => d.delta < 0);
        expect(gains.length, `${file} option ${option.id}: no gain`).toBeGreaterThan(0);
        expect(costs.length, `${file} option ${option.id}: no cost`).toBeGreaterThan(0);
      }
    });
  });
});
