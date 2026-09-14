import type { EventCatalog } from './catalog';

type Handler<T> = (payload: T) => void;

export interface EventBus {
  emit<K extends keyof EventCatalog>(name: K, payload: EventCatalog[K]): void;
  on<K extends keyof EventCatalog>(name: K, handler: Handler<EventCatalog[K]>): () => void;
  once<K extends keyof EventCatalog>(name: K, handler: Handler<EventCatalog[K]>): void;
}

function createEventBus(): EventBus {
  const handlers = new Map<keyof EventCatalog, Set<Handler<unknown>>>();

  return {
    emit(name, payload) {
      const set = handlers.get(name);
      if (!set) return;
      for (const handler of set) handler(payload);
    },
    on(name, handler) {
      let set = handlers.get(name);
      if (!set) {
        set = new Set();
        handlers.set(name, set);
      }
      set.add(handler as Handler<unknown>);
      return () => set!.delete(handler as Handler<unknown>);
    },
    once(name, handler) {
      const unsubscribe = this.on(name, (payload) => {
        unsubscribe();
        handler(payload);
      });
    },
  };
}

export const eventBus = createEventBus();
