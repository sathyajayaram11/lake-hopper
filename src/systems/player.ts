import { CATCH_RADIUS_M } from '../config/chaser';
import { HIT_WINDOW_M, SLOW_EFFECT_DURATION_MS } from '../config/collision';
import { LANE_CHANGE_DURATION_MS } from '../config/lanes';
import type { EventBus } from '../core/events/bus';
import { selectPlayerLane } from '../core/state/selectors';
import type { Store } from '../core/state/store';
import { resolveHazardHit } from '../logic/collision';
import { applyLaneDirection } from '../logic/lanes';
import { transitionPose, type PoseState } from '../logic/state-machine';
import type { InputSystem } from './input';
import type { System } from './system';

export function createPlayerSystem(deps: { input: InputSystem; store: Store; bus: EventBus }): System {
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
      const intent = deps.input.consumeIntent();

      if (isTweening()) {
        if (intent.laneDirection !== 0 && bufferedDirection === 0) bufferedDirection = intent.laneDirection;
      } else if (bufferedDirection !== 0) {
        const direction = bufferedDirection;
        bufferedDirection = 0;
        applyDirection(direction);
      } else if (intent.laneDirection !== 0) {
        applyDirection(intent.laneDirection);
      }

      const state = deps.store.getState();
      const player = state.player;

      const nearbyHazard =
        state.hazards.hazards.find(
          (hazard) => hazard.lane === player.lane && Math.abs(hazard.distanceFromPlayerM) <= HIT_WINDOW_M,
        ) ?? null;

      let stumbleHit = false;
      if (nearbyHazard) {
        const result = resolveHazardHit(player.lane, player.pose, nearbyHazard);
        if (result === 'stumble') {
          stumbleHit = true;
        } else if (result === 'slow') {
          deps.store.dispatch({ type: 'player/slowed', slowUntilSimMs: simTimeMs + SLOW_EFFECT_DURATION_MS });
        }
      }

      const chaserWithinCatchRadius = state.chaser.distanceBehindM <= CATCH_RADIUS_M;

      const poseState: PoseState = { pose: player.pose, elapsedMs: player.poseElapsedMs, shieldCharges: player.shieldCharges };
      const nextPose = transitionPose(poseState, { jumpRequested: intent.jumpRequested, slideRequested: intent.slideRequested, stumbleHit, chaserWithinCatchRadius }, dtMs);

      if (nextPose !== poseState) {
        deps.store.dispatch({
          type: 'player/poseUpdated',
          pose: nextPose.pose,
          elapsedMs: nextPose.elapsedMs,
          shieldCharges: nextPose.shieldCharges,
        });
      }

      if (nextPose.pose === 'Stumbling' && poseState.pose !== 'Stumbling') {
        deps.bus.emit('player_stumbled', {
          stageId: state.stage.currentStageId,
          distance: state.run.distanceM,
          hazardId: nearbyHazard?.hazardId ?? '',
        });
      }
      if (nextPose.pose === 'Caught' && poseState.pose !== 'Caught') {
        deps.bus.emit('player_caught', {
          stageId: state.stage.currentStageId,
          distance: state.run.distanceM,
          hazardId: nearbyHazard?.hazardId ?? null,
        });
      }
    },
  };
}
