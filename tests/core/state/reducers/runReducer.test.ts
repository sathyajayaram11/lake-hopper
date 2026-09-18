import { describe, expect, it } from 'vitest';
import { initialRunState, runReducer, type RunState } from '../../../../src/core/state/reducers/runReducer';

describe('runReducer', () => {
  it('sets status/runId and resets distance, score, isNightOwl, and dayNumber on run/started', () => {
    const staleState: RunState = {
      status: 'ended',
      runId: 'old-run',
      distanceM: 4200,
      score: 900,
      isNightOwl: true,
      dayNumber: 3,
    };

    const next = runReducer(staleState, { type: 'run/started', runId: 'new-run' });

    expect(next).toEqual({
      status: 'running',
      runId: 'new-run',
      distanceM: 0,
      score: 0,
      isNightOwl: false,
      dayNumber: 1,
    });
  });

  it('accumulates distanceM on run/distanceAdvanced and leaves other fields untouched', () => {
    const state: RunState = { ...initialRunState, distanceM: 10, score: 5 };

    const next = runReducer(state, { type: 'run/distanceAdvanced', deltaM: 2.5 });

    expect(next).toEqual({ ...state, distanceM: 12.5 });
  });

  it('returns the same state reference for an unrecognized action', () => {
    const state = initialRunState;

    // @ts-expect-error deliberately dispatching an action outside the known union
    const next = runReducer(state, { type: 'run/unknown' });

    expect(next).toBe(state);
  });
});
