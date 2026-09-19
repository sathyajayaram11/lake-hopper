import { describe, expect, it } from 'vitest';
import { HEAT_THRESHOLD_C } from '../../src/config/weather';
import { isCacheStale, overlayForWeatherCode, resolveOverlay } from '../../src/logic/weather';

describe('overlayForWeatherCode', () => {
  it('maps known WMO codes correctly', () => {
    expect(overlayForWeatherCode(0)).toBe('clear');
    expect(overlayForWeatherCode(3)).toBe('cloudy');
    expect(overlayForWeatherCode(61)).toBe('rain');
    expect(overlayForWeatherCode(95)).toBe('storm');
    expect(overlayForWeatherCode(45)).toBe('fog');
  });

  it('falls back to clear for an unrecognized code', () => {
    expect(overlayForWeatherCode(9999)).toBe('clear');
  });
});

describe('resolveOverlay', () => {
  it('returns heat when temperature is at or above the threshold and the code is plain clear/cloudy', () => {
    expect(resolveOverlay(0, HEAT_THRESHOLD_C)).toBe('heat');
    expect(resolveOverlay(2, HEAT_THRESHOLD_C + 2)).toBe('heat');
  });

  it('does not apply heat below the threshold', () => {
    expect(resolveOverlay(0, HEAT_THRESHOLD_C - 0.1)).toBe('clear');
  });

  it('lets rain/storm/fog take priority over heat even at extreme temperature', () => {
    expect(resolveOverlay(61, HEAT_THRESHOLD_C + 5)).toBe('rain');
    expect(resolveOverlay(95, HEAT_THRESHOLD_C + 5)).toBe('storm');
    expect(resolveOverlay(45, HEAT_THRESHOLD_C + 5)).toBe('fog');
  });
});

describe('isCacheStale', () => {
  it('is false just under maxAgeMs and true at/above it', () => {
    expect(isCacheStale(0, 999, 1000)).toBe(false);
    expect(isCacheStale(0, 1000, 1000)).toBe(true);
  });
});
