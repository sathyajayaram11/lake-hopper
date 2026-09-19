import { describe, expect, it } from 'vitest';
import { chaserReducer, initialChaserState } from '../../../../src/core/state/reducers/chaserReducer';

describe('chaserReducer', () => {
  it('chaser/reset sets both distanceBehindM and targetGapM to the new gap', () => {
    const next = chaserReducer({ distanceBehindM: 5, targetGapM: 5 }, { type: 'chaser/reset', targetGapM: 30 });
    expect(next).toEqual({ distanceBehindM: 30, targetGapM: 30 });
  });

  it('chaser/distanceSet updates only distanceBehindM', () => {
    const state = { distanceBehindM: 30, targetGapM: 30 };
    const next = chaserReducer(state, { type: 'chaser/distanceSet', distanceBehindM: 22 });
    expect(next).toEqual({ distanceBehindM: 22, targetGapM: 30 });
  });

  it('returns the same state reference for an unrecognized action', () => {
    const state = initialChaserState;

    // @ts-expect-error deliberately dispatching an action outside the known union
    const next = chaserReducer(state, { type: 'chaser/unknown' });

    expect(next).toBe(state);
  });
});
