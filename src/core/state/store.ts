import { initialPlayerState, playerReducer, type PlayerAction, type PlayerState } from './reducers/playerReducer';
import { initialRunState, runReducer, type RunAction, type RunState } from './reducers/runReducer';
import { initialSessionState, sessionReducer, type SessionAction, type SessionState } from './reducers/sessionReducer';
import { initialStageState, stageReducer, type StageAction, type StageState } from './reducers/stageReducer';

export interface GameState {
  run: RunState;
  player: PlayerState;
  session: SessionState;
  stage: StageState;
}

export type Action = RunAction | PlayerAction | SessionAction | StageAction;

export interface Store {
  getState(): GameState;
  dispatch(action: Action): void;
  subscribe(listener: (state: GameState) => void): () => void;
}

const initialState: GameState = {
  run: initialRunState,
  player: initialPlayerState,
  session: initialSessionState,
  stage: initialStageState,
};

// Each reducer's `default` branch returns its slice unchanged for action types it
// doesn't own, so running every action through all four reducers is safe.
function rootReducer(state: GameState, action: Action): GameState {
  const run = runReducer(state.run, action as RunAction);
  const player = playerReducer(state.player, action as PlayerAction);
  const session = sessionReducer(state.session, action as SessionAction);
  const stage = stageReducer(state.stage, action as StageAction);
  if (run === state.run && player === state.player && session === state.session && stage === state.stage) return state;
  return { run, player, session, stage };
}

function createStore(): Store {
  let state = initialState;
  const listeners = new Set<(state: GameState) => void>();

  return {
    getState: () => state,
    dispatch(action) {
      const next = rootReducer(state, action);
      if (next === state) return;
      state = next;
      for (const listener of listeners) listener(state);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const store = createStore();
