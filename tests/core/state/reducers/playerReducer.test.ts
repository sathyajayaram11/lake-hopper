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

    expect(next).toEqual({ ...state, lane: 2 });
  });

  it('player/poseUpdated sets pose, poseElapsedMs, and shieldCharges, leaving lane/slowUntilSimMs untouched', () => {
    const state: PlayerState = { ...initialPlayerState, lane: 2, slowUntilSimMs: 500 };

    const next = playerReducer(state, { type: 'player/poseUpdated', pose: 'Jumping', elapsedMs: 0, shieldCharges: 1 });

    expect(next).toEqual({ lane: 2, pose: 'Jumping', shieldCharges: 1, poseElapsedMs: 0, slowUntilSimMs: 500 });
  });

  it('player/slowed sets only slowUntilSimMs', () => {
    const next = playerReducer(initialPlayerState, { type: 'player/slowed', slowUntilSimMs: 3000 });

    expect(next).toEqual({ ...initialPlayerState, slowUntilSimMs: 3000 });
  });

  it('returns the same state reference for an unrecognized action', () => {
    const state = initialPlayerState;

    // @ts-expect-error deliberately dispatching an action outside the known union
    const next = playerReducer(state, { type: 'player/unknown' });

    expect(next).toBe(state);
  });
});
