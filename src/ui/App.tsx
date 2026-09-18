import type { ReactElement } from 'react';
import { selectIsLoggedIn, selectRunStatus } from '../core/state/selectors';
import { useGameState } from './hooks/useGameState';
import { Login } from './screens/Login';
import { Start } from './screens/Start';

export function App(): ReactElement | null {
  const isLoggedIn = useGameState(selectIsLoggedIn);
  const runStatus = useGameState(selectRunStatus);

  if (!isLoggedIn) return <Login />;
  if (runStatus === 'idle') return <Start />;
  return null;
}
