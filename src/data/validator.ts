// ASCEND — Runtime content validator
// Runs in dev mode on every fetch (import.meta.env.DEV guard).
// Build-time equivalent is the Vite plugin in vite.config.ts.
//
// Iron rule (enforced here and at build): every question option
// must have ≥1 statDelta with delta > 0 AND ≥1 with delta < 0.

import type { Question, NpcDefinition, BackgroundsFile, TraitsFile, ReviewRules } from './types';

// ─────────────────────────────────────────────
// ENTRY POINTS (called by loader.ts in dev)
// ─────────────────────────────────────────────

export function validateQuestion(data: unknown, src = 'unknown'): Question {
  assertObject(data, src);
  const q = data as Record<string, unknown>;

  requireString(q, 'id', src);
  requireNumber(q, 'year', src);
  requireNumber(q, 'questionNumber', src);
  requireString(q, 'setup', src);
  requireArray(q, 'options', src);

  const options = q['options'] as unknown[];
  if (options.length !== 4) {
    fail(src, `expected 4 options, got ${options.length}`);
  }

  for (const opt of options) {
    validateOption(opt, q['id'] as string, src);
  }

  return data as Question;
}

export function validateNpc(data: unknown, src = 'unknown'): NpcDefinition {
  assertObject(data, src);
  const n = data as Record<string, unknown>;

  requireString(n, 'id', src);
  requireString(n, 'name', src);
  requireString(n, 'archetype', src);
  requireNumber(n, 'startingRelationshipBase', src);
  requireObject(n, 'voicePattern', src);
  requireArray(n, 'arcBeats', src);

  return data as NpcDefinition;
}

export function validateBackgrounds(data: unknown, src = 'unknown'): BackgroundsFile {
  assertObject(data, src);
  const f = data as Record<string, unknown>;

  requireArray(f, 'backgrounds', src);
  const bgs = f['backgrounds'] as unknown[];
  if (bgs.length < 1) fail(src, 'backgrounds array is empty');

  for (const bg of bgs) {
    assertObject(bg, src);
    const b = bg as Record<string, unknown>;
    requireString(b, 'id', src);
    requireString(b, 'name', src);
    requireArray(b, 'primaryBonuses', src);
  }

  return data as BackgroundsFile;
}

export function validateTraits(data: unknown, src = 'unknown'): TraitsFile {
  assertObject(data, src);
  const f = data as Record<string, unknown>;

  requireArray(f, 'traits', src);
  const traits = f['traits'] as unknown[];
  if (traits.length < 1) fail(src, 'traits array is empty');

  for (const t of traits) {
    assertObject(t, src);
    const tr = t as Record<string, unknown>;
    requireString(tr, 'id', src);
    requireString(tr, 'displayText', src);
  }

  return data as TraitsFile;
}

export function validateReviewRules(data: unknown, src = 'unknown'): ReviewRules {
  assertObject(data, src);
  const r = data as Record<string, unknown>;

  requireObject(r, 'formula', src);
  const formula = r['formula'] as Record<string, unknown>;
  requireObject(formula, 'attributeAggregate', src);
  requireObject(formula, 'performanceScore', src);

  return data as ReviewRules;
}

// ─────────────────────────────────────────────
// IRON RULE
// ─────────────────────────────────────────────

function validateOption(opt: unknown, questionId: string, src: string): void {
  assertObject(opt, src);
  const o = opt as Record<string, unknown>;

  requireString(o, 'id', src);
  requireString(o, 'text', src);
  requireArray(o, 'statDeltas', src);
  requireString(o, 'innerMonologue', src);

  const deltas = o['statDeltas'] as Array<Record<string, unknown>>;
  const gains  = deltas.filter(d => typeof d['delta'] === 'number' && (d['delta'] as number) > 0);
  const costs  = deltas.filter(d => typeof d['delta'] === 'number' && (d['delta'] as number) < 0);

  if (gains.length === 0) {
    fail(src, `Iron rule violation — ${questionId} option ${String(o['id'])}: no positive statDelta (gain required)`);
  }
  if (costs.length === 0) {
    fail(src, `Iron rule violation — ${questionId} option ${String(o['id'])}: no negative statDelta (cost required)`);
  }
}

// ─────────────────────────────────────────────
// ASSERTION HELPERS
// ─────────────────────────────────────────────

function fail(src: string, msg: string): never {
  throw new Error(`[ASCEND validator] ${src}: ${msg}`);
}

function assertObject(val: unknown, src: string): asserts val is Record<string, unknown> {
  if (!val || typeof val !== 'object' || Array.isArray(val)) {
    fail(src, `expected an object, got ${typeof val}`);
  }
}

function requireString(obj: Record<string, unknown>, key: string, src: string): void {
  if (typeof obj[key] !== 'string' || (obj[key] as string).trim() === '') {
    fail(src, `"${key}" must be a non-empty string`);
  }
}

function requireNumber(obj: Record<string, unknown>, key: string, src: string): void {
  if (typeof obj[key] !== 'number') {
    fail(src, `"${key}" must be a number`);
  }
}

function requireArray(obj: Record<string, unknown>, key: string, src: string): void {
  if (!Array.isArray(obj[key])) {
    fail(src, `"${key}" must be an array`);
  }
}

function requireObject(obj: Record<string, unknown>, key: string, src: string): void {
  const v = obj[key];
  if (!v || typeof v !== 'object' || Array.isArray(v)) {
    fail(src, `"${key}" must be an object`);
  }
}
