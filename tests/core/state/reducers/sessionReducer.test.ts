import { describe, expect, it } from 'vitest';
import { initialSessionState, sessionReducer } from '../../../../src/core/state/reducers/sessionReducer';

describe('sessionReducer', () => {
  it('sets loggedIn and playerId on session/loginCompleted', () => {
    const next = sessionReducer(initialSessionState, { type: 'session/loginCompleted', playerId: 'p1' });

    expect(next).toEqual({ loggedIn: true, playerId: 'p1' });
  });

  it('returns the same state reference for an unrecognized action', () => {
    const state = initialSessionState;

    // @ts-expect-error deliberately dispatching an action outside the known union
    const next = sessionReducer(state, { type: 'session/unknown' });

    expect(next).toBe(state);
  });
});
