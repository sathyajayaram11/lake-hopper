export interface Poolable {
  active: boolean;
  reset(cfg: unknown): void;
  deactivate(): void;
}

export interface Pool<T extends Poolable> {
  acquire(cfg: unknown): T | null;
  release(item: T): void;
  readonly activeCount: number;
  readonly capacity: number;
}

export function createPool<T extends Poolable>(factory: () => T, capacity: number): Pool<T> {
  const items: T[] = Array.from({ length: capacity }, factory);

  return {
    acquire(cfg) {
      const item = items.find((candidate) => !candidate.active);
      if (!item) return null;
      item.reset(cfg);
      return item;
    },
    release(item) {
      item.deactivate();
    },
    get activeCount() {
      return items.filter((item) => item.active).length;
    },
    get capacity() {
      return items.length;
    },
  };
}
