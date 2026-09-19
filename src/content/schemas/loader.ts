import { z } from 'zod';
import { audioSchema, type AudioAssetDefinition } from './audio.schema';
import { hazardSchema, type HazardDefinition } from './hazard.schema';
import { pickupSchema, type PickupDefinition } from './pickup.schema';
import { stageSchema, type StageDefinition } from './stage.schema';

export interface RawContent {
  stages: unknown;
  obstacles: unknown;
  pickups: unknown;
  audio: unknown;
}

export interface LoadedContent {
  stages: StageDefinition[];
  obstacles: HazardDefinition[];
  pickups: PickupDefinition[];
  audio: AudioAssetDefinition[];
}

function parseOrThrow<T>(fileName: string, schema: z.ZodType<T>, raw: unknown): T[] {
  const result = z.array(schema).safeParse(raw);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Invalid content in ${fileName}:\n${details}`);
  }
  return result.data;
}

export function loadContent(raw: RawContent, opts: { isProduction: boolean }): LoadedContent {
  const audio = parseOrThrow('audio.json', audioSchema, raw.audio);

  if (opts.isProduction) {
    const placeholders = audio.filter((asset) => asset.licence === 'placeholder');
    if (placeholders.length > 0) {
      const ids = placeholders.map((asset) => asset.id).join(', ');
      throw new Error(`audio.json has placeholder entries not allowed in production: ${ids}`);
    }
  }

  return {
    stages: parseOrThrow('stages.json', stageSchema, raw.stages),
    obstacles: parseOrThrow('obstacles.json', hazardSchema, raw.obstacles),
    pickups: parseOrThrow('pickups.json', pickupSchema, raw.pickups),
    audio,
  };
}
