import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './index.css';
import { AuthPage, BlockedPage, LoadingPage, NewPasswordPage, ProfileMissingPage } from './pages/Auth';
import { AuthProvider, useAuth } from './state/auth';
import { StoreProvider } from './state/store';

/** Decides what to show: sign-in, blocked notice, or the app with the user's own data. */
function Gate() {
  const { enabled, loading, session, profile, recovering, finishRecovery } = useAuth();

  // Built without Supabase settings: single-browser mode, no accounts.
  if (!enabled) {
    return (
      <StoreProvider>
        <App />
      </StoreProvider>
    );
  }
  if (loading) return <LoadingPage />;
  if (recovering && session) return <NewPasswordPage onDone={finishRecovery} />;
  if (!session) return <AuthPage />;
  if (!profile) return <ProfileMissingPage />;
  if (profile.status === 'blocked') return <BlockedPage />;

  // Keyed by user so switching accounts never mixes one person's data into another's.
  return (
    <StoreProvider key={profile.id} userId={profile.id}>
      <App />
    </StoreProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Gate />
    </AuthProvider>
  </StrictMode>,
);
