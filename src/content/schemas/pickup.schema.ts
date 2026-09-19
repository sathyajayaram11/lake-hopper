import { z } from 'zod';

export const pickupSchema = z.object({
  id: z.string(),
  type: z.enum(['chai', 'samosa', 'maggi', 'proxy']),
  effect: z.object({
    kind: z.enum(['speedBurst', 'magnet', 'slowMo', 'shield']),
    magnitude: z.number(),
    durationMs: z.number().positive().optional(),
  }),
});

export type PickupDefinition = z.infer<typeof pickupSchema>;
