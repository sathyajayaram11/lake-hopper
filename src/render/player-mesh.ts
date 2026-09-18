import { Mesh } from 'three';
import { now } from '../core/loop/clock';
import { selectPlayerLane } from '../core/state/selectors';
import type { Store } from '../core/state/store';
import { laneToWorldX, laneTweenX } from '../logic/lanes';
import { playerCapsuleGeometry } from './assets/geometries';
import { playerCapsuleMaterial } from './assets/materials';
import type { System } from '../systems/system';

export function createPlayerMesh(deps: { store: Store }): System & { mesh: Mesh } {
  const mesh = new Mesh(playerCapsuleGeometry, playerCapsuleMaterial);

  let toLane = selectPlayerLane(deps.store.getState());
  let fromLane = toLane;
  let changedAtMs = now();
  mesh.position.x = laneToWorldX(toLane);

  return {
    mesh,
    render() {
      const currentLane = selectPlayerLane(deps.store.getState());
      if (currentLane !== toLane) {
        fromLane = toLane;
        toLane = currentLane;
        changedAtMs = now();
      }

      const elapsedMs = now() - changedAtMs;
      mesh.position.x = laneTweenX(fromLane, toLane, elapsedMs);
    },
  };
}
