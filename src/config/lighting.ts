export interface LightingPreset {
  skyColor: number;
  ambientColor: number;
  ambientIntensity: number;
  directionalColor: number;
  directionalIntensity: number;
}

export const HOUR_BAND_BOUNDARIES = {
  dawnStart: 6,
  morningStart: 8,
  noonStart: 12,
  afternoonStart: 15,
  duskStart: 18,
  nightStart: 20,
};

export const LIGHTING_PRESETS: Record<'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night', LightingPreset> = {
  dawn: { skyColor: 0xffb37a, ambientColor: 0xffddaa, ambientIntensity: 0.5, directionalColor: 0xffaa66, directionalIntensity: 0.6 },
  morning: { skyColor: 0x9ec8ff, ambientColor: 0xffffff, ambientIntensity: 0.7, directionalColor: 0xffffff, directionalIntensity: 0.9 },
  noon: { skyColor: 0x6fb1ff, ambientColor: 0xffffff, ambientIntensity: 0.8, directionalColor: 0xffffff, directionalIntensity: 1.1 },
  afternoon: { skyColor: 0x89b8e6, ambientColor: 0xffeecc, ambientIntensity: 0.65, directionalColor: 0xffdca8, directionalIntensity: 0.85 },
  dusk: { skyColor: 0xff8c5a, ambientColor: 0xffb37a, ambientIntensity: 0.45, directionalColor: 0xff7043, directionalIntensity: 0.55 },
  night: { skyColor: 0x0a1128, ambientColor: 0x3a4a6b, ambientIntensity: 0.25, directionalColor: 0x8ea6ff, directionalIntensity: 0.2 },
};
