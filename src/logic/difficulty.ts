import {
  BASE_SPEED_M_S,
  DAY_SPEED_MULTIPLIER_PER_DAY,
  DIFFICULTY_BREAKPOINTS,
  type DifficultyBreakpoint,
} from '../config/difficulty';

export interface DifficultyResult {
  speedMPerS: number;
  densityMultiplier: number;
}

function currentBreakpoint(distanceM: number): DifficultyBreakpoint {
  let current = DIFFICULTY_BREAKPOINTS[0];
  for (const breakpoint of DIFFICULTY_BREAKPOINTS) {
    if (distanceM >= breakpoint.distanceM) current = breakpoint;
  }
  return current;
}

export function evaluateDifficulty(distanceM: number, dayNumber: number): DifficultyResult {
  const breakpoint = currentBreakpoint(distanceM);
  const dayMultiplier = 1 + (dayNumber - 1) * DAY_SPEED_MULTIPLIER_PER_DAY;

  return {
    speedMPerS: BASE_SPEED_M_S * breakpoint.speedMultiplier * dayMultiplier,
    densityMultiplier: breakpoint.densityMultiplier,
  };
}
