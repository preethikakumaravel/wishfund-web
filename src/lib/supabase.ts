import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Both values are public by design (access is enforced by row level security in supabase/schema.sql).
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Null when the site is built without Supabase settings; the app then runs in single-browser mode. */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;

export type Role = 'user' | 'admin';
export type Status = 'active' | 'blocked';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: Role;
  status: Status;
  created_at: string;
  last_seen_at: string | null;
}

export interface Announcement {
  id: number;
  message: string;
  active: boolean;
  created_at: string;
}

/** Turns Supabase/Postgres errors into a sentence a user can act on. */
export function friendlyError(error: { message: string } | null | undefined): string {
  if (!error) return '';
  const msg = error.message;
  if (/invalid login credentials/i.test(msg)) return 'Wrong email or password.';
  if (/email not confirmed/i.test(msg)) return 'Confirm your email first. Check your inbox for the link.';
  if (/user already registered/i.test(msg)) return 'An account with this email already exists. Sign in instead.';
  if (/password should be at least/i.test(msg)) return 'Password must be at least 6 characters.';
  if (/rate limit/i.test(msg)) return 'Too many attempts. Wait a minute and try again.';
  return msg;
}
