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

  it('returns the same state reference for an unrecognized action', () => {
    const state = initialRunState;

    // @ts-expect-error deliberately dispatching an action outside the known union
    const next = runReducer(state, { type: 'run/unknown' });

    expect(next).toBe(state);
  });
});
