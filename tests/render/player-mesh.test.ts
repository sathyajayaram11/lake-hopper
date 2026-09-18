import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LANE_CHANGE_DURATION_MS } from '../../src/config/lanes';
import { laneToWorldX } from '../../src/logic/lanes';
import type { Store } from '../../src/core/state/store';

async function freshStore(): Promise<Store> {
  vi.resetModules();
  const mod = await import('../../src/core/state/store');
  return mod.store;
}

describe('createPlayerMesh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at the current lane position', async () => {
    const store = await freshStore();
    const { createPlayerMesh } = await import('../../src/render/player-mesh');
    const player = createPlayerMesh({ store });

    expect(player.mesh.position.x).toBe(laneToWorldX(1));
  });

  it('sits at the old lane position immediately after a lane change (elapsed ~ 0)', async () => {
    const store = await freshStore();
    const { createPlayerMesh } = await import('../../src/render/player-mesh');
    const player = createPlayerMesh({ store });

    store.dispatch({ type: 'player/laneChanged', lane: 2 });
    player.render?.(0);

    expect(player.mesh.position.x).toBeCloseTo(laneToWorldX(1));
  });

  it('settles at the new lane position once the tween duration has elapsed', async () => {
    const store = await freshStore();
    const { createPlayerMesh } = await import('../../src/render/player-mesh');
    const player = createPlayerMesh({ store });

    store.dispatch({ type: 'player/laneChanged', lane: 2 });
    player.render?.(0);
    vi.setSystemTime(LANE_CHANGE_DURATION_MS);
    player.render?.(0);

    expect(player.mesh.position.x).toBeCloseTo(laneToWorldX(2));
  });

  it("tweens a second change from the first change's destination, not a stale lane", async () => {
    const store = await freshStore();
    const { createPlayerMesh } = await import('../../src/render/player-mesh');
    const player = createPlayerMesh({ store });

    store.dispatch({ type: 'player/laneChanged', lane: 2 });
    player.render?.(0);
    vi.setSystemTime(LANE_CHANGE_DURATION_MS);
    player.render?.(0); // first tween fully settled at lane 2

    vi.setSystemTime(LANE_CHANGE_DURATION_MS + 10);
    store.dispatch({ type: 'player/laneChanged', lane: 0 });
    player.render?.(0); // second tween just started -> "from" should be lane 2, not lane 1

    expect(player.mesh.position.x).toBeCloseTo(laneToWorldX(2));
  });
});
