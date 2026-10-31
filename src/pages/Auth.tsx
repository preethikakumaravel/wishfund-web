import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import { friendlyError, supabase } from '../lib/supabase';
import { useAuth } from '../state/auth';
import { Pixel } from '../ui/Pixel';
import { Window } from '../ui/Window';

type Mode = 'signin' | 'signup' | 'forgot';

const TITLES: Record<Mode, string> = {
  signin: 'Sign in',
  signup: 'Create account',
  forgot: 'Reset password',
};

/** Where Supabase email links (confirm, reset) send people back to. */
function siteUrl(): string {
  return window.location.origin + window.location.pathname;
}

function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="auth">
      <div className="auth__brand">
        <Pixel name="heart" size={4} />
        <h1 className="hero__title auth__title">WISHFUND</h1>
        <p className="hero__tag">Save the links you love. Split your monthly money. Watch every wish get funded.</p>
      </div>
      <Window title={title} tone="pink" className="auth__win">
        {children}
      </Window>
    </div>
  );
}

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function switchTo(next: Mode) {
    setMode(next);
    setError('');
    setNotice('');
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError('');
    setNotice('');
    const trimmedEmail = email.trim();

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
      if (error) setError(friendlyError(error));
    } else if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: { data: { display_name: name.trim() }, emailRedirectTo: siteUrl() },
      });
      if (error) setError(friendlyError(error));
      // With email confirmation on, there's no session until the link is clicked.
      else if (!data.session) setNotice(`Almost done! We sent a confirmation link to ${trimmedEmail}.`);
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, { redirectTo: siteUrl() });
      if (error) setError(friendlyError(error));
      else setNotice(`If ${trimmedEmail} has an account, a reset link is on its way.`);
    }
    setBusy(false);
  }

  return (
    <AuthShell title={TITLES[mode]}>
      {mode !== 'forgot' && (
        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'signin'} onClick={() => switchTo('signin')}>
            SIGN IN
          </button>
          <button type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => switchTo('signup')}>
            SIGN UP
          </button>
        </div>
      )}

      <form onSubmit={submit}>
        {mode === 'signup' && (
          <label className="field">
            <span>YOUR NAME</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={60} required />
          </label>
        )}
        <label className="field">
          <span>EMAIL</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        {mode !== 'forgot' && (
          <label className="field">
            <span>PASSWORD</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={6}
              required
            />
          </label>
        )}

        {error && <p className="form-msg form-msg--error">{error}</p>}
        {notice && <p className="form-msg form-msg--ok">{notice}</p>}

        <div className="row" style={{ marginTop: 6 }}>
          {mode === 'signin' && (
            <button type="button" className="linkish" onClick={() => switchTo('forgot')}>
              Forgot password?
            </button>
          )}
          {mode === 'forgot' && (
            <button type="button" className="linkish" onClick={() => switchTo('signin')}>
              ‹ Back to sign in
            </button>
          )}
          <span className="spacer" />
          <button type="submit" className="pbtn pbtn--go pbtn--big" disabled={busy}>
            {busy ? 'PLEASE WAIT…' : mode === 'signin' ? 'SIGN IN' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SEND LINK'}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}

/** Shown after someone opens a password-reset link from their email. */
export function NewPasswordPage({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError(friendlyError(error));
    else onDone();
  }

  return (
    <AuthShell title="Choose a new password">
      <form onSubmit={submit}>
        <label className="field">
          <span>NEW PASSWORD</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        {error && <p className="form-msg form-msg--error">{error}</p>}
        <div className="row">
          <span className="spacer" />
          <button type="submit" className="pbtn pbtn--go pbtn--big" disabled={busy}>
            SAVE PASSWORD
          </button>
        </div>
      </form>
    </AuthShell>
  );
}

export function BlockedPage() {
  const { profile, signOut } = useAuth();
  return (
    <AuthShell title="Account blocked">
      <p style={{ marginTop: 0 }}>
        The account <b>{profile?.email}</b> has been blocked by the admin. Contact them if you think this is a
        mistake.
      </p>
      <div className="row">
        <span className="spacer" />
        <button type="button" className="pbtn" onClick={() => void signOut()}>
          SIGN OUT
        </button>
      </div>
    </AuthShell>
  );
}

export function LoadingPage({ text = 'Loading…' }: { text?: string }) {
  return (
    <div className="auth auth--loading">
      <Pixel name="coin" size={5} className="float-in-place" />
      <p className="hero__tag">{text}</p>
    </div>
  );
}

/** Signed in, but no profile row came back (database not set up, or the network failed). */
export function ProfileMissingPage() {
  const { refreshProfile, signOut } = useAuth();
  return (
    <AuthShell title="Couldn't load your account">
      <p style={{ marginTop: 0 }}>
        Your sign-in worked, but your account details didn't load. Check your connection and try again. If it keeps
        happening, tell the admin.
      </p>
      <div className="row">
        <button type="button" className="pbtn" onClick={() => void signOut()}>
          SIGN OUT
        </button>
        <span className="spacer" />
        <button type="button" className="pbtn pbtn--go" onClick={() => void refreshProfile()}>
          TRY AGAIN
        </button>
      </div>
    </AuthShell>
  );
}
