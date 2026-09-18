import { describe, expect, it, vi } from 'vitest';
import { BASE_SPEED_M_S } from '../../src/config/difficulty';
import { SEGMENT_POOL_SIZE } from '../../src/config/pools';
import { SEGMENT_LENGTH_M } from '../../src/config/track';
import type { Store } from '../../src/core/state/store';

async function freshStore(): Promise<Store> {
  vi.resetModules();
  const mod = await import('../../src/core/state/store');
  return mod.store;
}

describe('createSpawnerSystem', () => {
  it('init() acquires exactly SEGMENT_POOL_SIZE segments laid out contiguously around the origin', async () => {
    const store = await freshStore();
    const { createSpawnerSystem } = await import('../../src/systems/spawner');
    const spawner = createSpawnerSystem({ store });

    spawner.init?.();

    const meshes = spawner.segmentMeshes();
    expect(meshes).toHaveLength(SEGMENT_POOL_SIZE);
    const zPositions = meshes.map((mesh) => mesh.position.z).sort((a, b) => a - b);
    expect(zPositions).toEqual([-120, -80, -40, 0, 40, 80]);
  });

  it('advances every active segment by distance traveled and reports it to GameState', async () => {
    const store = await freshStore();
    const { createSpawnerSystem } = await import('../../src/systems/spawner');
    const spawner = createSpawnerSystem({ store });
    spawner.init?.();

    const before = spawner.segmentMeshes().map((mesh) => mesh.position.z);
    spawner.fixedUpdate?.(1000); // 1 second

    const expectedDeltaM = BASE_SPEED_M_S * 1;
    const after = spawner.segmentMeshes().map((mesh) => mesh.position.z);
    after.forEach((z, i) => expect(z).toBeCloseTo(before[i] + expectedDeltaM));
    expect(store.getState().run.distanceM).toBeCloseTo(expectedDeltaM);
  });

  it('recycles a segment that scrolls past the rear threshold by exactly one full track length', async () => {
    const store = await freshStore();
    const { createSpawnerSystem } = await import('../../src/systems/spawner');
    const spawner = createSpawnerSystem({ store });
    spawner.init?.();

    // Forces the segment starting at z=80 past the +120 recycle threshold (80 + 42 = 122).
    spawner.fixedUpdate?.(7000);

    const trackLengthM = SEGMENT_POOL_SIZE * SEGMENT_LENGTH_M;
    const zPositions = spawner.segmentMeshes().map((mesh) => mesh.position.z).sort((a, b) => a - b);
    expect(zPositions).toContainEqual(expect.closeTo(80 + BASE_SPEED_M_S * 7 - trackLengthM, 5));
  });
});
