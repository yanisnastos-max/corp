// ASCEND — Engine (scene orchestration)
// Full implementation: task 1.4
// SceneKey is defined in router.ts; Engine imports from there.

import type { SceneKey } from './router';

// Engine wires together: GameState + EventBus + Router + SceneManager
// Stub — implemented in task 1.4
export class Engine {
  async transition(_to: SceneKey, _payload?: unknown): Promise<void> {
    throw new Error('Engine not yet implemented — task 1.4');
  }
}
