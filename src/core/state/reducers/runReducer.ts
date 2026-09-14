export interface RunState {
  status: 'idle' | 'running' | 'ended';
  runId: string | null;
  distanceM: number;
  score: number;
  isNightOwl: boolean;
}

export const initialRunState: RunState = {
  status: 'idle',
  runId: null,
  distanceM: 0,
  score: 0,
  isNightOwl: false,
};

export type RunAction = { type: 'run/started'; runId: string };

export function runReducer(state: RunState, action: RunAction): RunState {
  switch (action.type) {
    case 'run/started':
      return { status: 'running', runId: action.runId, distanceM: 0, score: 0, isNightOwl: false };
    default:
      return state;
  }
}
