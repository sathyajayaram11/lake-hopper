import { describe, expect, it, vi } from 'vitest';
import type { Store } from '../../../src/core/state/store';

// Fresh module per test so dispatches never leak between tests via the module-level singleton.
async function freshStore(): Promise<Store> {
  vi.resetModules();
  const mod = await import('../../../src/core/state/store');
  return mod.store;
}

describe('store', () => {
  it('updates player and leaves run untouched on player/laneChanged', async () => {
    const store = await freshStore();
    const before = store.getState();

    store.dispatch({ type: 'player/laneChanged', lane: 2 });

    const after = store.getState();
    expect(after.player.lane).toBe(2);
    expect(after.run).toBe(before.run);
  });

  it('updates run and leaves player untouched on run/started', async () => {
    const store = await freshStore();
    const before = store.getState();

    store.dispatch({ type: 'run/started', runId: 'r1' });

    const after = store.getState();
    expect(after.run).toEqual({ status: 'running', runId: 'r1', distanceM: 0, score: 0, isNightOwl: false, dayNumber: 1 });
    expect(after.player).toBe(before.player);
  });

  it('updates session and leaves run/player untouched on session/loginCompleted', async () => {
    const store = await freshStore();
    const before = store.getState();

    store.dispatch({ type: 'session/loginCompleted', playerId: 'p1' });

    const after = store.getState();
    expect(after.session).toEqual({ loggedIn: true, playerId: 'p1' });
    expect(after.run).toBe(before.run);
    expect(after.player).toBe(before.player);
  });

  it('updates stage and leaves run/player/session untouched on stage/entered', async () => {
    const store = await freshStore();
    const before = store.getState();

    store.dispatch({ type: 'stage/entered', stageId: 'gate', stageIndex: 0, visualEffect: null, countdownMs: null });

    const after = store.getState();
    expect(after.stage).toEqual({ currentStageId: 'gate', stageIndex: 0, visualEffect: null, countdownRemainingMs: null });
    expect(after.run).toBe(before.run);
    expect(after.player).toBe(before.player);
    expect(after.session).toBe(before.session);
  });

  it('updates chaser and leaves run/player/session/stage untouched on chaser/reset', async () => {
    const store = await freshStore();
    const before = store.getState();

    store.dispatch({ type: 'chaser/reset', targetGapM: 30 });

    const after = store.getState();
    expect(after.chaser).toEqual({ distanceBehindM: 30, targetGapM: 30 });
    expect(after.run).toBe(before.run);
    expect(after.player).toBe(before.player);
    expect(after.session).toBe(before.session);
    expect(after.stage).toBe(before.stage);
  });

  it('notifies a subscriber after a state-changing dispatch, and stops after unsubscribe', async () => {
    const store = await freshStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.dispatch({ type: 'player/laneChanged', lane: 0 });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.dispatch({ type: 'player/laneChanged', lane: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('does not notify subscribers for an action neither reducer recognizes', async () => {
    const store = await freshStore();
    const listener = vi.fn();
    store.subscribe(listener);

    // @ts-expect-error deliberately dispatching an action outside the known union
    store.dispatch({ type: 'nothing/recognizes-this' });

    expect(listener).not.toHaveBeenCalled();
  });
});
