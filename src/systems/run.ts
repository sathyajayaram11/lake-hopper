import { now } from '../core/loop/clock';
import type { EventBus } from '../core/events/bus';
import type { Store } from '../core/state/store';

export function initRunSystem(deps: { bus: EventBus; store: Store }): void {
  deps.bus.on('RunStartRequested', ({ characterId }) => {
    const runId = crypto.randomUUID();
    deps.store.dispatch({ type: 'run/started', runId });
    deps.bus.emit('run_started', { runId, characterId, timestamp: now() });
  });
}
