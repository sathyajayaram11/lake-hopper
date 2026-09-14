import { describe, expect, it } from 'vitest';
import {
  initialPlayerState,
  playerReducer,
  type PlayerState,
} from '../../../../src/core/state/reducers/playerReducer';

describe('playerReducer', () => {
  it('updates lane on player/laneChanged and leaves other fields untouched', () => {
    const state: PlayerState = { ...initialPlayerState, pose: 'Running', shieldCharges: 1 };

    const next = playerReducer(state, { type: 'player/laneChanged', lane: 2 });

    expect(next).toEqual({ lane: 2, pose: 'Running', shieldCharges: 1 });
  });

  it('returns the same state reference for an unrecognized action', () => {
    const state = initialPlayerState;

    // @ts-expect-error deliberately dispatching an action outside the known union
    const next = playerReducer(state, { type: 'player/unknown' });

    expect(next).toBe(state);
  });
});
