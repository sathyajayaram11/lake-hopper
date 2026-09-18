import { BoxGeometry, CapsuleGeometry } from 'three';
import { LANE_WIDTH_M } from '../../config/lanes';
import { SEGMENT_LENGTH_M } from '../../config/track';

const LANE_COUNT = 3;
const SEGMENT_THICKNESS_M = 0.2;

export const trackSegmentGeometry = new BoxGeometry(LANE_WIDTH_M * LANE_COUNT, SEGMENT_THICKNESS_M, SEGMENT_LENGTH_M);

const PLAYER_CAPSULE_RADIUS_M = 0.4;
const PLAYER_CAPSULE_LENGTH_M = 1;

export const playerCapsuleGeometry = new CapsuleGeometry(PLAYER_CAPSULE_RADIUS_M, PLAYER_CAPSULE_LENGTH_M);
