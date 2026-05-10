// ASCEND — Hash router
// Maps window.location.hash → SceneKey.
// The Engine (task 1.4) calls navigate(); scenes call Router.push().
// #design-system is a dev-only route that bypasses the scene system.

export type SceneKey =
  | 'onboarding'
  | 'decision'
  | 'attribute_panel'
  | 'people_panel'
  | 'annual_review'
  | 'career_timeline'
  | 'design_system';   // dev only

const HASH_TO_SCENE: Record<string, SceneKey> = {
  '#onboarding':      'onboarding',
  '#decision':        'decision',
  '#attribute-panel': 'attribute_panel',
  '#people-panel':    'people_panel',
  '#annual-review':   'annual_review',
  '#career-timeline': 'career_timeline',
  '#design-system':   'design_system',
};

const SCENE_TO_HASH: Record<SceneKey, string> = {
  onboarding:      '#onboarding',
  decision:        '#decision',
  attribute_panel: '#attribute-panel',
  people_panel:    '#people-panel',
  annual_review:   '#annual-review',
  career_timeline: '#career-timeline',
  design_system:   '#design-system',
};

type RouteHandler = (scene: SceneKey) => void;

class Router {
  private handlers: RouteHandler[] = [];

  /** Current scene derived from window.location.hash. Falls back to 'onboarding'. */
  current(): SceneKey {
    return HASH_TO_SCENE[window.location.hash] ?? 'onboarding';
  }

  /** Navigate to a scene — updates the URL and fires handlers. */
  push(scene: SceneKey): void {
    const hash = SCENE_TO_HASH[scene];
    if (window.location.hash !== hash) {
      window.location.hash = hash;
      // hashchange event fires → _dispatch() called via listener below
    } else {
      // Same route — fire handlers directly (e.g. force-refresh)
      this._dispatch(scene);
    }
  }

  /** Register a listener. Returns an unsubscribe function. */
  on(handler: RouteHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }

  /** Called once on app boot — wires the hashchange event. */
  init(): void {
    window.addEventListener('hashchange', () => {
      this._dispatch(this.current());
    });
  }

  private _dispatch(scene: SceneKey): void {
    this.handlers.forEach(h => h(scene));
  }
}

export const router = new Router();
