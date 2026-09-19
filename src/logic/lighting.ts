import { HOUR_BAND_BOUNDARIES, LIGHTING_PRESETS, type LightingPreset } from '../config/lighting';

export type HourBand = keyof typeof LIGHTING_PRESETS;

export function hourBand(istHour: number): HourBand {
  const { dawnStart, morningStart, noonStart, afternoonStart, duskStart, nightStart } = HOUR_BAND_BOUNDARIES;

  if (istHour >= nightStart || istHour < dawnStart) return 'night';
  if (istHour < morningStart) return 'dawn';
  if (istHour < noonStart) return 'morning';
  if (istHour < afternoonStart) return 'noon';
  if (istHour < duskStart) return 'afternoon';
  return 'dusk';
}

export function lightingPresetForHour(istHour: number): LightingPreset {
  return LIGHTING_PRESETS[hourBand(istHour)];
}
