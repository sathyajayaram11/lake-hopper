import { beforeEach, describe, expect, it } from 'vitest';
import { createInputSystem, type InputSystem } from '../../src/systems/input';

function keyEvent(key: string): Event {
  const event = new Event('keydown');
  Object.defineProperty(event, 'key', { value: key });
  return event;
}

function pointerEvent(type: string, clientX: number): Event {
  const event = new Event(type);
  Object.defineProperty(event, 'clientX', { value: clientX });
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
    expect(input.consumeIntent()).toEqual({ laneDirection: 0 });
  });

  it('registers ArrowLeft as laneDirection -1, then resets to neutral on the next read', () => {
    target.dispatchEvent(keyEvent('ArrowLeft'));
    expect(input.consumeIntent()).toEqual({ laneDirection: -1 });
    expect(input.consumeIntent()).toEqual({ laneDirection: 0 });
  });

  it('registers ArrowRight as laneDirection 1', () => {
    target.dispatchEvent(keyEvent('ArrowRight'));
    expect(input.consumeIntent()).toEqual({ laneDirection: 1 });
  });

  it('registers a leftward swipe past the threshold as laneDirection -1', () => {
    target.dispatchEvent(pointerEvent('pointerdown', 200));
    target.dispatchEvent(pointerEvent('pointerup', 100));
    expect(input.consumeIntent()).toEqual({ laneDirection: -1 });
  });

  it('ignores a swipe under the threshold', () => {
    target.dispatchEvent(pointerEvent('pointerdown', 200));
    target.dispatchEvent(pointerEvent('pointerup', 190));
    expect(input.consumeIntent()).toEqual({ laneDirection: 0 });
  });

  it('stops registering events after detach', () => {
    input.detach();
    target.dispatchEvent(keyEvent('ArrowLeft'));
    expect(input.consumeIntent()).toEqual({ laneDirection: 0 });
  });
});
