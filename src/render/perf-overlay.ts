export interface TextTarget {
  textContent: string;
}

export function createPerfOverlay(target: TextTarget, updateIntervalMs = 250): { update(nowMs: number, drawCalls: number): void } {
  let frameCount = 0;
  let windowStartMs = 0;
  let started = false;

  return {
    update(nowMs, drawCalls) {
      if (!started) {
        windowStartMs = nowMs;
        started = true;
      }
      frameCount++;

      const elapsedMs = nowMs - windowStartMs;
      if (elapsedMs >= updateIntervalMs) {
        const fps = Math.round((frameCount * 1000) / elapsedMs);
        target.textContent = `FPS: ${fps} | Draw calls: ${drawCalls}`;
        frameCount = 0;
        windowStartMs = nowMs;
      }
    },
  };
}
