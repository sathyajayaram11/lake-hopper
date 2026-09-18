export interface SessionState {
  loggedIn: boolean;
  playerId: string | null;
}

export const initialSessionState: SessionState = {
  loggedIn: false,
  playerId: null,
};

export type SessionAction = { type: 'session/loginCompleted'; playerId: string };

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'session/loginCompleted':
      return { loggedIn: true, playerId: action.playerId };
    default:
      return state;
  }
}
