import type { HourBand } from '../logic/lighting';

export const VOICE_POOL_SIZE = 8; // concurrent one-shot voice slots (stingers, telegraphs)
export const MUSIC_DUCK_DB = -8; // music volume reduction under SFX/ambience
export const STAGE_CROSSFADE_MS = 800; // crossfade duration at stage boundaries

export const DEFAULT_AMBIENCE_VOLUME = 0.5;
export const DEFAULT_MUSIC_VOLUME = 0.4;
export const DEFAULT_STINGER_VOLUME = 0.8;

export const BIRD_VOLUME_BY_HOUR_BAND: Record<HourBand, number> = {
  dawn: 0.9,
  morning: 0.5,
  noon: 0.2,
  afternoon: 0.3,
  dusk: 0.4,
  night: 0.1,
};
