import { describe, expect, it, vi } from 'vitest';
import type { InputSystem } from '../../src/systems/input';
import { createPlayerSystem } from '../../src/systems/player';
import type { Store } from '../../src/core/state/store';

async function freshStore(): Promise<Store> {
  vi.resetModules();
  const mod = await import('../../src/core/state/store');
  return mod.store;
}

function fakeInput() {
  let next: -1 | 0 | 1 = 0;
  const system: InputSystem = {
    attach: () => {},
    detach: () => {},
    consumeIntent: () => {
      const value = next;
      next = 0;
      return { laneDirection: value, jumpRequested: false, slideRequested: false };
    },
  };
  return { system, queue: (direction: -1 | 0 | 1) => { next = direction; } };
}

describe('createPlayerSystem', () => {
  it('moves exactly one lane on a single input tick', async () => {
    const store = await freshStore();
    const input = fakeInput();
    const player = createPlayerSystem({ input: input.system, store });

    input.queue(1);
    player.fixedUpdate?.(100);

    expect(store.getState().player.lane).toBe(2);
  });

  it('buffers a second input arriving before the tween window elapses, then applies it once the window passes', async () => {
    const store = await freshStore();
    const input = fakeInput();
    const player = createPlayerSystem({ input: input.system, store });

    input.queue(1);
    player.fixedUpdate?.(100); // lane 1 -> 2
    expect(store.getState().player.lane).toBe(2);

    input.queue(-1);
    player.fixedUpdate?.(50); // still tweening (50ms since change) — buffered, not applied
    expect(store.getState().player.lane).toBe(2);

    player.fixedUpdate?.(100); // still tweening (150ms since change < 220ms)
    expect(store.getState().player.lane).toBe(2);

    player.fixedUpdate?.(100); // tween window elapsed (250ms since change) — buffered direction applies
    expect(store.getState().player.lane).toBe(1);
  });

  it('does not start a new tween window when a direction is clamped to a no-op', async () => {
    const store = await freshStore();
    const input = fakeInput();
    const player = createPlayerSystem({ input: input.system, store });

    input.queue(1);
    player.fixedUpdate?.(1000); // lane 1 -> 2
    player.fixedUpdate?.(1000); // let the tween window fully elapse
    expect(store.getState().player.lane).toBe(2);

    input.queue(1); // already at the right edge -> clamped no-op
    player.fixedUpdate?.(10);
    expect(store.getState().player.lane).toBe(2);

    input.queue(-1); // if the no-op above had wrongly started a tween, this would be buffered instead of applied now
    player.fixedUpdate?.(10);
    expect(store.getState().player.lane).toBe(1);
  });

  it('does nothing when there is no input', async () => {
    const store = await freshStore();
    const input = fakeInput();
    const player = createPlayerSystem({ input: input.system, store });

    player.fixedUpdate?.(100);

    expect(store.getState().player.lane).toBe(1);
  });
});
