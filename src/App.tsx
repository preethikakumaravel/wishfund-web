import { useEffect, useRef, useState } from 'react';

import { isMuted, playClick, setMuted } from './lib/sfx';
import { supabase } from './lib/supabase';
import type { Announcement } from './lib/supabase';
import { AboutPage } from './pages/About';
import { AdminPage } from './pages/Admin';
import { HistoryPage } from './pages/History';
import { MonthPage } from './pages/Month';
import { WishlistPage } from './pages/Wishlist';
import { useAuth } from './state/auth';
import { activeItems } from './state/reducer';
import { useStore } from './state/store';
import type { SyncStatus } from './state/store';
import { Pixel } from './ui/Pixel';

const PAGES = [
  { id: 'wishlist', label: 'WISHLIST' },
  { id: 'month', label: 'MONTHLY BUDGET' },
  { id: 'history', label: 'HISTORY' },
  { id: 'about', label: 'ABOUT' },
  { id: 'admin', label: '★ ADMIN', adminOnly: true },
] as const;

type PageId = (typeof PAGES)[number]['id'];

function readHash(): PageId {
  const id = window.location.hash.replace('#/', '');
  return PAGES.some((p) => p.id === id) ? (id as PageId) : 'wishlist';
}

const SYNC_TEXT: Record<SyncStatus, string> = {
  loading: 'LOADING…',
  saving: 'SAVING…',
  saved: 'SAVED',
  error: 'NOT SAVED',
};

const DISMISSED_KEY = 'wishfund:dismissed-notices';

function readDismissed(): number[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? '[]') as number[];
  } catch {
    return [];
  }
}

function Ticker({ words }: { words: string[] }) {
  // Content is doubled so the -50% translate loops seamlessly.
  const items = [...words, ...words, ...words, ...words];
  return (
    <div className="ticker" aria-hidden>
      <div className="ticker__track">
        {[...items, ...items].map((w, i) => (
          <span key={i}>{w} ★</span>
        ))}
      </div>
    </div>
  );
}

/** Latest active notice from the admin, until the user closes it. */
function AnnouncementBar() {
  const { session } = useAuth();
  const [notice, setNotice] = useState<Announcement | null>(null);

  useEffect(() => {
    if (!supabase || !session) return;
    void supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        const dismissed = readDismissed();
        setNotice(((data ?? []) as Announcement[]).find((a) => !dismissed.includes(a.id)) ?? null);
      });
  }, [session]);

  if (!notice) return null;

  function dismiss() {
    if (!notice) return;
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...readDismissed(), notice.id].slice(-50)));
    } catch {
      // Blocked storage: it just shows again next visit.
    }
    setNotice(null);
  }

  return (
    <div className="notice-bar" role="status">
      <Pixel name="sparkle" size={2} />
      <span>{notice.message}</span>
      <button type="button" onClick={dismiss} aria-label="Dismiss announcement">
        ✕
      </button>
    </div>
  );
}

export default function App() {
  const { state, cloud, sync } = useStore();
  const { profile, isAdmin, signOut } = useAuth();
  const [page, setPage] = useState<PageId>(readHash);
  const [muted, setMutedState] = useState(isMuted);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onHash = () => setPage(readHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Every click on the page gets the retro mouse-click sound.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (e.button === 0) playClick();
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, []);

  function go(id: PageId) {
    window.location.hash = `/${id}`;
    navRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function toggleSound() {
    setMuted(!muted);
    setMutedState(!muted);
  }

  const pages = PAGES.filter((p) => !('adminOnly' in p) || isAdmin);
  const current = pages.some((p) => p.id === page) ? page : 'wishlist';

  const active = activeItems(state);
  const bought = state.items.length - active.length;
  const wanted = active.reduce((s, it) => s + it.price, 0);
  const saved = active.reduce((s, it) => s + Math.min(it.saved, it.price), 0);
  const pct = wanted ? Math.round((saved / wanted) * 100) : 0;
  const name = profile?.display_name || profile?.email.split('@')[0];

  return (
    <>
      <header className="hud">
        <span className="hud__brand">
          <Pixel name="heart" size={2} /> WISHFUND
        </span>
        <span className="hud__stat hud__label">
          {active.length} WISH{active.length === 1 ? '' : 'ES'} · {bought} BOUGHT
        </span>
        <span className="hud__spacer" />
        <span className="hud__hp" title={`${pct}% of your wishlist is saved`}>
          <span className="hud__bar">
            <span style={{ width: `${pct}%` }} />
          </span>
          <span>{pct}% SAVED</span>
        </span>
        {cloud && <span className={`hud__sync hud__label hud__sync--${sync}`}>{SYNC_TEXT[sync]}</span>}
        {name && (
          <span className="hud__user hud__label" title={profile?.email}>
            {name.toUpperCase()}
          </span>
        )}
        <button type="button" className="hud__sound" onClick={toggleSound} aria-pressed={!muted}>
          {muted ? 'SOUND OFF' : 'SOUND ON'}
        </button>
        {profile && (
          <button type="button" className="hud__sound" onClick={() => void signOut()}>
            SIGN OUT
          </button>
        )}
      </header>

      <AnnouncementBar />

      <section className="hero">
        <span className="drift" style={{ top: 30 }}>
          <Pixel name="cloud" size={5} />
        </span>
        <span className="drift" style={{ top: 140, animationDelay: '-18s', animationDuration: '55s' }}>
          <Pixel name="cloud" size={3} />
        </span>
        <span className="float" style={{ top: 80, left: '6%' }}>
          <Pixel name="star" size={4} />
        </span>
        <span className="float" style={{ top: 220, right: '7%', animationDelay: '-2s' }}>
          <Pixel name="sparkle" size={4} />
        </span>
        <span className="float" style={{ bottom: 60, left: '10%', animationDelay: '-1s' }}>
          <Pixel name="coin" size={4} />
        </span>
        <span className="float" style={{ bottom: 80, right: '12%', animationDelay: '-3s' }}>
          <Pixel name="gift" size={4} />
        </span>

        <div className="hero__frame">
          <p className="hero__year hero__hi">{name ? `HI, ${name.toUpperCase()}` : 'WELCOME'}</p>
          <h1 className="hero__title">WISHFUND</h1>
          <p className="hero__tag">
            Save the links you love. Split your monthly money. Watch every wish get funded.
          </p>
          <button type="button" className="btn-start" onClick={() => go(current)}>
            OPEN MY WISHLIST
          </button>
        </div>
        <div className="ground" />
      </section>

      <Ticker words={['Wishlist', 'Monthly budget', 'Bills', 'Spending', 'Savings']} />

      <nav className="levels" ref={navRef} aria-label="Sections">
        {pages.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-current={current === p.id ? 'page' : undefined}
            onClick={() => go(p.id)}
          >
            {p.label}
          </button>
        ))}
      </nav>

      <main>
        {current === 'wishlist' && <WishlistPage />}
        {current === 'month' && <MonthPage onDone={() => go('wishlist')} />}
        {current === 'history' && <HistoryPage />}
        {current === 'about' && <AboutPage />}
        {current === 'admin' && <AdminPage />}
      </main>

      <footer className="footer-ground">
        <div className="ground" style={{ marginTop: 0 }} />
        <Ticker words={['Save smart', 'Wish big', 'Spend happy']} />
      </footer>
    </>
  );
}
