import type { PerspectiveCamera } from 'three';
import { CAMERA_FOLLOW_LERP, CAMERA_FOV_MIN, CAMERA_LATERAL_LERP, CAMERA_OFFSET } from '../config/camera';
import { selectPlayerLane } from '../core/state/selectors';
import type { Store } from '../core/state/store';
import { laneToWorldX } from '../logic/lanes';
import type { System } from './system';

export function createCameraSystem(deps: { camera: PerspectiveCamera; store: Store }): System {
  deps.camera.fov = CAMERA_FOV_MIN;
  deps.camera.updateProjectionMatrix();

  return {
    render() {
      const lane = selectPlayerLane(deps.store.getState());
      const targetX = laneToWorldX(lane) + CAMERA_OFFSET.x;

      const { position } = deps.camera;
      position.x += (targetX - position.x) * CAMERA_LATERAL_LERP;
      position.y += (CAMERA_OFFSET.y - position.y) * CAMERA_FOLLOW_LERP;
      position.z += (CAMERA_OFFSET.z - position.z) * CAMERA_FOLLOW_LERP;
    },
  };
}
