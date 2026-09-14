import { describe, expect, it, vi } from 'vitest';
import { createPool, type Poolable } from '../../../src/logic/pools/pool';

class FakePoolable implements Poolable {
  active = false;
  resetCalls: unknown[] = [];

  reset(cfg: unknown): void {
    this.resetCalls.push(cfg);
    this.active = true;
  }

  deactivate(): void {
    this.active = false;
  }
}

describe('createPool', () => {
  it('pre-warms exactly `capacity` instances at creation and never allocates more', () => {
    const factory = vi.fn(() => new FakePoolable());
    const pool = createPool(factory, 3);

    expect(factory).toHaveBeenCalledTimes(3);
    expect(pool.capacity).toBe(3);

    // Exhaust, release, and re-acquire repeatedly — factory should still never be called again.
    const a = pool.acquire('a');
    const b = pool.acquire('b');
    const c = pool.acquire('c');
    pool.release(a!);
    pool.acquire('d');

    expect(factory).toHaveBeenCalledTimes(3);
  });

  it('acquire returns an inactive instance and calls reset with the given config', () => {
    const pool = createPool(() => new FakePoolable(), 2);

    const item = pool.acquire('cfg-1');

    expect(item).not.toBeNull();
    expect(item!.active).toBe(true);
    expect(item!.resetCalls).toEqual(['cfg-1']);
  });

  it('returns null once every instance is active, instead of allocating', () => {
    const pool = createPool(() => new FakePoolable(), 2);

    pool.acquire('a');
    pool.acquire('b');
    const third = pool.acquire('c');

    expect(third).toBeNull();
    expect(pool.activeCount).toBe(2);
  });

  it('release makes an instance acquirable again', () => {
    const pool = createPool(() => new FakePoolable(), 1);

    const item = pool.acquire('a')!;
    expect(pool.acquire('b')).toBeNull();

    pool.release(item);
    const reacquired = pool.acquire('b');

    expect(reacquired).toBe(item);
    expect(pool.activeCount).toBe(1);
  });
});
