export interface PlayerState {
  lane: 0 | 1 | 2;
  pose: 'Running' | 'Jumping' | 'Sliding' | 'Stumbling' | 'Caught';
  shieldCharges: number;
}

export const initialPlayerState: PlayerState = {
  lane: 1,
  pose: 'Running',
  shieldCharges: 0,
};

export type PlayerAction = { type: 'player/laneChanged'; lane: 0 | 1 | 2 };

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'player/laneChanged':
      return { ...state, lane: action.lane };
    default:
      return state;
  }
}
