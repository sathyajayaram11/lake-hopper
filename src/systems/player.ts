import { LANE_CHANGE_DURATION_MS } from '../config/lanes';
import { selectPlayerLane } from '../core/state/selectors';
import type { Store } from '../core/state/store';
import type { InputSystem } from './input';
import type { System } from './system';
import { applyLaneDirection } from '../logic/lanes';

export function createPlayerSystem(deps: { input: InputSystem; store: Store }): System {
  let simTimeMs = 0;
  let laneChangedAtMs = -Infinity;
  let bufferedDirection: -1 | 0 | 1 = 0;

  function isTweening(): boolean {
    return simTimeMs - laneChangedAtMs < LANE_CHANGE_DURATION_MS;
  }

  function applyDirection(direction: -1 | 0 | 1): void {
    const currentLane = selectPlayerLane(deps.store.getState());
    const nextLane = applyLaneDirection(currentLane, direction);
    if (nextLane === currentLane) return;
    deps.store.dispatch({ type: 'player/laneChanged', lane: nextLane });
    laneChangedAtMs = simTimeMs;
  }

  return {
    fixedUpdate(dtMs) {
      simTimeMs += dtMs;
      const { laneDirection } = deps.input.consumeIntent();

      if (isTweening()) {
        if (laneDirection !== 0 && bufferedDirection === 0) bufferedDirection = laneDirection;
        return;
      }

      if (bufferedDirection !== 0) {
        const direction = bufferedDirection;
        bufferedDirection = 0;
        applyDirection(direction);
        return;
      }

      if (laneDirection !== 0) applyDirection(laneDirection);
    },
  };
}
