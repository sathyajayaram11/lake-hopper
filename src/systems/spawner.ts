import type { Mesh } from 'three';
import { BASE_SPEED_M_S } from '../config/difficulty';
import { SEGMENT_POOL_SIZE } from '../config/pools';
import { SEGMENT_LENGTH_M } from '../config/track';
import { createPool } from '../logic/pools/pool';
import { TrackSegmentMesh } from '../render/track-segment';
import type { Store } from '../core/state/store';
import type { System } from './system';

export function createSpawnerSystem(deps: { store: Store }): System & { segmentMeshes(): Mesh[] } {
  const pool = createPool(() => new TrackSegmentMesh(), SEGMENT_POOL_SIZE);
  const activeSegments: TrackSegmentMesh[] = [];
  const trackLengthM = SEGMENT_POOL_SIZE * SEGMENT_LENGTH_M;
  const recycleThresholdM = trackLengthM / 2;

  return {
    init() {
      for (let i = 0; i < SEGMENT_POOL_SIZE; i++) {
        const zPositionM = (i - SEGMENT_POOL_SIZE / 2) * SEGMENT_LENGTH_M;
        const segment = pool.acquire({ zPositionM });
        if (segment) activeSegments.push(segment);
      }
    },
    fixedUpdate(dtMs) {
      const distanceThisTickM = BASE_SPEED_M_S * (dtMs / 1000);
      for (const segment of activeSegments) {
        segment.mesh.position.z += distanceThisTickM;
        if (segment.mesh.position.z > recycleThresholdM) {
          segment.mesh.position.z -= trackLengthM;
        }
      }
      deps.store.dispatch({ type: 'run/distanceAdvanced', deltaM: distanceThisTickM });
    },
    segmentMeshes() {
      return activeSegments.map((segment) => segment.mesh);
    },
  };
}
