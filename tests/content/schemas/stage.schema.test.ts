import { describe, expect, it } from 'vitest';
import { stageSchema } from '../../../src/content/schemas/stage.schema';

const validStage = {
  id: 'gate',
  index: 0,
  label: '06:00 The Gate',
  pursuer: 'Gate Security',
  lengthM: 300,
  hazardWeights: { 'barrier-arm': 3, 'delivery-bike': 2 },
  pickupWeights: { chai: 1 },
  chaserStartingGapM: 20,
  visualEffect: null,
  audio: { ambience: ['birds-loud'], music: null, stinger: 'security-laugh' },
  countdown: null,
};

describe('stageSchema', () => {
  it('accepts a valid stage with no countdown or visualEffect', () => {
    expect(stageSchema.safeParse(validStage).success).toBe(true);
  });

  it('accepts a valid stage with a countdown and a visualEffect', () => {
    const stage = {
      ...validStage,
      visualEffect: { name: 'lag', intensityKey: 'stage11Lag' },
      countdown: { seconds: 10, failEffect: 'caught' },
    };
    expect(stageSchema.safeParse(stage).success).toBe(true);
  });

  it('rejects a stage missing a required field', () => {
    const { lengthM: _omit, ...stageWithoutLength } = validStage;
    const result = stageSchema.safeParse(stageWithoutLength);
    expect(result.success).toBe(false);
  });

  it('rejects a stage with the wrong type for a field', () => {
    const result = stageSchema.safeParse({ ...validStage, lengthM: 'three hundred' });
    expect(result.success).toBe(false);
  });
});
