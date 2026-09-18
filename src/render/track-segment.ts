import { Mesh } from 'three';
import type { Poolable } from '../logic/pools/pool';
import { trackSegmentGeometry } from './assets/geometries';
import { trackSegmentMaterial } from './assets/materials';

export interface TrackSegmentConfig {
  zPositionM: number;
}

export class TrackSegmentMesh implements Poolable {
  readonly mesh: Mesh;
  active = false;

  constructor() {
    this.mesh = new Mesh(trackSegmentGeometry, trackSegmentMaterial);
    this.mesh.visible = false;
  }

  reset(cfg: TrackSegmentConfig): void {
    this.mesh.position.z = cfg.zPositionM;
    this.mesh.visible = true;
    this.active = true;
  }

  deactivate(): void {
    this.mesh.visible = false;
    this.active = false;
  }
}
