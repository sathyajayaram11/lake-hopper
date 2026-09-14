import { initialPlayerState, playerReducer, type PlayerAction, type PlayerState } from './reducers/playerReducer';
import { initialRunState, runReducer, type RunAction, type RunState } from './reducers/runReducer';

export interface GameState {
  run: RunState;
  player: PlayerState;
}

export type Action = RunAction | PlayerAction;

export interface Store {
  getState(): GameState;
  dispatch(action: Action): void;
  subscribe(listener: (state: GameState) => void): () => void;
}

const initialState: GameState = { run: initialRunState, player: initialPlayerState };

// Each reducer's `default` branch returns its slice unchanged for action types it
// doesn't own, so running every action through both reducers is safe.
function rootReducer(state: GameState, action: Action): GameState {
  const run = runReducer(state.run, action as RunAction);
  const player = playerReducer(state.player, action as PlayerAction);
  if (run === state.run && player === state.player) return state;
  return { run, player };
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
