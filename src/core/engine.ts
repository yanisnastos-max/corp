// ASCEND — Engine (scene orchestration)
// Full implementation: task 1.4

export type SceneKey =
  | 'onboarding' | 'decision' | 'attribute_panel'
  | 'people_panel' | 'annual_review' | 'career_timeline';

// Engine wires together: GameState + EventBus + SceneManager
// Stub — implemented in task 1.4
export class Engine {
  async transition(_to: SceneKey, _payload?: unknown): Promise<void> {
    throw new Error('Engine not yet implemented — task 1.4');
  }
}
