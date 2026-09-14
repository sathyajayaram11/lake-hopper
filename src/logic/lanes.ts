import { LANE_CHANGE_DURATION_MS, LANE_WIDTH_M } from '../config/lanes';

export function laneToWorldX(lane: 0 | 1 | 2): number {
  return (lane - 1) * LANE_WIDTH_M;
}

export function easeOutCubic(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1);
  return 1 - Math.pow(1 - clamped, 3);
}

export function laneTweenX(
  fromLane: 0 | 1 | 2,
  toLane: 0 | 1 | 2,
  elapsedMs: number,
  durationMs: number = LANE_CHANGE_DURATION_MS,
): number {
  const t = easeOutCubic(elapsedMs / durationMs);
  const from = laneToWorldX(fromLane);
  const to = laneToWorldX(toLane);
  return from + (to - from) * t;
}
