// ASCEND — Entry point
// Scaffold landing page (task 1.1). Full engine: task 1.4.

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
    font-family: var(--font-ui, 'Inter', sans-serif);
    background: var(--color-slate, #0A0A0F);
    color: var(--color-pearl, #F4F1EA);
  }

  .hello-wordmark {
    font-family: var(--font-ui, 'Inter', sans-serif);
    font-size: clamp(2rem, 6vw, 4rem);
    font-weight: 700;
    letter-spacing: 0.18em;
    color: var(--color-pearl, #F4F1EA);
    margin: 0 0 0.25rem;
    text-transform: uppercase;
  }

  .hello-tagline {
    font-family: var(--font-narrative, 'Source Serif 4', serif);
    font-size: clamp(0.9rem, 2vw, 1.15rem);
    color: var(--color-graphite, #6B7280);
    margin: 0 0 3.5rem;
    letter-spacing: 0.04em;
  }

  .hello-divider {
    width: 2rem;
    height: 1px;
    background: var(--color-oxide, #C75B39);
    margin: 0 auto 3.5rem;
    opacity: 0.7;
  }

  .hello-status {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 0.72rem;
    color: var(--color-graphite, #6B7280);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .hello-status span {
    color: var(--color-oxide, #C75B39);
  }
`;
document.head.appendChild(style);

const root = document.getElementById('scene-root')!;
root.innerHTML = `
  <p class="hello-wordmark">AUREL</p>
  <p class="hello-tagline">London · King's Cross · 2034</p>
  <div class="hello-divider"></div>
  <p class="hello-status">Build <span>v0.0.1</span> · Scaffold ready · Engine coming in 1.4</p>
`;
