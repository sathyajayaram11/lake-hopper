import { describe, expect, it } from 'vitest';
import { createPerfOverlay, type TextTarget } from '../../src/render/perf-overlay';

describe('createPerfOverlay', () => {
  it('does not update the target until updateIntervalMs of frame time has accumulated', () => {
    const target: TextTarget = { textContent: '' };
    const overlay = createPerfOverlay(target, 100);

    overlay.update(0, 10);
    overlay.update(20, 10);
    overlay.update(40, 10);

    expect(target.textContent).toBe('');
  });

  it('reports an exact, window-averaged fps and the draw-call count once the interval elapses', () => {
    const target: TextTarget = { textContent: '' };
    const overlay = createPerfOverlay(target, 100);

    // 6 frames over exactly 100ms -> 60fps.
    overlay.update(0, 42);
    overlay.update(20, 42);
    overlay.update(40, 42);
    overlay.update(60, 42);
    overlay.update(80, 42);
    overlay.update(100, 42);

    expect(target.textContent).toBe('FPS: 60 | Draw calls: 42');
  });

  it('starts a fresh counting window after each update, rather than accumulating forever', () => {
    const target: TextTarget = { textContent: '' };
    const overlay = createPerfOverlay(target, 100);

    for (let i = 0; i <= 100; i += 20) overlay.update(i, 1); // settles at 60fps
    // A much slower second window: 2 frames over 100ms -> 20fps.
    overlay.update(120, 2);
    overlay.update(200, 2);

    expect(target.textContent).toBe('FPS: 20 | Draw calls: 2');
  });
});
