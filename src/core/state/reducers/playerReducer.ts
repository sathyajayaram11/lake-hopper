import type { Pose } from '../../../logic/state-machine';

export interface PlayerState {
  lane: 0 | 1 | 2;
  pose: Pose;
  shieldCharges: number;
  poseElapsedMs: number;
  slowUntilSimMs: number; // 0 = not slowed
}

export const initialPlayerState: PlayerState = {
  lane: 1,
  pose: 'Running',
  shieldCharges: 0,
  poseElapsedMs: 0,
  slowUntilSimMs: 0,
};

export type PlayerAction =
  | { type: 'player/laneChanged'; lane: 0 | 1 | 2 }
  | { type: 'player/poseUpdated'; pose: Pose; elapsedMs: number; shieldCharges: number }
  | { type: 'player/slowed'; slowUntilSimMs: number };

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'player/laneChanged':
      return { ...state, lane: action.lane };
    case 'player/poseUpdated':
      return { ...state, pose: action.pose, poseElapsedMs: action.elapsedMs, shieldCharges: action.shieldCharges };
    case 'player/slowed':
      return { ...state, slowUntilSimMs: action.slowUntilSimMs };
    default:
      return state;
  }
}
