import { z } from 'zod';

export const stageSchema = z.object({
  id: z.string(),
  index: z.number(),
  label: z.string(),
  pursuer: z.string().nullable(),
  lengthM: z.number().positive(),
  hazardWeights: z.record(z.string(), z.number()),
  pickupWeights: z.record(z.string(), z.number()),
  chaserStartingGapM: z.number(),
  visualEffect: z
    .object({
      name: z.literal('lag'),
      intensityKey: z.string(),
    })
    .nullable(),
  audio: z.object({
    ambience: z.array(z.string()),
    music: z.string().nullable(),
    stinger: z.string().nullable(),
  }),
  countdown: z
    .object({
      seconds: z.number().positive(),
      failEffect: z.literal('caught'),
    })
    .nullable(),
});

export type StageDefinition = z.infer<typeof stageSchema>;
