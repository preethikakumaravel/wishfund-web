import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';

interface AuthValue {
  /** False when the site runs without Supabase (single-browser mode, no accounts). */
  enabled: boolean;
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  /** True after opening a password-reset email link, until a new password is saved. */
  recovering: boolean;
  finishRecovery: () => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  return (data as Profile | null) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(supabase !== null);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    async function apply(next: Session | null) {
      const nextProfile = next ? await fetchProfile(next.user.id) : null;
      if (cancelled) return;
      setSession(next);
      setProfile(nextProfile);
      setLoading(false);
    }

    void supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      // Token refreshes don't change who is signed in; skip the extra profile fetch.
      if (event === 'TOKEN_REFRESHED') {
        setSession(next);
        return;
      }
      // Run outside the auth callback; awaiting Supabase calls inside it can deadlock.
      setTimeout(() => void apply(next), 0);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Record when each user was last active (shown to the admin).
  const userId = session?.user.id;
  useEffect(() => {
    if (!supabase || !userId) return;
    void supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', userId);
  }, [userId]);

  const refreshProfile = useCallback(async () => {
    if (userId) setProfile(await fetchProfile(userId));
  }, [userId]);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, []);

  const value: AuthValue = {
    enabled: supabase !== null,
    loading,
    session,
    profile,
    isAdmin: profile?.role === 'admin' && profile.status === 'active',
    recovering,
    finishRecovery: () => setRecovering(false),
    refreshProfile,
    signOut,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
