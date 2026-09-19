import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function fakeFetch(payload: unknown): typeof fetch {
  return vi.fn(async () => ({ json: async () => payload }) as Response);
}

function failingFetch(): typeof fetch {
  return vi.fn(async () => {
    throw new Error('network down');
  });
}

function badJsonFetch(): typeof fetch {
  return vi.fn(
    async () =>
      ({
        json: async () => {
          throw new Error('not json');
        },
      }) as unknown as Response,
  );
}

describe('getWeatherOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function freshGetWeatherOverlay() {
    vi.resetModules();
    const mod = await import('../../../src/core/net/open-meteo');
    return mod.getWeatherOverlay;
  }

  it('resolves and caches a successful fetch', async () => {
    const getWeatherOverlay = await freshGetWeatherOverlay();
    const fetchImpl = fakeFetch({ current: { weather_code: 0, temperature_2m: 25 } });

    const overlay = await getWeatherOverlay(fetchImpl);

    expect(overlay).toBe('clear');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('does not re-fetch within the 30-minute cache window', async () => {
    const getWeatherOverlay = await freshGetWeatherOverlay();
    const fetchImpl = fakeFetch({ current: { weather_code: 0, temperature_2m: 25 } });

    await getWeatherOverlay(fetchImpl);
    vi.setSystemTime(29 * 60 * 1000);
    await getWeatherOverlay(fetchImpl);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('fetches again after the cache window elapses', async () => {
    const getWeatherOverlay = await freshGetWeatherOverlay();
    const fetchImpl = fakeFetch({ current: { weather_code: 0, temperature_2m: 25 } });

    await getWeatherOverlay(fetchImpl);
    vi.setSystemTime(30 * 60 * 1000);
    await getWeatherOverlay(fetchImpl);

    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('fails silently to clear on a rejected fetch', async () => {
    const getWeatherOverlay = await freshGetWeatherOverlay();
    const overlay = await getWeatherOverlay(failingFetch());
    expect(overlay).toBe('clear');
  });

  it('fails silently to clear when the response cannot be parsed as JSON', async () => {
    const getWeatherOverlay = await freshGetWeatherOverlay();
    const overlay = await getWeatherOverlay(badJsonFetch());
    expect(overlay).toBe('clear');
  });
});
