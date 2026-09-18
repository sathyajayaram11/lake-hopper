import { AmbientLight, DirectionalLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { MAX_PIXEL_RATIO } from '../config/render';

export interface AppScene {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  resize(): void;
  render(): void;
}

export function createScene(canvas: HTMLCanvasElement): AppScene {
  const scene = new Scene();
  const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

  // Phase 0 placeholder lighting so meshes aren't invisible-black. Replaced by
  // LightingSystem's IST-driven rig in Phase 1.
  scene.add(new AmbientLight(0xffffff, 0.6));
  const sun = new DirectionalLight(0xffffff, 0.8);
  sun.position.set(2, 5, 3);
  scene.add(sun);

  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));

  function resize(): void {
    const { innerWidth, innerHeight } = window;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }
  resize();

  return {
    scene,
    camera,
    renderer,
    resize,
    render() {
      renderer.render(scene, camera);
    },
  };
}
