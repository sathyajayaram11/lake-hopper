import type { Pose } from './state-machine';

export interface HazardHitbox {
  lane: 0 | 1 | 2;
  heightBand: 'low' | 'mid' | 'high';
  effect: 'stumble' | 'slow';
}

export function resolveHazardHit(playerLane: 0 | 1 | 2, playerPose: Pose, hazard: HazardHitbox): 'stumble' | 'slow' | null {
  if (hazard.lane !== playerLane) return null;

  const cleared =
    (hazard.heightBand === 'low' && playerPose === 'Jumping') ||
    (hazard.heightBand === 'high' && playerPose === 'Sliding');
  if (cleared) return null;

  return hazard.effect;
}
