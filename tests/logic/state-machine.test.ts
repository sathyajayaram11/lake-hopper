import { describe, expect, it } from 'vitest';
import { STUMBLE_GRACE_MS } from '../../src/config/collision';
import { JUMP_DURATION_MS, SLIDE_DURATION_MS } from '../../src/config/pose';
import { transitionPose, type PoseInput, type PoseState } from '../../src/logic/state-machine';

const noInput: PoseInput = {
  jumpRequested: false,
  slideRequested: false,
  stumbleHit: false,
  chaserWithinCatchRadius: false,
};

function state(pose: PoseState['pose'], elapsedMs = 0, shieldCharges = 0): PoseState {
  return { pose, elapsedMs, shieldCharges };
}

describe('transitionPose', () => {
  it('starts jumping on jumpRequested from Running', () => {
    const next = transitionPose(state('Running'), { ...noInput, jumpRequested: true }, 16);
    expect(next.pose).toBe('Jumping');
    expect(next.elapsedMs).toBe(0);
  });

  it('returns to Running exactly at JUMP_DURATION_MS, not a tick early', () => {
    const almostDone = transitionPose(state('Jumping', JUMP_DURATION_MS - 10), noInput, 5);
    expect(almostDone.pose).toBe('Jumping');

    const done = transitionPose(state('Jumping', JUMP_DURATION_MS - 5), noInput, 5);
    expect(done.pose).toBe('Running');
    expect(done.elapsedMs).toBe(0);
  });

  it('returns to Running exactly at SLIDE_DURATION_MS', () => {
    const done = transitionPose(state('Sliding', SLIDE_DURATION_MS - 5), noInput, 5);
    expect(done.pose).toBe('Running');
  });

  it('ignores a jump/slide request while already jumping (not interruptible by another jump/slide)', () => {
    const next = transitionPose(state('Jumping', 100), { ...noInput, jumpRequested: true, slideRequested: true }, 16);
    expect(next.pose).toBe('Jumping');
    expect(next.elapsedMs).toBe(116);
  });

  it('ignores a jump/slide request while already sliding', () => {
    const next = transitionPose(state('Sliding', 100), { ...noInput, jumpRequested: true, slideRequested: true }, 16);
    expect(next.pose).toBe('Sliding');
  });

  it.each(['Running', 'Jumping', 'Sliding'] as const)('a stumbleHit interrupts %s into Stumbling', (pose) => {
    const next = transitionPose(state(pose, 200), { ...noInput, stumbleHit: true }, 16);
    expect(next.pose).toBe('Stumbling');
    expect(next.elapsedMs).toBe(0);
  });

  it('a second stumbleHit while Stumbling and the chaser is within catch radius ends in Caught', () => {
    const next = transitionPose(state('Stumbling', 50), { ...noInput, stumbleHit: true, chaserWithinCatchRadius: true }, 16);
    expect(next.pose).toBe('Caught');
  });

  it('a second stumbleHit while Stumbling but the chaser is not close re-enters Stumbling instead of Caught', () => {
    const next = transitionPose(state('Stumbling', 50), { ...noInput, stumbleHit: true, chaserWithinCatchRadius: false }, 16);
    expect(next.pose).toBe('Stumbling');
    expect(next.elapsedMs).toBe(0);
  });

  it('returns to Running after STUMBLE_GRACE_MS with no second hit', () => {
    const next = transitionPose(state('Stumbling', STUMBLE_GRACE_MS - 5), noInput, 5);
    expect(next.pose).toBe('Running');
  });

  it.each(['Running', 'Jumping', 'Sliding'] as const)(
    'a stumbleHit with a shield charge is absorbed: pose stays %s, one charge is consumed',
    (pose) => {
      const next = transitionPose(state(pose, 100, 2), { ...noInput, stumbleHit: true }, 16);
      expect(next.pose).toBe(pose);
      expect(next.shieldCharges).toBe(1);
    },
  );

  it('Caught is terminal: neither time nor another stumbleHit moves it anywhere else', () => {
    const afterTime = transitionPose(state('Caught', 0), noInput, 1000);
    expect(afterTime.pose).toBe('Caught');

    const afterHit = transitionPose(state('Caught', 0), { ...noInput, stumbleHit: true, chaserWithinCatchRadius: true }, 16);
    expect(afterHit.pose).toBe('Caught');
  });

  it('returns the same reference for a quiet Running tick (no dispatch needed - Running has no duration to track)', () => {
    const running = state('Running');
    expect(transitionPose(running, noInput, 16)).toBe(running);
  });

  it('returns the same reference for a quiet Caught tick', () => {
    const caught = state('Caught');
    expect(transitionPose(caught, noInput, 16)).toBe(caught);
  });
});
