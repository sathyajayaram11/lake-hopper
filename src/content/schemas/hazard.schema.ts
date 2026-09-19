import { z } from 'zod';

export const hazardSchema = z.object({
  id: z.string(),
  lane: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal('any')]),
  heightBand: z.enum(['low', 'mid', 'high']),
  widthM: z.number().positive(),
  effect: z.enum(['stumble', 'slow']),
  telegraph: z
    .object({
      audio: z.string(),
      leadTimeMs: z.number().positive(),
    })
    .optional(),
});

export type HazardDefinition = z.infer<typeof hazardSchema>;
