import { describe, expect, it, vi } from 'vitest';
import { CATCH_RADIUS_M } from '../../src/config/chaser';
import { HIT_WINDOW_M } from '../../src/config/collision';
import type { EventBus } from '../../src/core/events/bus';
import type { InputSystem } from '../../src/systems/input';
import { createPlayerSystem } from '../../src/systems/player';
import type { Store } from '../../src/core/state/store';

async function freshStore(): Promise<Store> {
  vi.resetModules();
  const mod = await import('../../src/core/state/store');
  return mod.store;
}

function fakeInput(overrides: Partial<{ laneDirection: -1 | 0 | 1; jumpRequested: boolean; slideRequested: boolean }> = {}) {
  let next = { laneDirection: 0 as -1 | 0 | 1, jumpRequested: false, slideRequested: false, ...overrides };
  const system: InputSystem = {
    attach: () => {},
    detach: () => {},
    consumeIntent: () => {
      const value = next;
      next = { laneDirection: 0, jumpRequested: false, slideRequested: false };
      return value;
    },
  };
  return {
    system,
    queue: (direction: -1 | 0 | 1) => {
      next = { ...next, laneDirection: direction };
    },
    queueJump: () => {
      next = { ...next, jumpRequested: true };
    },
    queueSlide: () => {
      next = { ...next, slideRequested: true };
    },
  };
}

function fakeBus(): EventBus {
  return { emit: vi.fn(), on: vi.fn(), once: vi.fn() } as unknown as EventBus;
}

describe('createPlayerSystem — lane handling (unchanged by this step)', () => {
  it('moves exactly one lane on a single input tick', async () => {
    const store = await freshStore();
    const input = fakeInput();
    const player = createPlayerSystem({ input: input.system, store, bus: fakeBus() });

    input.queue(1);
    player.fixedUpdate?.(100);

    expect(store.getState().player.lane).toBe(2);
  });

  it('buffers a second input arriving before the tween window elapses, then applies it once the window passes', async () => {
    const store = await freshStore();
    const input = fakeInput();
    const player = createPlayerSystem({ input: input.system, store, bus: fakeBus() });

    input.queue(1);
    player.fixedUpdate?.(100);
    expect(store.getState().player.lane).toBe(2);

    input.queue(-1);
    player.fixedUpdate?.(50);
    expect(store.getState().player.lane).toBe(2);

    player.fixedUpdate?.(100);
    expect(store.getState().player.lane).toBe(2);

    player.fixedUpdate?.(100);
    expect(store.getState().player.lane).toBe(1);
  });

  it('does not start a new tween window when a direction is clamped to a no-op', async () => {
    const store = await freshStore();
    const input = fakeInput();
    const player = createPlayerSystem({ input: input.system, store, bus: fakeBus() });

    input.queue(1);
    player.fixedUpdate?.(1000);
    player.fixedUpdate?.(1000);
    expect(store.getState().player.lane).toBe(2);

    input.queue(1); // already at the right edge -> clamped no-op
    player.fixedUpdate?.(10);
    expect(store.getState().player.lane).toBe(2);

    input.queue(-1); // if the no-op above had wrongly started a tween, this would be buffered instead of applied now
    player.fixedUpdate?.(10);
    expect(store.getState().player.lane).toBe(1);
  });

  it('does nothing to lane when there is no input', async () => {
    const store = await freshStore();
    const input = fakeInput();
    const player = createPlayerSystem({ input: input.system, store, bus: fakeBus() });

    player.fixedUpdate?.(100);

    expect(store.getState().player.lane).toBe(1);
  });
});

describe('createPlayerSystem — pose handling', () => {
  it('starts jumping on a jump request and auto-returns to Running after the jump duration', async () => {
    const store = await freshStore();
    const input = fakeInput();
    const player = createPlayerSystem({ input: input.system, store, bus: fakeBus() });

    input.queueJump();
    player.fixedUpdate?.(16);
    expect(store.getState().player.pose).toBe('Jumping');

    for (let i = 0; i < 40; i++) player.fixedUpdate?.(16); // well past JUMP_DURATION_MS
    expect(store.getState().player.pose).toBe('Running');
  });

  it('a nearby stumble-effect hazard in the player lane transitions to Stumbling and emits player_stumbled', async () => {
    const store = await freshStore();
    const input = fakeInput();
    const bus = fakeBus();
    const player = createPlayerSystem({ input: input.system, store, bus });

    store.dispatch({
      type: 'hazards/updated',
      hazards: [{ hazardId: 'barrier-arm', lane: 1, distanceFromPlayerM: 0, heightBand: 'mid', effect: 'stumble' }],
    });

    player.fixedUpdate?.(16);

    expect(store.getState().player.pose).toBe('Stumbling');
    expect(bus.emit).toHaveBeenCalledWith('player_stumbled', { stageId: '', distance: 0, hazardId: 'barrier-arm' });
  });

  it('ignores a hazard outside HIT_WINDOW_M', async () => {
    const store = await freshStore();
    const input = fakeInput();
    const player = createPlayerSystem({ input: input.system, store, bus: fakeBus() });

    store.dispatch({
      type: 'hazards/updated',
      hazards: [{ hazardId: 'far-away', lane: 1, distanceFromPlayerM: HIT_WINDOW_M + 5, heightBand: 'mid', effect: 'stumble' }],
    });

    player.fixedUpdate?.(16);

    expect(store.getState().player.pose).toBe('Running');
  });

  it('a second stumble hit while already Stumbling and the chaser within CATCH_RADIUS_M ends in Caught, emitting player_caught', async () => {
    const store = await freshStore();
    const input = fakeInput();
    const bus = fakeBus();
    const player = createPlayerSystem({ input: input.system, store, bus });

    store.dispatch({
      type: 'hazards/updated',
      hazards: [{ hazardId: 'barrier-arm', lane: 1, distanceFromPlayerM: 0, heightBand: 'mid', effect: 'stumble' }],
    });
    store.dispatch({ type: 'chaser/reset', targetGapM: CATCH_RADIUS_M });

    player.fixedUpdate?.(16); // Running -> Stumbling
    player.fixedUpdate?.(16); // Stumbling + hit + chaser close -> Caught

    expect(store.getState().player.pose).toBe('Caught');
    expect(bus.emit).toHaveBeenCalledWith('player_caught', { stageId: '', distance: 0, hazardId: 'barrier-arm' });
  });

  it('a slow-effect hazard sets slowUntilSimMs without touching pose or emitting anything', async () => {
    const store = await freshStore();
    const input = fakeInput();
    const bus = fakeBus();
    const player = createPlayerSystem({ input: input.system, store, bus });

    store.dispatch({
      type: 'hazards/updated',
      hazards: [{ hazardId: 'spill', lane: 1, distanceFromPlayerM: 0, heightBand: 'mid', effect: 'slow' }],
    });

    player.fixedUpdate?.(16);

    expect(store.getState().player.pose).toBe('Running');
    expect(store.getState().player.slowUntilSimMs).toBeGreaterThan(0);
    expect(bus.emit).not.toHaveBeenCalled();
  });

  it('a stumble hit with a shield charge is absorbed: pose stays Running, no event emitted', async () => {
    const store = await freshStore();
    store.dispatch({ type: 'player/poseUpdated', pose: 'Running', elapsedMs: 0, shieldCharges: 1 });
    const input = fakeInput();
    const bus = fakeBus();
    const player = createPlayerSystem({ input: input.system, store, bus });

    store.dispatch({
      type: 'hazards/updated',
      hazards: [{ hazardId: 'barrier-arm', lane: 1, distanceFromPlayerM: 0, heightBand: 'mid', effect: 'stumble' }],
    });

    player.fixedUpdate?.(16);

    expect(store.getState().player.pose).toBe('Running');
    expect(store.getState().player.shieldCharges).toBe(0);
    expect(bus.emit).not.toHaveBeenCalled();
  });

  it('does nothing to pose with no input and no hazards present (real state today, before spawning exists)', async () => {
    const store = await freshStore();
    const input = fakeInput();
    const player = createPlayerSystem({ input: input.system, store, bus: fakeBus() });

    player.fixedUpdate?.(100);

    expect(store.getState().player.pose).toBe('Running');
  });
});
