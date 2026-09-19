export const BASE_SPEED_M_S = 6; // floor speed, at distance 0

export interface DifficultyBreakpoint {
  distanceM: number;
  speedMultiplier: number;
  densityMultiplier: number;
}

// Sorted ascending by distanceM; the first entry must start at 0.
export const DIFFICULTY_BREAKPOINTS: DifficultyBreakpoint[] = [
  { distanceM: 0, speedMultiplier: 1.0, densityMultiplier: 0.6 },
  { distanceM: 300, speedMultiplier: 1.1, densityMultiplier: 0.8 },
  { distanceM: 700, speedMultiplier: 1.2, densityMultiplier: 1.0 },
  { distanceM: 1200, speedMultiplier: 1.35, densityMultiplier: 1.2 },
];

export const DAY_SPEED_MULTIPLIER_PER_DAY = 0.15; // +15% speed per additional day
