import { describe, expect, it } from 'vitest';
import { hazardSchema } from '../../../src/content/schemas/hazard.schema';

const validHazard = {
  id: 'barrier-arm',
  lane: 1 as const,
  heightBand: 'mid' as const,
  widthM: 1.5,
  effect: 'stumble' as const,
};

describe('hazardSchema', () => {
  it('accepts a valid hazard without telegraph', () => {
    expect(hazardSchema.safeParse(validHazard).success).toBe(true);
  });

  it('accepts a valid hazard with telegraph', () => {
    const hazard = { ...validHazard, telegraph: { audio: 'snake-hiss', leadTimeMs: 800 } };
    expect(hazardSchema.safeParse(hazard).success).toBe(true);
  });

  it.each([0, 1, 2, 'any'] as const)('accepts lane %s', (lane) => {
    expect(hazardSchema.safeParse({ ...validHazard, lane }).success).toBe(true);
  });

  it('rejects an out-of-range lane value', () => {
    expect(hazardSchema.safeParse({ ...validHazard, lane: 3 }).success).toBe(false);
  });

  it('rejects a hazard missing effect', () => {
    const { effect: _omit, ...hazardWithoutEffect } = validHazard;
    expect(hazardSchema.safeParse(hazardWithoutEffect).success).toBe(false);
  });

  it('rejects an effect value outside stumble/slow', () => {
    expect(hazardSchema.safeParse({ ...validHazard, effect: 'explode' }).success).toBe(false);
  });
});
