import type { ReactElement } from 'react';
import { eventBus } from '../../core/events/bus';

export function Start(): ReactElement {
  function handleStart(): void {
    eventBus.emit('RunStartRequested', { characterId: null });
  }

  return (
    <div>
      <button onClick={handleStart}>Start</button>
    </div>
  );
}
