import { describe, expect, it } from 'vitest';
import { pickupSchema } from '../../../src/content/schemas/pickup.schema';

describe('pickupSchema', () => {
  it.each(['chai', 'samosa', 'maggi', 'proxy'] as const)('accepts a valid pickup of type %s', (type) => {
    const pickup = { id: type, type, effect: { kind: 'speedBurst', magnitude: 1.5 } };
    expect(pickupSchema.safeParse(pickup).success).toBe(true);
  });

  it('accepts an effect with no durationMs (durationMs is optional)', () => {
    const pickup = { id: 'proxy', type: 'proxy', effect: { kind: 'shield', magnitude: 1 } };
    expect(pickupSchema.safeParse(pickup).success).toBe(true);
  });

  it('accepts an effect with a durationMs', () => {
    const pickup = { id: 'maggi', type: 'maggi', effect: { kind: 'slowMo', magnitude: 0.5, durationMs: 3000 } };
    expect(pickupSchema.safeParse(pickup).success).toBe(true);
  });

  it('rejects an unknown type', () => {
    const pickup = { id: 'x', type: 'coffee', effect: { kind: 'speedBurst', magnitude: 1 } };
    expect(pickupSchema.safeParse(pickup).success).toBe(false);
  });

  it('rejects an unknown effect kind', () => {
    const pickup = { id: 'chai', type: 'chai', effect: { kind: 'teleport', magnitude: 1 } };
    expect(pickupSchema.safeParse(pickup).success).toBe(false);
  });
});
