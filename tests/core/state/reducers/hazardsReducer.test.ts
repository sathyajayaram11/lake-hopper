import { describe, expect, it } from 'vitest';
import {
  hazardsReducer,
  initialHazardsState,
  type ActiveHazardInfo,
  type ActivePickupInfo,
} from '../../../../src/core/state/reducers/hazardsReducer';

const hazard: ActiveHazardInfo = { hazardId: 'barrier-arm', lane: 1, distanceFromPlayerM: 40, heightBand: 'mid', effect: 'stumble' };
const pickup: ActivePickupInfo = { pickupId: 'chai', lane: 0, distanceFromPlayerM: 20 };

describe('hazardsReducer', () => {
  it('hazards/updated replaces only hazards, leaving pickups untouched', () => {
    const state = { hazards: [], pickups: [pickup] };
    const next = hazardsReducer(state, { type: 'hazards/updated', hazards: [hazard] });
    expect(next).toEqual({ hazards: [hazard], pickups: [pickup] });
  });

  it('pickups/updated replaces only pickups, leaving hazards untouched', () => {
    const state = { hazards: [hazard], pickups: [] };
    const next = hazardsReducer(state, { type: 'pickups/updated', pickups: [pickup] });
    expect(next).toEqual({ hazards: [hazard], pickups: [pickup] });
  });

  it('returns the same state reference for an unrecognized action', () => {
    const state = initialHazardsState;

    // @ts-expect-error deliberately dispatching an action outside the known union
    const next = hazardsReducer(state, { type: 'hazards/unknown' });

    expect(next).toBe(state);
  });
});
