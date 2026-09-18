import { PerspectiveCamera } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { CAMERA_FOLLOW_LERP, CAMERA_FOV_MIN, CAMERA_LATERAL_LERP, CAMERA_OFFSET } from '../../src/config/camera';
import { laneToWorldX } from '../../src/logic/lanes';
import type { Store } from '../../src/core/state/store';

async function freshStore(): Promise<Store> {
  vi.resetModules();
  const mod = await import('../../src/core/state/store');
  return mod.store;
}

describe('createCameraSystem', () => {
  it('sets the FOV to CAMERA_FOV_MIN on creation', async () => {
    const store = await freshStore();
    const { createCameraSystem } = await import('../../src/systems/camera');
    const camera = new PerspectiveCamera(50, 1, 0.1, 1000);

    createCameraSystem({ camera, store });

    expect(camera.fov).toBe(CAMERA_FOV_MIN);
  });

  it('moves partway toward the target lane position after one render call, not a snap', async () => {
    const store = await freshStore();
    store.dispatch({ type: 'player/laneChanged', lane: 2 });
    const { createCameraSystem } = await import('../../src/systems/camera');
    const camera = new PerspectiveCamera(50, 1, 0.1, 1000);

    const system = createCameraSystem({ camera, store });
    system.render?.(0);

    const targetX = laneToWorldX(2) + CAMERA_OFFSET.x;
    expect(camera.position.x).toBeCloseTo(targetX * CAMERA_LATERAL_LERP);
    expect(camera.position.y).toBeCloseTo(CAMERA_OFFSET.y * CAMERA_FOLLOW_LERP);
    expect(camera.position.z).toBeCloseTo(CAMERA_OFFSET.z * CAMERA_FOLLOW_LERP);
  });

  it('converges close to the full target offset after many render calls', async () => {
    const store = await freshStore();
    store.dispatch({ type: 'player/laneChanged', lane: 0 });
    const { createCameraSystem } = await import('../../src/systems/camera');
    const camera = new PerspectiveCamera(50, 1, 0.1, 1000);

    const system = createCameraSystem({ camera, store });
    for (let i = 0; i < 500; i++) system.render?.(0);

    const targetX = laneToWorldX(0) + CAMERA_OFFSET.x;
    expect(camera.position.x).toBeCloseTo(targetX, 5);
    expect(camera.position.y).toBeCloseTo(CAMERA_OFFSET.y, 5);
    expect(camera.position.z).toBeCloseTo(CAMERA_OFFSET.z, 5);
  });
});
