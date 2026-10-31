import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { supabase } from '../lib/supabase';
import { initialState, reducer } from './reducer';
import type { Action, AppState } from './reducer';

const STORAGE_KEY = 'wishfund:v1';
const SAVE_DELAY_MS = 600;

export type SyncStatus = 'loading' | 'saved' | 'saving' | 'error';

interface StoreValue {
  state: AppState;
  dispatch: (action: Action) => void;
  /** Where the data lives: this browser only, or the signed-in user's account. */
  cloud: boolean;
  sync: SyncStatus;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadLocal(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? reducer(initialState, { type: 'hydrate', state: JSON.parse(raw) }) : initialState;
  } catch {
    return initialState;
  }
}

/**
 * Holds the wishlist/months state. With a `userId` it loads from and saves to that user's
 * row in Supabase; without one it uses localStorage (single-browser mode).
 */
export function StoreProvider({ userId, children }: { userId?: string; children: ReactNode }) {
  const cloud = Boolean(supabase && userId);
  const [state, dispatch] = useReducer(reducer, undefined, () => (cloud ? initialState : loadLocal()));
  const [sync, setSync] = useState<SyncStatus>(cloud ? 'loading' : 'saved');
  // Skip saving until the account's data has been loaded, so we never overwrite it with an empty state.
  const loaded = useRef(!cloud);

  useEffect(() => {
    if (!supabase || !userId) return;
    let cancelled = false;
    void supabase
      .from('user_data')
      .select('state')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setSync('error');
          return;
        }
        if (data?.state) dispatch({ type: 'hydrate', state: data.state as AppState });
        loaded.current = true;
        setSync('saved');
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!loaded.current) return;
    if (!supabase || !userId) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Storage full or blocked; the session keeps working in memory.
      }
      return;
    }
    const client = supabase;
    setSync('saving');
    const timer = setTimeout(() => {
      void client
        .from('user_data')
        .upsert({ user_id: userId, state, updated_at: new Date().toISOString() })
        .then(({ error }) => setSync(error ? 'error' : 'saved'));
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state, userId]);

  return <StoreContext.Provider value={{ state, dispatch, cloud, sync }}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
