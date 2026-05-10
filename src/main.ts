// ASCEND — Entry point (task 1.5)
// Onboarding scene now live. Engine wiring: task 1.6.

import { router } from './core/router';
import { loadState, saveState, exportState, importState } from './utils/storage';
import { mountDesignSystem } from './scenes/design_system';
import { mountOnboarding, unmountOnboarding } from './scenes/onboarding';
import { mountDecision, unmountDecision } from './scenes/decision';

const root = document.getElementById('scene-root')!;

// ────�