export interface ChaserState {
  distanceBehindM: number;
  targetGapM: number;
}

export const initialChaserState: ChaserState = {
  distanceBehindM: 0,
  targetGapM: 0,
};

export type ChaserAction =
  | { type: 'chaser/reset'; targetGapM: number }
  | { type: 'chaser/distanceSet'; distanceBehindM: number };

export function chaserReducer(state: ChaserState, action: ChaserAction): ChaserState {
  switch (action.type) {
    case 'chaser/reset':
      return { distanceBehindM: action.targetGapM, targetGapM: action.targetGapM };
    case 'chaser/distanceSet':
      return { ...state, distanceBehindM: action.distanceBehindM };
    default:
      return state;
  }
}
