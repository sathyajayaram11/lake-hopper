import { describe, expect, it } from 'vitest';
import { pickWeighted } from '../../src/logic/spawn-weighting';

describe('pickWeighted', () => {
  it('lands exactly on the a/b boundary correctly (weights 3:1, total 4)', () => {
    const weights = { a: 3, b: 1 };
    expect(pickWeighted(weights, () => 0)).toBe('a');
    expect(pickWeighted(weights, () => 0.75 - 0.001 / 4)).toBe('a'); // just under the boundary
    expect(pickWeighted(weights, () => 0.75)).toBe('a'); // exactly at the boundary -> inclusive on the first entry
    expect(pickWeighted(weights, () => 0.99)).toBe('b');
  });

  it('never picks a zero-weight entry', () => {
    const weights = { a: 1, b: 0, c: 1 };
    for (let i = 0; i <= 10; i++) {
      const r = i / 10;
      expect(pickWeighted(weights, () => r)).not.toBe('b');
    }
  });

  it('returns null for an empty weight map', () => {
    expect(pickWeighted({})).toBeNull();
  });

  it('returns null when every weight is zero', () => {
    expect(pickWeighted({ a: 0, b: 0 })).toBeNull();
  });

  it('works with the real default random source', () => {
    const result = pickWeighted({ a: 1, b: 1 });
    expect(['a', 'b']).toContain(result);
  });
});
