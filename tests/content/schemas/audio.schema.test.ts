import { describe, expect, it } from 'vitest';
import { audioSchema } from '../../../src/content/schemas/audio.schema';

describe('audioSchema', () => {
  it.each(['ambience', 'music', 'stinger', 'telegraph'] as const)('accepts a valid entry of kind %s', (kind) => {
    const asset = { id: kind, kind, src: `/audio/${kind}.mp3`, licence: 'CC0', source: 'kenney.nl' };
    expect(audioSchema.safeParse(asset).success).toBe(true);
  });

  it('accepts licence: "placeholder" (the production gate is loader.ts\'s job, not this schema\'s)', () => {
    const asset = { id: 'x', kind: 'stinger', src: '/audio/x.mp3', licence: 'placeholder', source: 'generated' };
    expect(audioSchema.safeParse(asset).success).toBe(true);
  });

  it('rejects an entry missing licence', () => {
    const { licence: _omit, ...assetWithoutLicence } = {
      id: 'x',
      kind: 'ambience' as const,
      src: '/audio/x.mp3',
      licence: 'CC0',
      source: 'kenney.nl',
    };
    expect(audioSchema.safeParse(assetWithoutLicence).success).toBe(false);
  });

  it('rejects an entry missing source', () => {
    const { source: _omit, ...assetWithoutSource } = {
      id: 'x',
      kind: 'ambience' as const,
      src: '/audio/x.mp3',
      licence: 'CC0',
      source: 'kenney.nl',
    };
    expect(audioSchema.safeParse(assetWithoutSource).success).toBe(false);
  });
});
