import { HEAT_THRESHOLD_C, WEATHER_CODE_OVERLAYS, type WeatherOverlay } from '../config/weather';

export function overlayForWeatherCode(code: number): WeatherOverlay {
  return WEATHER_CODE_OVERLAYS[code] ?? 'clear';
}

// Combines the WMO code with temperature: rain/storm/fog take visual
// priority (heat haze doesn't make sense mid-downpour), otherwise extreme
// heat overrides a plain clear/cloudy reading.
export function resolveOverlay(code: number, temperatureC: number): WeatherOverlay {
  const codeOverlay = overlayForWeatherCode(code);
  if (codeOverlay === 'rain' || codeOverlay === 'storm' || codeOverlay === 'fog') return codeOverlay;
  if (temperatureC >= HEAT_THRESHOLD_C) return 'heat';
  return codeOverlay;
}

export function isCacheStale(fetchedAtMs: number, nowMs: number, maxAgeMs: number): boolean {
  return nowMs - fetchedAtMs >= maxAgeMs;
}
