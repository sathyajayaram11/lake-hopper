import { SWIPE_THRESHOLD_PX } from '../config/lanes';

export interface InputIntent {
  laneDirection: -1 | 0 | 1;
  jumpRequested: boolean;
  slideRequested: boolean;
}

export interface InputSystem {
  attach(): void;
  detach(): void;
  consumeIntent(): InputIntent;
}

export function createInputSystem(target: EventTarget = window): InputSystem {
  let pendingLaneDirection: -1 | 0 | 1 = 0;
  let pendingJumpRequested = false;
  let pendingSlideRequested = false;
  let pointerStart: { x: number; y: number } | null = null;

  function onKeyDown(event: Event): void {
    const key = (event as KeyboardEvent).key;
    if (key === 'ArrowLeft') pendingLaneDirection = -1;
    else if (key === 'ArrowRight') pendingLaneDirection = 1;
    else if (key === 'ArrowUp') pendingJumpRequested = true;
    else if (key === 'ArrowDown') pendingSlideRequested = true;
  }

  function onPointerDown(event: Event): void {
    const { clientX, clientY } = event as PointerEvent;
    pointerStart = { x: clientX, y: clientY };
  }

  function onPointerUp(event: Event): void {
    if (pointerStart === null) return;
    const deltaX = (event as PointerEvent).clientX - pointerStart.x;
    const deltaY = (event as PointerEvent).clientY - pointerStart.y;
    pointerStart = null;

    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
      if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX) pendingLaneDirection = deltaX < 0 ? -1 : 1;
    } else if (Math.abs(deltaY) >= SWIPE_THRESHOLD_PX) {
      if (deltaY < 0) pendingJumpRequested = true;
      else pendingSlideRequested = true;
    }
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
      const intent: InputIntent = {
        laneDirection: pendingLaneDirection,
        jumpRequested: pendingJumpRequested,
        slideRequested: pendingSlideRequested,
      };
      pendingLaneDirection = 0;
      pendingJumpRequested = false;
      pendingSlideRequested = false;
      return intent;
    },
  };
}
