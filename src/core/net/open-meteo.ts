import { WEATHER_CACHE_MS, type WeatherOverlay } from '../../config/weather';
import { isCacheStale, resolveOverlay } from '../../logic/weather';
import { now } from '../loop/clock';

const CHENNAI_LAT = 13.08;
const CHENNAI_LON = 80.27;
const FORECAST_URL = `https://api.open-meteo.com/v1/forecast?latitude=${CHENNAI_LAT}&longitude=${CHENNAI_LON}&current=weather_code,temperature_2m`;

let cache: { overlay: WeatherOverlay; fetchedAtMs: number } | null = null;

export async function getWeatherOverlay(fetchImpl: typeof fetch = fetch): Promise<WeatherOverlay> {
  if (cache && !isCacheStale(cache.fetchedAtMs, now(), WEATHER_CACHE_MS)) {
    return cache.overlay;
  }

  try {
    const response = await fetchImpl(FORECAST_URL);
    const data = await response.json();
    const overlay = resolveOverlay(data.current.weather_code, data.current.temperature_2m);
    cache = { overlay, fetchedAtMs: now() };
    return overlay;
  } catch {
    return 'clear';
  }
}
