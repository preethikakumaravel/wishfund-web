import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { friendlyError, supabase } from '../lib/supabase';
import type { Announcement, Profile } from '../lib/supabase';
import { useAuth } from '../state/auth';
import { PageHeading, Window } from '../ui/Window';

function shortDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function AdminPage() {
  const { isAdmin } = useAuth();
  if (!supabase || !isAdmin) {
    return (
      <div className="page">
        <PageHeading title="Admin" subtitle="Only admins can open this page." />
      </div>
    );
  }
  return (
    <div className="page">
      <PageHeading title="Admin" subtitle="Manage who uses WishFund and post notices to everyone." />
      <div className="admin-grid">
        <UsersPanel />
        <AnnouncementsPanel />
      </div>
    </div>
  );
}

function UsersPanel() {
  const { profile: me } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) setError(friendlyError(error));
    else setUsers((data ?? []) as Profile[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function update(user: Profile, patch: Partial<Pick<Profile, 'role' | 'status'>>) {
    if (!supabase) return;
    setBusyId(user.id);
    const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
    setBusyId(null);
    if (error) setError(friendlyError(error));
    else await load();
  }

  async function remove(user: Profile) {
    if (!supabase) return;
    const ok = window.confirm(
      `Permanently delete ${user.email}? Their account, wishlist and history are erased. This cannot be undone.`,
    );
    if (!ok) return;
    setBusyId(user.id);
    const { error } = await supabase.rpc('admin_delete_user', { target: user.id });
    setBusyId(null);
    if (error) setError(friendlyError(error));
    else await load();
  }

  const q = query.trim().toLowerCase();
  const shown = q
    ? users.filter((u) => u.email.toLowerCase().includes(q) || (u.display_name ?? '').toLowerCase().includes(q))
    : users;
  const blocked = users.filter((u) => u.status === 'blocked').length;
  const admins = users.filter((u) => u.role === 'admin').length;

  return (
    <Window title="Users" tone="cream" className="admin-users">
      <div className="stat-row">
        <div className="stat">
          <b>{users.length}</b>
          <span>Total</span>
        </div>
        <div className="stat">
          <b>{users.length - blocked}</b>
          <span>Active</span>
        </div>
        <div className="stat">
          <b>{blocked}</b>
          <span>Blocked</span>
        </div>
        <div className="stat">
          <b>{admins}</b>
          <span>Admins</span>
        </div>
      </div>

      <label className="field">
        <span>SEARCH</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name or email" />
      </label>
      {error && <p className="form-msg form-msg--error">{error}</p>}

      <div className="user-list">
        {shown.map((u) => {
          const self = u.id === me?.id;
          const busy = busyId === u.id;
          return (
            <div key={u.id} className={`user-row ${u.status === 'blocked' ? 'user-row--blocked' : ''}`}>
              <div className="user-row__who">
                <b>{u.display_name || u.email.split('@')[0]}</b>
                {u.role === 'admin' && <span className="tag tag--admin">ADMIN</span>}
                {u.status === 'blocked' && <span className="tag tag--blocked">BLOCKED</span>}
                {self && <span className="tag">YOU</span>}
                <div className="small muted">{u.email}</div>
                <div className="small muted">
                  Joined {shortDate(u.created_at)} · Last active {shortDate(u.last_seen_at)}
                </div>
              </div>
              {!self && (
                <div className="user-row__actions">
                  <button
                    type="button"
                    className="pbtn"
                    disabled={busy}
                    onClick={() => void update(u, { status: u.status === 'blocked' ? 'active' : 'blocked' })}
                  >
                    {u.status === 'blocked' ? 'UNBLOCK' : 'BLOCK'}
                  </button>
                  <button
                    type="button"
                    className="pbtn"
                    disabled={busy}
                    onClick={() => {
                      const makeAdmin = u.role !== 'admin';
                      const msg = makeAdmin
                        ? `Make ${u.email} an admin? They will be able to manage all users.`
                        : `Remove admin rights from ${u.email}?`;
                      if (window.confirm(msg)) void update(u, { role: makeAdmin ? 'admin' : 'user' });
                    }}
                  >
                    {u.role === 'admin' ? 'REMOVE ADMIN' : 'MAKE ADMIN'}
                  </button>
                  <button type="button" className="pbtn pbtn--danger" disabled={busy} onClick={() => void remove(u)}>
                    DELETE
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {shown.length === 0 && <p className="small">No users match.</p>}
      </div>
    </Window>
  );
}

function AnnouncementsPanel() {
  const { profile } = useAuth();
  const [items, setItems] = useState<Announcement[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(friendlyError(error));
    else setItems((data ?? []) as Announcement[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function post(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !message.trim()) return;
    setBusy(true);
    const { error } = await supabase.from('announcements').insert({ message: message.trim(), created_by: profile?.id });
    setBusy(false);
    if (error) setError(friendlyError(error));
    else {
      setMessage('');
      await load();
    }
  }

  async function toggle(a: Announcement) {
    if (!supabase) return;
    const { error } = await supabase.from('announcements').update({ active: !a.active }).eq('id', a.id);
    if (error) setError(friendlyError(error));
    else await load();
  }

  async function remove(a: Announcement) {
    if (!supabase || !window.confirm('Delete this announcement?')) return;
    const { error } = await supabase.from('announcements').delete().eq('id', a.id);
    if (error) setError(friendlyError(error));
    else await load();
  }

  return (
    <Window title="Announcements" tone="violet">
      <form onSubmit={post}>
        <label className="field">
          <span>NEW NOTICE FOR ALL USERS</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="e.g. New feature: you can now export your history!"
          />
        </label>
        <div className="row">
          <span className="small muted">{message.length}/500</span>
          <span className="spacer" />
          <button type="submit" className="pbtn pbtn--go" disabled={busy || !message.trim()}>
            POST
          </button>
        </div>
      </form>
      {error && <p className="form-msg form-msg--error">{error}</p>}

      <div style={{ marginTop: 14 }}>
        {items.length === 0 && <p className="small">No announcements yet.</p>}
        {items.map((a) => (
          <div key={a.id} className={`notice-row ${a.active ? '' : 'notice-row--off'}`}>
            <p>{a.message}</p>
            <div className="row small">
              <span className="muted">
                {shortDate(a.created_at)} · {a.active ? 'Showing' : 'Hidden'}
              </span>
              <span className="spacer" />
              <button type="button" className="pbtn" onClick={() => void toggle(a)}>
                {a.active ? 'HIDE' : 'SHOW'}
              </button>
              <button type="button" className="pbtn pbtn--danger" onClick={() => void remove(a)}>
                DELETE
              </button>
            </div>
          </div>
        ))}
      </div>
    </Window>
  );
}
