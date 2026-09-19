import { createRoot } from 'react-dom/client';
import { now } from './core/loop/clock';
import { createLoop } from './core/loop/loop';
import { eventBus } from './core/events/bus';
import { store } from './core/state/store';
import { initSupabaseAuth } from './core/net/supabase';
import { initPostHog } from './core/net/posthog';
import { createScene } from './render/scene';
import { createPerfOverlay } from './render/perf-overlay';
import { createPlayerMesh } from './render/player-mesh';
import { createInputSystem } from './systems/input';
import { createPlayerSystem } from './systems/player';
import { createCameraSystem } from './systems/camera';
import { createSpawnerSystem } from './systems/spawner';
import { initRunSystem } from './systems/run';
import { initAnalyticsSystem } from './systems/analytics';
import { App } from './ui/App';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const appScene = createScene(canvas);

const input = createInputSystem();
input.attach();

const player = createPlayerSystem({ input, store, bus: eventBus });
const camera = createCameraSystem({ camera: appScene.camera, store });
const spawner = createSpawnerSystem({ store });
const playerMesh = createPlayerMesh({ store });

spawner.init?.();
for (const mesh of spawner.segmentMeshes()) appScene.scene.add(mesh);
appScene.scene.add(playerMesh.mesh);

initPostHog();
initSupabaseAuth({ store });
initRunSystem({ bus: eventBus, store });
initAnalyticsSystem({ bus: eventBus });

const perfOverlayElement = document.createElement('div');
perfOverlayElement.style.cssText =
  'position:fixed;top:8px;left:8px;z-index:2;color:#fff;background:rgba(0,0,0,0.5);font:12px monospace;padding:4px 8px;pointer-events:none;';
document.body.appendChild(perfOverlayElement);
const perfOverlay = createPerfOverlay(perfOverlayElement);

window.addEventListener('resize', () => appScene.resize());

const loop = createLoop({
  fixedUpdate(dtMs) {
    player.fixedUpdate?.(dtMs);
    spawner.fixedUpdate?.(dtMs);
  },
  render(alpha) {
    camera.render?.(alpha);
    playerMesh.render?.(alpha);
    appScene.render();
    perfOverlay.update(now(), appScene.renderer.info.render.calls);
  },
});
loop.start();

eventBus.emit('app_opened', { timestamp: now() });

createRoot(document.getElementById('root')!).render(<App />);
