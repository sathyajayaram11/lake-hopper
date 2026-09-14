import { now } from './clock';

export const FIXED_DT_MS = 1000 / 60;
const DEFAULT_MAX_FRAME_TIME_MS = 250; // caps catch-up work after a backgrounded tab

export function advance(
  accumulatorMs: number,
  frameTimeMs: number,
  fixedDtMs: number = FIXED_DT_MS,
): { steps: number; remainderMs: number } {
  const total = accumulatorMs + frameTimeMs;
  const steps = Math.floor(total / fixedDtMs);
  const remainderMs = total - steps * fixedDtMs;
  return { steps, remainderMs };
}

export interface Loop {
  start(): void;
  stop(): void;
}

export function createLoop(opts: {
  fixedUpdate: (dtMs: number) => void;
  render: (alpha: number) => void;
  maxFrameTimeMs?: number;
}): Loop {
  const maxFrameTimeMs = opts.maxFrameTimeMs ?? DEFAULT_MAX_FRAME_TIME_MS;
  let accumulatorMs = 0;
  let lastTimeMs = 0;
  let rafHandle: number | null = null;

  function tick(): void {
    const currentTimeMs = now();
    const frameTimeMs = Math.min(currentTimeMs - lastTimeMs, maxFrameTimeMs);
    lastTimeMs = currentTimeMs;

    const { steps, remainderMs } = advance(accumulatorMs, frameTimeMs);
    for (let i = 0; i < steps; i++) opts.fixedUpdate(FIXED_DT_MS);
    accumulatorMs = remainderMs;

    opts.render(accumulatorMs / FIXED_DT_MS);
    rafHandle = requestAnimationFrame(tick);
  }

  return {
    start() {
      lastTimeMs = now();
      accumulatorMs = 0;
      rafHandle = requestAnimationFrame(tick);
    },
    stop() {
      if (rafHandle !== null) cancelAnimationFrame(rafHandle);
      rafHandle = null;
    },
  };
}
