import { describe, expect, it } from 'vitest';
import { BASE_SPEED_M_S, DIFFICULTY_BREAKPOINTS } from '../../src/config/difficulty';
import { evaluateDifficulty } from '../../src/logic/difficulty';

describe('evaluateDifficulty', () => {
  it('returns exactly BASE_SPEED_M_S at distance 0, day 1', () => {
    expect(evaluateDifficulty(0, 1).speedMPerS).toBe(BASE_SPEED_M_S);
  });

  it('uses the previous tier just below a breakpoint threshold', () => {
    const secondBreakpoint = DIFFICULTY_BREAKPOINTS[1];
    const result = evaluateDifficulty(secondBreakpoint.distanceM - 1, 1);
    expect(result.speedMPerS).toBe(BASE_SPEED_M_S * DIFFICULTY_BREAKPOINTS[0].speedMultiplier);
  });

  it('switches to the new tier exactly at and above a breakpoint threshold', () => {
    const secondBreakpoint = DIFFICULTY_BREAKPOINTS[1];
    const result = evaluateDifficulty(secondBreakpoint.distanceM, 1);
    expect(result.speedMPerS).toBe(BASE_SPEED_M_S * secondBreakpoint.speedMultiplier);
    expect(result.densityMultiplier).toBe(secondBreakpoint.densityMultiplier);
  });

  it('applies the day multiplier once for day 2', () => {
    const result = evaluateDifficulty(0, 2);
    expect(result.speedMPerS).toBeCloseTo(BASE_SPEED_M_S * 1.15);
  });

  it('applies the day multiplier twice (additively) for day 3', () => {
    const result = evaluateDifficulty(0, 3);
    expect(result.speedMPerS).toBeCloseTo(BASE_SPEED_M_S * 1.3);
  });

  it('densityMultiplier depends only on distance, not day', () => {
    const day1 = evaluateDifficulty(0, 1).densityMultiplier;
    const day5 = evaluateDifficulty(0, 5).densityMultiplier;
    expect(day1).toBe(day5);
  });
});
