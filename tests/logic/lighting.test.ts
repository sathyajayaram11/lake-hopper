import { describe, expect, it } from 'vitest';
import { LIGHTING_PRESETS } from '../../src/config/lighting';
import { hourBand, lightingPresetForHour } from '../../src/logic/lighting';

describe('hourBand', () => {
  it('lands on the correct band at each boundary hour', () => {
    expect(hourBand(5)).toBe('night');
    expect(hourBand(6)).toBe('dawn');
    expect(hourBand(7)).toBe('dawn');
    expect(hourBand(8)).toBe('morning');
    expect(hourBand(11)).toBe('morning');
    expect(hourBand(12)).toBe('noon');
    expect(hourBand(14)).toBe('noon');
    expect(hourBand(15)).toBe('afternoon');
    expect(hourBand(17)).toBe('afternoon');
    expect(hourBand(18)).toBe('dusk');
    expect(hourBand(19)).toBe('dusk');
    expect(hourBand(20)).toBe('night');
  });

  it('wraps night correctly across midnight', () => {
    expect(hourBand(23)).toBe('night');
    expect(hourBand(0)).toBe('night');
  });
});

describe('lightingPresetForHour', () => {
  it('returns the preset matching the computed band', () => {
    expect(lightingPresetForHour(9)).toBe(LIGHTING_PRESETS.morning);
    expect(lightingPresetForHour(21)).toBe(LIGHTING_PRESETS.night);
  });
});
