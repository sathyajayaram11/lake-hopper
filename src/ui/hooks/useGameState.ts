import { useSyncExternalStore } from 'react';
import { store, type GameState } from '../../core/state/store';

export function useGameState<T>(selector: (state: GameState) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(store.getState()));
}
