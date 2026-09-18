export interface RunState {
  status: 'idle' | 'running' | 'ended';
  runId: string | null;
  distanceM: number;
  score: number;
  isNightOwl: boolean;
  dayNumber: number;
}

export const initialRunState: RunState = {
  status: 'idle',
  runId: null,
  distanceM: 0,
  score: 0,
  isNightOwl: false,
  dayNumber: 1,
};

export type RunAction =
  | { type: 'run/started'; runId: string }
  | { type: 'run/distanceAdvanced'; deltaM: number };

export function runReducer(state: RunState, action: RunAction): RunState {
  switch (action.type) {
    case 'run/started':
      return { status: 'running', runId: action.runId, distanceM: 0, score: 0, isNightOwl: false, dayNumber: 1 };
    case 'run/distanceAdvanced':
      return { ...state, distanceM: state.distanceM + action.deltaM };
    default:
      return state;
  }
}
