import { describe, expect, it } from 'vitest';
import { getIstHour, now } from '../../../src/core/loop/clock';

describe('now', () => {
  it('returns the current time in milliseconds, close to Date.now()', () => {
    const before = Date.now();
    const value = now();
    const after = Date.now();
    expect(value).toBeGreaterThanOrEqual(before);
    expect(value).toBeLessThanOrEqual(after);
  });
});

describe('getIstHour', () => {
  it('converts UTC midnight to 05:30 IST -> hour 5', () => {
    expect(getIstHour(Date.parse('2026-01-01T00:00:00Z'))).toBe(5);
  });

  it('converts 12:00 UTC to 17:30 IST -> hour 17', () => {
    expect(getIstHour(Date.parse('2026-01-01T12:00:00Z'))).toBe(17);
  });

  it('rolls over into the next day across the :30 offset', () => {
    expect(getIstHour(Date.parse('2026-01-01T18:30:00Z'))).toBe(0);
    expect(getIstHour(Date.parse('2026-01-01T18:29:00Z'))).toBe(23);
  });
});
