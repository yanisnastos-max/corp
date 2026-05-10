// ASCEND — DOM helpers
// Full implementation: task 1.1

export const qs  = <T extends Element>(sel: string, ctx: ParentNode = document) =>
  ctx.querySelector<T>(sel);
export const qsa = <T extends Element>(sel: string, ctx: ParentNode = document) =>
  [...ctx.querySelectorAll<T>(sel)];
export const el  = <K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Partial<Record<string, string>> = {}) => {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => { if (v !== undefined) node.setAttribute(k, v); });
  return node;
};

export function animateBar(fill: HTMLElement, targetPct: number, delayMs = 100): void {
  setTimeout(() => { fill.style.width = `${targetPct}%`; }, delayMs);
}

export function fadeIn(node: HTMLElement, durationMs = 180): void {
  node.style.opacity = '0';
  node.style.transition = `opacity ${durationMs}ms ease-in-out`;
  requestAnimationFrame(() => requestAnimationFrame(() => { node.style.opacity = '1'; }));
}
