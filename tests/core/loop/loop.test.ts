import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { advance, createLoop, FIXED_DT_MS } from '../../../src/core/loop/loop';

describe('FIXED_DT_MS', () => {
  it('is one 60th of a second', () => {
    expect(FIXED_DT_MS).toBeCloseTo(1000 / 60);
  });
});

describe('advance', () => {
  it('fits whole fixed steps into accumulated + frame time and keeps the remainder', () => {
    expect(advance(0, 35, 10)).toEqual({ steps: 3, remainderMs: 5 });
  });

  it('accumulates leftover time across calls until a step fits', () => {
    expect(advance(5, 4, 10)).toEqual({ steps: 0, remainderMs: 9 });
  });

  it('returns zero steps and zero remainder for zero input', () => {
    expect(advance(0, 0, 10)).toEqual({ steps: 0, remainderMs: 0 });
  });
});

describe('createLoop', () => {
  let rafCallback: FrameRequestCallback | null = null;
  let rafHandleCounter = 0;

  beforeEach(() => {
    rafCallback = null;
    rafHandleCounter = 0;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallback = cb;
      return ++rafHandleCounter;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {
      rafCallback = null;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not call fixedUpdate/render until a frame is driven, then calls both', () => {
    const fixedUpdate = vi.fn();
    const render = vi.fn();
    const loop = createLoop({ fixedUpdate, render });

    loop.start();
    expect(fixedUpdate).not.toHaveBeenCalled();
    expect(render).not.toHaveBeenCalled();

    rafCallback?.(performance.now());
    expect(render).toHaveBeenCalledTimes(1);
  });

  it('stops scheduling further frames after stop()', () => {
    const loop = createLoop({ fixedUpdate: vi.fn(), render: vi.fn() });
    loop.start();
    loop.stop();
    expect(rafCallback).toBeNull();
  });
});
