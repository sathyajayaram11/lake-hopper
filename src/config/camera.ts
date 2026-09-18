// Forward (the direction the player runs) is -Z; the camera sits behind on the +Z side.
export const CAMERA_OFFSET = { x: 0, y: 2.2, z: 4.5 }; // meters, behind and above the player
export const CAMERA_FOLLOW_LERP = 0.12; // per fixed tick
export const CAMERA_LATERAL_LERP = 0.06; // slower, separate axis for lane changes

export const CAMERA_FOV_MIN = 60; // degrees, at base speed
export const CAMERA_FOV_MAX = 72; // degrees, at max speed

export const CAMERA_SHAKE_STUMBLE = { amplitudeM: 0.05, durationMs: 150 };
export const CAMERA_SHAKE_CATCH = { amplitudeM: 0.15, durationMs: 500 };
