import { describe, expect, it } from 'vitest';
import { resolveHazardHit, type HazardHitbox } from '../../src/logic/collision';

function hazard(overrides: Partial<HazardHitbox> = {}): HazardHitbox {
  return { lane: 1, heightBand: 'mid', effect: 'stumble', ...overrides };
}

describe('resolveHazardHit', () => {
  it('never hits when the hazard is in a different lane, regardless of pose', () => {
    expect(resolveHazardHit(0, 'Running', hazard({ lane: 1 }))).toBeNull();
    expect(resolveHazardHit(0, 'Jumping', hazard({ lane: 1, heightBand: 'low' }))).toBeNull();
  });

  it('a low hazard is cleared only while Jumping', () => {
    expect(resolveHazardHit(1, 'Jumping', hazard({ heightBand: 'low' }))).toBeNull();
    expect(resolveHazardHit(1, 'Running', hazard({ heightBand: 'low' }))).toBe('stumble');
    expect(resolveHazardHit(1, 'Sliding', hazard({ heightBand: 'low' }))).toBe('stumble');
  });

  it('a high hazard is cleared only while Sliding', () => {
    expect(resolveHazardHit(1, 'Sliding', hazard({ heightBand: 'high' }))).toBeNull();
    expect(resolveHazardHit(1, 'Running', hazard({ heightBand: 'high' }))).toBe('stumble');
    expect(resolveHazardHit(1, 'Jumping', hazard({ heightBand: 'high' }))).toBe('stumble');
  });

  it('a mid hazard is never cleared by any pose', () => {
    expect(resolveHazardHit(1, 'Running', hazard({ heightBand: 'mid' }))).toBe('stumble');
    expect(resolveHazardHit(1, 'Jumping', hazard({ heightBand: 'mid' }))).toBe('stumble');
    expect(resolveHazardHit(1, 'Sliding', hazard({ heightBand: 'mid' }))).toBe('stumble');
  });

  it('returns the hazard\'s actual effect unchanged on a hit', () => {
    expect(resolveHazardHit(1, 'Running', hazard({ heightBand: 'mid', effect: 'slow' }))).toBe('slow');
  });
});
