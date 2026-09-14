import { describe, expect, it } from 'vitest';
import { LANE_CHANGE_DURATION_MS, LANE_WIDTH_M } from '../../src/config/lanes';
import { easeOutCubic, laneToWorldX, laneTweenX } from '../../src/logic/lanes';

describe('laneToWorldX', () => {
  it('centers the middle lane at 0 and spaces the outer lanes symmetrically', () => {
    expect(laneToWorldX(1)).toBe(0);
    expect(laneToWorldX(0)).toBe(-LANE_WIDTH_M);
    expect(laneToWorldX(2)).toBe(LANE_WIDTH_M);
  });
});

describe('easeOutCubic', () => {
  it('starts at 0 and ends at 1', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
  });

  it('is already past the halfway point in progress at t=0.5 (fast start, slow finish)', () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });

  it('clamps outside [0, 1]', () => {
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
  });
});

describe('laneTweenX', () => {
  it('starts at the from-lane position and ends at the to-lane position', () => {
    expect(laneTweenX(0, 2, 0)).toBe(laneToWorldX(0));
    expect(laneTweenX(0, 2, LANE_CHANGE_DURATION_MS)).toBe(laneToWorldX(2));
  });

  it('does not overshoot past the tween duration', () => {
    expect(laneTweenX(0, 2, LANE_CHANGE_DURATION_MS * 2)).toBe(laneToWorldX(2));
  });

  it('sits strictly between the two lanes, ahead of the linear midpoint, at the halfway mark', () => {
    const midpoint = laneTweenX(0, 2, LANE_CHANGE_DURATION_MS / 2);
    const linearMidpoint = (laneToWorldX(0) + laneToWorldX(2)) / 2;
    expect(midpoint).toBeGreaterThan(linearMidpoint);
    expect(midpoint).toBeLessThan(laneToWorldX(2));
  });
});
