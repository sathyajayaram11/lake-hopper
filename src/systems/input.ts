import { SWIPE_THRESHOLD_PX } from '../config/lanes';

export interface InputIntent {
  laneDirection: -1 | 0 | 1;
}

export interface InputSystem {
  attach(): void;
  detach(): void;
  consumeIntent(): InputIntent;
}

export function createInputSystem(target: EventTarget = window): InputSystem {
  let pendingLaneDirection: -1 | 0 | 1 = 0;
  let pointerStartX: number | null = null;

  function onKeyDown(event: Event): void {
    const key = (event as KeyboardEvent).key;
    if (key === 'ArrowLeft') pendingLaneDirection = -1;
    else if (key === 'ArrowRight') pendingLaneDirection = 1;
  }

  function onPointerDown(event: Event): void {
    pointerStartX = (event as PointerEvent).clientX;
  }

  function onPointerUp(event: Event): void {
    if (pointerStartX === null) return;
    const deltaX = (event as PointerEvent).clientX - pointerStartX;
    pointerStartX = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    pendingLaneDirection = deltaX < 0 ? -1 : 1;
  }

  return {
    attach() {
      target.addEventListener('keydown', onKeyDown);
      target.addEventListener('pointerdown', onPointerDown);
      target.addEventListener('pointerup', onPointerUp);
    },
    detach() {
      target.removeEventListener('keydown', onKeyDown);
      target.removeEventListener('pointerdown', onPointerDown);
      target.removeEventListener('pointerup', onPointerUp);
    },
    consumeIntent() {
      const intent: InputIntent = { laneDirection: pendingLaneDirection };
      pendingLaneDirection = 0;
      return intent;
    },
  };
}
