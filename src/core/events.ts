// ASCEND — EventBus (lightweight pub/sub)
// Full implementation: task 1.3
type Handler = (payload?: unknown) => void;

class EventBus {
  private listeners: Map<string, Handler[]> = new Map();

  on(event: string, handler: Handler): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(handler);
    return () => this.off(event, handler);
  }

  off(event: string, handler: Handler): void {
    const list = this.listeners.get(event);
    if (list) this.listeners.set(event, list.filter(h => h !== handler));
  }

  emit(event: string, payload?: unknown): void {
    this.listeners.get(event)?.forEach(h => h(payload));
  }
}

export const bus = new EventBus();
