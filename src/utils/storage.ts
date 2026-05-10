// ASCEND — localStorage persistence with version checking
import type { GameState } from '../core/state';

const KEY     = 'ascend_save';
const VERSION = 1;

export function saveState(state: GameState): void {
  localStorage.setItem(KEY, JSON.stringify({ ...state, version: VERSION }));
}

export function loadState(): GameState | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.version !== VERSION) return null; // migrate in future
    return parsed;
  } catch { return null; }
}

export function clearState(): void {
  localStorage.removeItem(KEY);
}
