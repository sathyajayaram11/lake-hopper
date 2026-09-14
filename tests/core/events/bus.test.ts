import { describe, expect, it, vi } from 'vitest';
import type { EventCatalog } from '../../../src/core/events/catalog';
import type { EventBus } from '../../../src/core/events/bus';

// Each test builds its own bus via a fresh import so subscriptions never leak between tests.
async function freshBus(): Promise<EventBus> {
  vi.resetModules();
  const mod = await import('../../../src/core/events/bus');
  return mod.eventBus;
}

describe('eventBus', () => {
  it('calls a subscribed handler with the emitted payload', async () => {
    const bus = await freshBus();
    const handler = vi.fn();
    bus.on('app_opened', handler);

    const payload: EventCatalog['app_opened'] = { timestamp: 123 };
    bus.emit('app_opened', payload);

    expect(handler).toHaveBeenCalledExactlyOnceWith(payload);
  });

  it('stops delivering once the returned unsubscribe is called', async () => {
    const bus = await freshBus();
    const handler = vi.fn();
    const unsubscribe = bus.on('app_opened', handler);

    unsubscribe();
    bus.emit('app_opened', { timestamp: 1 });

    expect(handler).not.toHaveBeenCalled();
  });

  it('fires a once() handler exactly one time', async () => {
    const bus = await freshBus();
    const handler = vi.fn();
    bus.once('run_started', handler);

    bus.emit('run_started', { runId: 'a', characterId: null, timestamp: 1 });
    bus.emit('run_started', { runId: 'b', characterId: null, timestamp: 2 });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ runId: 'a', characterId: null, timestamp: 1 });
  });

  it('does not throw when emitting an event with no subscribers', async () => {
    const bus = await freshBus();
    expect(() => bus.emit('login_completed', { playerId: 'p', section: 'A' })).not.toThrow();
  });
});
