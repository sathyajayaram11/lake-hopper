import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EventBus } from '../../src/core/events/bus';

vi.mock('../../src/core/net/posthog', () => ({
  capturePostHogEvent: vi.fn(),
}));

async function freshBus(): Promise<EventBus> {
  vi.resetModules();
  const mod = await import('../../src/core/events/bus');
  return mod.eventBus;
}

describe('initAnalyticsSystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('forwards app_opened, login_completed, and run_started live, in order, exactly once each', async () => {
    const bus = await freshBus();
    const { initAnalyticsSystem } = await import('../../src/systems/analytics');
    const { capturePostHogEvent } = await import('../../src/core/net/posthog');
    initAnalyticsSystem({ bus });

    bus.emit('app_opened', { timestamp: 1 });
    bus.emit('login_completed', { playerId: 'p1', section: 'A' });
    bus.emit('run_started', { runId: 'r1', characterId: null, timestamp: 2 });

    expect(capturePostHogEvent).toHaveBeenNthCalledWith(1, 'app_opened', { timestamp: 1 });
    expect(capturePostHogEvent).toHaveBeenNthCalledWith(2, 'login_completed', { playerId: 'p1', section: 'A' });
    expect(capturePostHogEvent).toHaveBeenNthCalledWith(3, 'run_started', { runId: 'r1', characterId: null, timestamp: 2 });
    expect(capturePostHogEvent).toHaveBeenCalledTimes(3);
  });

  it('forwards player_stumbled and player_caught live', async () => {
    const bus = await freshBus();
    const { initAnalyticsSystem } = await import('../../src/systems/analytics');
    const { capturePostHogEvent } = await import('../../src/core/net/posthog');
    initAnalyticsSystem({ bus });

    bus.emit('player_stumbled', { stageId: 'gate', distance: 120, hazardId: 'barrier-arm' });
    bus.emit('player_caught', { stageId: 'gate', distance: 130, hazardId: 'barrier-arm' });

    expect(capturePostHogEvent).toHaveBeenNthCalledWith(1, 'player_stumbled', { stageId: 'gate', distance: 120, hazardId: 'barrier-arm' });
    expect(capturePostHogEvent).toHaveBeenNthCalledWith(2, 'player_caught', { stageId: 'gate', distance: 130, hazardId: 'barrier-arm' });
  });

  it('does not forward a UI intent event', async () => {
    const bus = await freshBus();
    const { initAnalyticsSystem } = await import('../../src/systems/analytics');
    const { capturePostHogEvent } = await import('../../src/core/net/posthog');
    initAnalyticsSystem({ bus });

    bus.emit('LoginSubmitted', { name: 'x', section: 'y' });

    expect(capturePostHogEvent).not.toHaveBeenCalled();
  });
});
