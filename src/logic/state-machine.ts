import { STUMBLE_GRACE_MS } from '../config/collision';
import { JUMP_DURATION_MS, SLIDE_DURATION_MS } from '../config/pose';

export type Pose = 'Running' | 'Jumping' | 'Sliding' | 'Stumbling' | 'Caught';

export interface PoseState {
  pose: Pose;
  elapsedMs: number;
  shieldCharges: number;
}

export interface PoseInput {
  jumpRequested: boolean;
  slideRequested: boolean;
  stumbleHit: boolean;
  chaserWithinCatchRadius: boolean;
}

export function transitionPose(state: PoseState, input: PoseInput, dtMs: number): PoseState {
  if (state.pose === 'Caught') {
    return state; // terminal; nothing reads Caught's elapsedMs, so no reason to keep advancing it
  }

  if (input.stumbleHit) {
    if (state.shieldCharges > 0) {
      return { ...state, shieldCharges: state.shieldCharges - 1 };
    }
    if (state.pose === 'Stumbling' && input.chaserWithinCatchRadius) {
      return { ...state, pose: 'Caught', elapsedMs: 0 };
    }
    return { ...state, pose: 'Stumbling', elapsedMs: 0 };
  }

  const elapsedMs = state.elapsedMs + dtMs;

  switch (state.pose) {
    case 'Running':
      if (input.jumpRequested) return { ...state, pose: 'Jumping', elapsedMs: 0 };
      if (input.slideRequested) return { ...state, pose: 'Sliding', elapsedMs: 0 };
      return state; // Running has no duration to track; avoid a no-op dispatch every tick
    case 'Jumping':
      if (elapsedMs >= JUMP_DURATION_MS) return { ...state, pose: 'Running', elapsedMs: 0 };
      return { ...state, elapsedMs };
    case 'Sliding':
      if (elapsedMs >= SLIDE_DURATION_MS) return { ...state, pose: 'Running', elapsedMs: 0 };
      return { ...state, elapsedMs };
    case 'Stumbling':
      if (elapsedMs >= STUMBLE_GRACE_MS) return { ...state, pose: 'Running', elapsedMs: 0 };
      return { ...state, elapsedMs };
  }
}
