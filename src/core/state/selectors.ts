import type { GameState } from './store';
import type { PlayerState } from './reducers/playerReducer';
import type { RunState } from './reducers/runReducer';

export function selectPlayerLane(state: GameState): 0 | 1 | 2 {
  return state.player.lane;
}

export function selectPlayerPose(state: GameState): PlayerState['pose'] {
  return state.player.pose;
}

export function selectRunStatus(state: GameState): RunState['status'] {
  return state.run.status;
}

export function selectDistanceM(state: GameState): number {
  return state.run.distanceM;
}

export function selectIsLoggedIn(state: GameState): boolean {
  return state.session.loggedIn;
}
