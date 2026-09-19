import { describe, expect, it } from 'vitest';
import { loadContent } from '../../../src/content/schemas/loader';

const validStage = {
  id: 'gate',
  index: 0,
  label: '06:00 The Gate',
  pursuer: 'Gate Security',
  lengthM: 300,
  hazardWeights: {},
  pickupWeights: {},
  chaserStartingGapM: 20,
  visualEffect: null,
  audio: { ambience: [], music: null, stinger: null },
  countdown: null,
};

const validHazard = { id: 'barrier-arm', lane: 1, heightBand: 'mid', widthM: 1.5, effect: 'stumble' };
const validPickup = { id: 'chai', type: 'chai', effect: { kind: 'speedBurst', magnitude: 1.5 } };
const validAudio = { id: 'stinger-1', kind: 'stinger', src: '/audio/x.mp3', licence: 'CC0', source: 'kenney.nl' };

function validRaw() {
  return { stages: [validStage], obstacles: [validHazard], pickups: [validPickup], audio: [validAudio] };
}

describe('loadContent', () => {
  it('loads and returns correctly typed arrays for valid content', () => {
    const content = loadContent(validRaw(), { isProduction: false });

    expect(content.stages).toHaveLength(1);
    expect(content.obstacles).toHaveLength(1);
    expect(content.pickups).toHaveLength(1);
    expect(content.audio).toHaveLength(1);
  });

  it('throws naming stages.json when a stage is invalid', () => {
    const raw = { ...validRaw(), stages: [{ ...validStage, lengthM: 'not a number' }] };
    expect(() => loadContent(raw, { isProduction: false })).toThrowError(/stages\.json/);
  });

  it('throws naming obstacles.json when a hazard is invalid', () => {
    const raw = { ...validRaw(), obstacles: [{ ...validHazard, effect: 'explode' }] };
    expect(() => loadContent(raw, { isProduction: false })).toThrowError(/obstacles\.json/);
  });

  it('loads a placeholder audio entry fine in development', () => {
    const raw = { ...validRaw(), audio: [{ ...validAudio, licence: 'placeholder' }] };
    expect(() => loadContent(raw, { isProduction: false })).not.toThrow();
  });

  it('throws a hard error on a placeholder audio entry in production, naming the id', () => {
    const raw = { ...validRaw(), audio: [{ ...validAudio, id: 'temp-stinger', licence: 'placeholder' }] };
    expect(() => loadContent(raw, { isProduction: true })).toThrowError(/temp-stinger/);
  });

  it('does not false-positive on non-placeholder audio in production', () => {
    expect(() => loadContent(validRaw(), { isProduction: true })).not.toThrow();
  });
});
