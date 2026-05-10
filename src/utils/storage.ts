// ASCEND — localStorage persistence + JSON export/import
import type { GameState } from '../core/state';

const KEY     = 'ascend_save';
const VERSION = 1;

// ─────────────────────────────────────────────
// PERSISTENCE
// ─────────────────────────────────────────────

export function saveState(state: GameState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function loadState(): GameState | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.version !== VERSION) {
      console.warn(`[ASCEND] Save version mismatch (expected ${VERSION}, got ${parsed.version}). Discarding.`);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearState(): void {
  localStorage.removeItem(KEY);
}

// ─────────────────────────────────────────────
// EXPORT — triggers a browser file download
// ─────────────────────────────────────────────

export function exportState(state: GameState): void {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  const filename  = `ascend-save-y${state.year}-${timestamp}.json`;
  const blob      = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url       = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();

  // Revoke after a short delay so the download has time to start
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ─────────────────────────────────────────────
// IMPORT — opens a file picker, reads JSON, validates
// ─────────────────────────────────────────────

export function importState(): Promise<GameState | null> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type   = 'file';
    input.accept = '.json,application/json';

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string) as GameState;
          if (!isValidState(parsed)) {
            console.error('[ASCEND] Import failed: not a valid save file.');
            resolve(null);
            return;
          }
          resolve(parsed);
        } catch {
          console.error('[ASCEND] Import failed: could not parse JSON.');
          resolve(null);
        }
      };
      reader.readAsText(file);
    });

    // Resolve null if dialog is dismissed without selection
    input.addEventListener('cancel', () => resolve(null));

    input.click();
  });
}

// ─────────────────────────────────────────────
// VALIDATION (lightweight — full check is task 1.4's validator)
// ─────────────────────────────────────────────

function isValidState(obj: unknown): obj is GameState {
  if (!obj || typeof obj !== 'object') return false;
  const s = obj as Record<string, unknown>;
  return (
    typeof s['version'] === 'number' &&
    s['version'] === VERSION         &&
    typeof s['year'] === 'number'    &&
    typeof s['player'] === 'object'  &&
    Array.isArray(s['decisions'])    &&
    typeof s['stats'] === 'object'
  );
}
