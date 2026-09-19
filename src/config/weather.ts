export type WeatherOverlay = 'clear' | 'cloudy' | 'rain' | 'fog' | 'storm' | 'heat';

export const WEATHER_CACHE_MS = 30 * 60 * 1000; // 30 minutes

// WMO weather codes carry no temperature information, so extreme heat -
// genuinely common in Chennai - is a second signal, not another code entry.
// Only applies when the code itself isn't already rain/storm/fog (those take
// visual priority over a heat haze).
export const HEAT_THRESHOLD_C = 38;

// WMO weather codes -> overlay preset. Unlisted codes fall back to 'clear'.
export const WEATHER_CODE_OVERLAYS: Record<number, WeatherOverlay> = {
  0: 'clear',
  1: 'clear',
  2: 'cloudy',
  3: 'cloudy',
  45: 'fog',
  48: 'fog',
  51: 'rain',
  53: 'rain',
  55: 'rain',
  56: 'rain',
  57: 'rain',
  61: 'rain',
  63: 'rain',
  65: 'rain',
  66: 'rain',
  67: 'rain',
  80: 'rain',
  81: 'rain',
  82: 'rain',
  95: 'storm',
  96: 'storm',
  99: 'storm',
};
