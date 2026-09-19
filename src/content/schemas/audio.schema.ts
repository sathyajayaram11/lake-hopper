import { z } from 'zod';

export const audioSchema = z.object({
  id: z.string(),
  kind: z.enum(['ambience', 'music', 'stinger', 'telegraph']),
  src: z.string(),
  licence: z.string(),
  source: z.string(),
});

export type AudioAssetDefinition = z.infer<typeof audioSchema>;
