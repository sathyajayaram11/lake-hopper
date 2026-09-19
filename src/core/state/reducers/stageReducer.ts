export interface StageState {
  currentStageId: string;
  stageIndex: number;
  visualEffect: { name: string; intensityKey: string } | null;
  countdownRemainingMs: number | null;
}

export const initialStageState: StageState = {
  currentStageId: '',
  stageIndex: 0,
  visualEffect: null,
  countdownRemainingMs: null,
};

export type StageAction =
  | {
      type: 'stage/entered';
      stageId: string;
      stageIndex: number;
      visualEffect: StageState['visualEffect'];
      countdownMs: number | null;
    }
  | { type: 'stage/countdownTicked'; remainingMs: number };

export function stageReducer(state: StageState, action: StageAction): StageState {
  switch (action.type) {
    case 'stage/entered':
      return {
        currentStageId: action.stageId,
        stageIndex: action.stageIndex,
        visualEffect: action.visualEffect,
        countdownRemainingMs: action.countdownMs,
      };
    case 'stage/countdownTicked':
      return { ...state, countdownRemainingMs: action.remainingMs };
    default:
      return state;
  }
}
