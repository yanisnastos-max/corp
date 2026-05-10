// ASCEND — Typed data loader
// All paths are relative to import.meta.env.BASE_URL so they resolve
// correctly both on localhost (/) and on GitHub Pages (/corp/).
// Runtime validation runs in dev mode only.

import type { Question, NpcDefinition, BackgroundsFile, TraitsFile, ReviewRules } from './types';
import {
  validateQuestion,
  validateNpc,
  validateBackgrounds,
  validateTraits,
  validateReviewRules,
} from './validator';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, ''); // strip trailing slash

// ─────────────────────────────────────────────
// FETCH HELPER
// ─────────────────────────────────────────────

async function fetchJson(path: string): Promise<unknown> {
  const url = `${BASE}${path}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`[ASCEND loader] Failed to fetch ${url} — ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────
// QUESTIONS
// ─────────────────────────────────────────────

export async function loadQuestion(year: number, n: number): Promise<Question> {
  const id   = `y${String(year).padStart(2, '0')}q${String(n).padStart(2, '0')}`;
  const path = `/data/questions/year${year}/${id}.json`;
  const data = await fetchJson(path);
  if (import.meta.env.DEV) validateQuestion(data, path);
  return data as Question;
}

export async function loadAllQuestionsForYear(year: number, count = 10): Promise<Question[]> {
  return Promise.all(
    Array.from({ length: count }, (_, i) => loadQuestion(year, i + 1)),
  );
}

// ─────────────────────────────────────────────
// NPCS
// ─────────────────────────────────────────────

export async function loadNpc(id: string, tier: 1 | 2 = 1): Promise<NpcDefinition> {
  const tierDir = tier === 1 ? 'tier1' : 'tier2a';
  const path    = `/data/npcs/${tierDir}/${id}.json`;
  const data    = await fetchJson(path);
  if (import.meta.env.DEV) validateNpc(data, path);
  return data as NpcDefinition;
}

export async function loadTier1Npcs(): Promise<NpcDefinition[]> {
  const ids = [
    'dana_sutcliffe',
    'zara_okafor',
    'leo_chen',
    'grace_oduya',
    'sofia',
    'conrad_mensah',
  ];
  return Promise.all(ids.map(id => loadNpc(id, 1)));
}

// ─────────────────────────────────────────────
// BACKGROUNDS & TRAITS
// ─────────────────────────────────────────────

export async function loadBackgrounds(): Promise<BackgroundsFile> {
  const path = '/data/backgrounds.json';
  const data = await fetchJson(path);
  if (import.meta.env.DEV) validateBackgrounds(data, path);
  return data as BackgroundsFile;
}

export async function loadTraits(): Promise<TraitsFile> {
  const path = '/data/traits.json';
  const data = await fetchJson(path);
  if (import.meta.env.DEV) validateTraits(data, path);
  return data as TraitsFile;
}

// ─────────────────────────────────────────────
// REVIEW RULES
// ─────────────────────────────────────────────

export async function loadReviewRules(): Promise<ReviewRules> {
  const path = '/data/review-rules.json';
  const data = await fetchJson(path);
  if (import.meta.env.DEV) validateReviewRules(data, path);
  return data as ReviewRules;
}
