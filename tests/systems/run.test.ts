import { describe, expect, it, vi } from 'vitest';
import type { EventBus } from '../../src/core/events/bus';
import type { Store } from '../../src/core/state/store';

async function freshDeps(): Promise<{ bus: EventBus; store: Store }> {
  vi.resetModules();
  const busMod = await import('../../src/core/events/bus');
  const storeMod = await import('../../src/core/state/store');
  return { bus: busMod.eventBus, store: storeMod.store };
}

describe('initRunSystem', () => {
  it('starts the run in GameState and emits run_started on RunStartRequested', async () => {
    const { bus, store } = await freshDeps();
    const { initRunSystem } = await import('../../src/systems/run');
    initRunSystem({ bus, store });

    const runStarted = vi.fn();
    bus.on('run_started', runStarted);

    bus.emit('LoginSubmitted', { name: 'x', section: 'y' }); // unrelated event should not interfere
    bus.emit('RunStartRequested', { characterId: 'topper' });

    const state = store.getState();
    expect(state.run.status).toBe('running');
    expect(state.run.runId).toBeTruthy();

    expect(runStarted).toHaveBeenCalledTimes(1);
    const payload = runStarted.mock.calls[0][0];
    expect(payload.runId).toBe(state.run.runId);
    expect(payload.characterId).toBe('topper');
    expect(typeof payload.timestamp).toBe('number');
  });
});
