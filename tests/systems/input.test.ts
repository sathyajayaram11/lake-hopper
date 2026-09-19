import { beforeEach, describe, expect, it } from 'vitest';
import { createInputSystem, type InputSystem } from '../../src/systems/input';

const neutral = { laneDirection: 0, jumpRequested: false, slideRequested: false };

function keyEvent(key: string): Event {
  const event = new Event('keydown');
  Object.defineProperty(event, 'key', { value: key });
  return event;
}

function pointerEvent(type: string, clientX: number, clientY = 0): Event {
  const event = new Event(type);
  Object.defineProperty(event, 'clientX', { value: clientX });
  Object.defineProperty(event, 'clientY', { value: clientY });
  return event;
}

describe('createInputSystem', () => {
  let target: EventTarget;
  let input: InputSystem;

  beforeEach(() => {
    target = new EventTarget();
    input = createInputSystem(target);
    input.attach();
  });

  it('reports neutral when nothing has happened', () => {
    expect(input.consumeIntent()).toEqual(neutral);
  });

  it('registers ArrowLeft as laneDirection -1, then resets to neutral on the next read', () => {
    target.dispatchEvent(keyEvent('ArrowLeft'));
    expect(input.consumeIntent()).toEqual({ ...neutral, laneDirection: -1 });
    expect(input.consumeIntent()).toEqual(neutral);
  });

  it('registers ArrowRight as laneDirection 1', () => {
    target.dispatchEvent(keyEvent('ArrowRight'));
    expect(input.consumeIntent()).toEqual({ ...neutral, laneDirection: 1 });
  });

  it('registers ArrowUp as jumpRequested, then resets on the next read', () => {
    target.dispatchEvent(keyEvent('ArrowUp'));
    expect(input.consumeIntent()).toEqual({ ...neutral, jumpRequested: true });
    expect(input.consumeIntent()).toEqual(neutral);
  });

  it('registers ArrowDown as slideRequested', () => {
    target.dispatchEvent(keyEvent('ArrowDown'));
    expect(input.consumeIntent()).toEqual({ ...neutral, slideRequested: true });
  });

  it('registers a leftward swipe past the threshold as laneDirection -1', () => {
    target.dispatchEvent(pointerEvent('pointerdown', 200));
    target.dispatchEvent(pointerEvent('pointerup', 100));
    expect(input.consumeIntent()).toEqual({ ...neutral, laneDirection: -1 });
  });

  it('registers an upward swipe past the threshold as jumpRequested', () => {
    target.dispatchEvent(pointerEvent('pointerdown', 0, 200));
    target.dispatchEvent(pointerEvent('pointerup', 0, 100));
    expect(input.consumeIntent()).toEqual({ ...neutral, jumpRequested: true });
  });

  it('registers a downward swipe past the threshold as slideRequested', () => {
    target.dispatchEvent(pointerEvent('pointerdown', 0, 100));
    target.dispatchEvent(pointerEvent('pointerup', 0, 200));
    expect(input.consumeIntent()).toEqual({ ...neutral, slideRequested: true });
  });

  it('classifies a diagonal swipe by its dominant axis: larger horizontal delta wins as a lane change', () => {
    target.dispatchEvent(pointerEvent('pointerdown', 200, 200));
    target.dispatchEvent(pointerEvent('pointerup', 100, 150)); // deltaX=-100, deltaY=-50
    expect(input.consumeIntent()).toEqual({ ...neutral, laneDirection: -1 });
  });

  it('classifies a diagonal swipe by its dominant axis: larger vertical delta wins as a jump', () => {
    target.dispatchEvent(pointerEvent('pointerdown', 200, 200));
    target.dispatchEvent(pointerEvent('pointerup', 150, 100)); // deltaX=-50, deltaY=-100
    expect(input.consumeIntent()).toEqual({ ...neutral, jumpRequested: true });
  });

  it('ignores a swipe under the threshold', () => {
    target.dispatchEvent(pointerEvent('pointerdown', 200));
    target.dispatchEvent(pointerEvent('pointerup', 190));
    expect(input.consumeIntent()).toEqual(neutral);
  });

  it('stops registering events after detach', () => {
    input.detach();
    target.dispatchEvent(keyEvent('ArrowLeft'));
    expect(input.consumeIntent()).toEqual(neutral);
  });
});
