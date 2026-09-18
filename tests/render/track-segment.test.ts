import { describe, expect, it } from 'vitest';
import { TrackSegmentMesh } from '../../src/render/track-segment';

describe('TrackSegmentMesh', () => {
  it('starts inactive and invisible', () => {
    const segment = new TrackSegmentMesh();

    expect(segment.active).toBe(false);
    expect(segment.mesh.visible).toBe(false);
  });

  it('reset positions it, makes it visible, and marks it active', () => {
    const segment = new TrackSegmentMesh();

    segment.reset({ zPositionM: 120 });

    expect(segment.active).toBe(true);
    expect(segment.mesh.visible).toBe(true);
    expect(segment.mesh.position.z).toBe(120);
  });

  it('deactivate hides it and marks it inactive', () => {
    const segment = new TrackSegmentMesh();
    segment.reset({ zPositionM: 40 });

    segment.deactivate();

    expect(segment.active).toBe(false);
    expect(segment.mesh.visible).toBe(false);
  });
});
