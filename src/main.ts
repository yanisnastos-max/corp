// ASCEND — Entry point (task 1.5)
// Onboarding scene now live. Engine wiring: task 1.6.

import { router } from './core/router';
import { loadState, saveState, exportState, importState } from './utils/storage';
import { mountDesignSystem } from './scenes/design_system';
import { mountOnboarding, unmountOnboarding } from './scenes/onboarding';

const root = document.getElementById('scene-root')!;

// ─────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────

router.init();
router.on(scene => render(scene));
render(router.current());

// ─────────────────────────────────────────────
// RENDER DISPATCH
// ─────────────────────────────────────────────

function render(scene: string): void {
  // Clean up previous scene
  root.innerHTML = '';
  document.querySelectorAll('#ds-styles').forEach(el => el.remove());

  if (scene === 'design_system') {
    document.title = 'ASCEND — Design System';
    mountDesignSystem(root);
    return;
  }

  if (scene === 'onboarding') {
    document.title = 'ASCEND — New Game';
    unmountOnboarding();
    mountOnboarding(root);
    return;
  }

  // decision / panels / review: placeholder until Engine is wired (task 1.6)
  if (scene === 'decision' || scene === 'annual_review' || scene === 'career_timeline') {
    const state = loadState();
    document.title = 'ASCEND';
    root.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;
                  font-family:var(--font-ui);color:var(--color-text-muted);gap:var(--space-4);">
        <p style="font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:.1em;text-transform:uppercase;
                  color:var(--color-text-accent)">Scene: ${scene}</p>
        ${state ? `<p style="font-size:var(--text-sm)">Logged in as ${state.player.name} · Year ${state.year}</p>` : ''}
        <p style="font-size:var(--text-xs);color:var(--color-text-disabled)">Engine coming in task 1.6</p>
        <button onclick="window.location.hash=''" style="margin-top:var(--space-4);font-family:var(--font-mono);
          font-size:var(--text-xs);background:none;border:1px solid var(--color-border-default);
          color:var(--color-text-muted);padding:var(--space-2) var(--space-4);border-radius:var(--radius-base);cursor:pointer;">
          ← Back to landing
        </button>
      </div>`;
    return;
  }

  // Default: landing
  document.title = 'ASCEND';
  mountLanding();
}

// ─────────────────────────────────────────────
// LANDING PAGE (scaffold; replaced scene-by-scene from task 1.4 onward)
// ─────────────────────────────────────────────

function mountLanding(): void {
  let state = loadState();

  const style = document.createElement('style');
  style.textContent = `
    #scene-root {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
      box-sizing: border-box;
    }
    .hello-wordmark {
      font-family: var(--font-ui);
      font-size: clamp(2rem, 6vw, 4rem);
      font-weight: 700;
      letter-spacing: 0.18em;
      color: var(--color-text-primary);
      margin: 0 0 0.25rem;
      text-transform: uppercase;
    }
    .hello-tagline {
      font-family: var(--font-narrative);
      font-size: clamp(0.9rem, 2vw, 1.15rem);
      color: var(--color-text-muted);
      margin: 0 0 3rem;
      letter-spacing: 0.04em;
    }
    .hello-divider {
      width: 2rem;
      height: 1px;
      background: var(--color-accent-default);
      margin: 0 auto 3rem;
      opacity: 0.7;
    }
    .hello-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .hello-btn {
      font-family: var(--font-ui);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      padding: var(--space-3) var(--space-8);
      border-radius: var(--radius-base);
      cursor: pointer;
      border: 1px solid transparent;
      transition: background var(--transition-fast), border-color var(--transition-fast);
      min-width: 180px;
      text-align: center;
    }
    .hello-btn-primary {
      background: var(--color-accent-default);
      color: var(--color-surface-base);
      border-color: var(--color-accent-default);
    }
    .hello-btn-primary:hover { background: var(--color-accent-hover); border-color: var(--color-accent-hover); }
    .hello-btn-ghost {
      background: transparent;
      color: var(--color-text-secondary);
      border-color: var(--color-border-default);
    }
    .hello-btn-ghost:hover { background: var(--color-surface-raised); border-color: var(--color-border-strong); }
    .hello-links {
      display: flex;
      gap: 1.5rem;
      margin-top: 2.5rem;
    }
    .hello-link {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      color: var(--color-text-muted);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-decoration: none;
      border-bottom: 1px solid var(--color-border-subtle);
      padding-bottom: 2px;
      transition: color var(--transition-fast), border-color var(--transition-fast);
      background: none;
      cursor: pointer;
    }
    .hello-link:hover { color: var(--color-text-accent); border-color: var(--color-accent-default); }
    .hello-status {
      margin-top: 2.5rem;
      font-family: var(--font-mono);
      font-size: 0.68rem;
      color: var(--color-text-disabled);
      letter-spacing: 0.06em;
    }
    .hello-status span { color: var(--color-accent-default); }
    .hello-toast {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      background: var(--color-surface-overlay);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-base);
      padding: var(--space-2) var(--space-4);
      color: var(--color-text-secondary);
      opacity: 0;
      transition: opacity var(--transition-reveal);
      pointer-events: none;
    }
    .hello-toast.visible { opacity: 1; }
  `;
  document.head.appendChild(style);

  const hasSave = !!state;

  root.innerHTML = `
    <p class="hello-wordmark">AUREL</p>
    <p class="hello-tagline">London · King's Cross · 2034</p>
    <div class="hello-divider"></div>
    <div class="hello-actions">
      ${hasSave
        ? `<button class="hello-btn hello-btn-primary" id="btn-continue">Continue — Year ${state!.year}</button>`
        : `<button class="hello-btn hello-btn-primary" id="btn-new">New Game</button>`
      }
      ${hasSave ? `<button class="hello-btn hello-btn-ghost" id="btn-new">New Game</button>` : ''}
      <button class="hello-btn hello-btn-ghost" id="btn-import">Import Save</button>
    </div>
    <nav class="hello-links">
      <button class="hello-link" id="btn-export" ${hasSave ? '' : 'disabled style="opacity:0.3;cursor:default"'}>Export Save</button>
      <button class="hello-link" id="link-ds">Design System →</button>
    </nav>
    <p class="hello-status">Build <span>v0.0.1</span> · Engine pending (1.4)</p>
    <div class="hello-toast" id="toast"></div>
  `;

  // ── Wire buttons ──

  root.querySelector('#btn-new')?.addEventListener('click', () => {
    router.push('onboarding');
  });

  root.querySelector('#btn-continue')?.addEventListener('click', () => {
    toast('Engine not yet implemented — task 1.4.');
  });

  root.querySelector('#btn-export')?.addEventListener('click', () => {
    if (state) {
      exportState(state);
      toast('Save exported.');
    }
  });

  root.querySelector('#btn-import')?.addEventListener('click', () => {
    importState().then(imported => {
      if (imported) {
        saveState(imported);
        state = imported;
        toast(`Save imported — Year ${imported.year}.`);
        mountLanding();
      } else {
        toast('Import cancelled or file invalid.');
      }
    });
  });

  root.querySelector('#link-ds')?.addEventListener('click', () => {
    router.push('design_system');
  });
}

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────

let toastTimer: ReturnType<typeof setTimeout> | null = null;

function toast(msg: string): void {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 3000);
}
