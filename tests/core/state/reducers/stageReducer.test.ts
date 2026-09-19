import { describe, expect, it } from 'vitest';
import { initialStageState, stageReducer, type StageState } from '../../../../src/core/state/reducers/stageReducer';

describe('stageReducer', () => {
  it('fully replaces the stage slice on stage/entered, including resetting countdown to null', () => {
    const staleState: StageState = {
      currentStageId: 'old',
      stageIndex: 4,
      visualEffect: { name: 'lag', intensityKey: 'stage11Lag' },
      countdownRemainingMs: 500,
    };

    const next = stageReducer(staleState, {
      type: 'stage/entered',
      stageId: 'door',
      stageIndex: 2,
      visualEffect: null,
      countdownMs: null,
    });

    expect(next).toEqual({ currentStageId: 'door', stageIndex: 2, visualEffect: null, countdownRemainingMs: null });
  });

  it('sets a countdown when the new stage has one', () => {
    const next = stageReducer(initialStageState, {
      type: 'stage/entered',
      stageId: 'door',
      stageIndex: 2,
      visualEffect: null,
      countdownMs: 10000,
    });

    expect(next.countdownRemainingMs).toBe(10000);
  });

  it('stage/countdownTicked updates only countdownRemainingMs', () => {
    const state: StageState = { currentStageId: 'door', stageIndex: 2, visualEffect: null, countdownRemainingMs: 10000 };

    const next = stageReducer(state, { type: 'stage/countdownTicked', remainingMs: 9800 });

    expect(next).toEqual({ ...state, countdownRemainingMs: 9800 });
  });

  it('returns the same state reference for an unrecognized action', () => {
    const state = initialStageState;

    // @ts-expect-error deliberately dispatching an action outside the known union
    const next = stageReducer(state, { type: 'stage/unknown' });

    expect(next).toBe(state);
  });
});
