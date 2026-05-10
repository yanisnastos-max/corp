// ASCEND — Entry point
// Task 1.2: hash-based pre-router (/#design-system) for dev tooling.
// Full engine: task 1.4.

import { mountDesignSystem } from './scenes/design_system';
import { loadState } from './utils/storage';

const root = document.getElementById('scene-root')!;

function route(): void {
  const hash = window.location.hash;

  if (hash === '#design-system') {
    document.title = 'ASCEND — Design System';
    mountDesignSystem(root);
    return;
  }

  // Default: scaffold landing page
  mountLanding();
}

function mountLanding(): void {
  const state = loadState();

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
      margin: 0 0 3.5rem;
      letter-spacing: 0.04em;
    }
    .hello-divider {
      width: 2rem;
      height: 1px;
      background: var(--color-accent-default);
      margin: 0 auto 3.5rem;
      opacity: 0.7;
    }
    .hello-links {
      display: flex;
      gap: 1.5rem;
    }
    .hello-link {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--color-text-muted);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-decoration: none;
      border-bottom: 1px solid var(--color-border-subtle);
      padding-bottom: 2px;
      transition: color var(--transition-fast), border-color var(--transition-fast);
    }
    .hello-link:hover {
      color: var(--color-text-accent);
      border-color: var(--color-accent-default);
    }
    .hello-status {
      margin-top: 3rem;
      font-family: var(--font-mono);
      font-size: 0.68rem;
      color: var(--color-text-disabled);
      letter-spacing: 0.06em;
    }
    .hello-status span { color: var(--color-accent-default); }
  `;
  document.head.appendChild(style);

  const statusLine = state
    ? `<p class="hello-status">Save found · Year <span>${state.year}</span> · Engine pending (1.4)</p>`
    : `<p class="hello-status">Build <span>v0.0.1</span> · Scaffold ready · Engine pending (1.4)</p>`;

  root.innerHTML = `
    <p class="hello-wordmark">AUREL</p>
    <p class="hello-tagline">London · King's Cross · 2034</p>
    <div class="hello-divider"></div>
    <nav class="hello-links">
      <a class="hello-link" href="#design-system">Design System →</a>
    </nav>
    ${statusLine}
  `;

  // Wire the design system link to re-route without full page reload
  root.querySelector<HTMLAnchorElement>('a[href="#design-system"]')
    ?.addEventListener('click', e => {
      e.preventDefault();
      window.location.hash = '#design-system';
    });
}

// Initial route + handle browser back/forward
route();
window.addEventListener('hashchange', () => {
  root.innerHTML = '';
  document.querySelectorAll('#ds-styles').forEach(el => el.remove());
  route();
});
