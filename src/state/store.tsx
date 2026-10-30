import { createContext, useContext, useEffect, useReducer } from 'react';
import type { ReactNode } from 'react';

import { initialState, reducer } from './reducer';
import type { Action, AppState } from './reducer';

const STORAGE_KEY = 'wishfund:v1';

interface StoreValue {
  state: AppState;
  dispatch: (action: Action) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? reducer(initialState, { type: 'hydrate', state: JSON.parse(raw) }) : initialState;
  } catch {
    return initialState;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked; the session keeps working in memory.
    }
  }, [state]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
