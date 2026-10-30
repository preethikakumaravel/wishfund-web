import { useEffect, useRef, useState } from 'react';

import { isMuted, playClick, setMuted } from './lib/sfx';
import { AboutPage } from './pages/About';
import { HistoryPage } from './pages/History';
import { MonthPage } from './pages/Month';
import { WishlistPage } from './pages/Wishlist';
import { activeItems } from './state/reducer';
import { useStore } from './state/store';
import { Pixel } from './ui/Pixel';

const PAGES = [
  { id: 'wishlist', label: 'LVL 01 WISHLIST' },
  { id: 'month', label: 'LVL 02 THIS MONTH' },
  { id: 'history', label: 'LVL 03 LOG' },
  { id: 'about', label: '★ ABOUT ME' },
] as const;

type PageId = (typeof PAGES)[number]['id'];

function readHash(): PageId {
  const id = window.location.hash.replace('#/', '');
  return PAGES.some((p) => p.id === id) ? (id as PageId) : 'wishlist';
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

export default function App() {
  const { state } = useStore();
  const [page, setPage] = useState<PageId>(readHash);
  const [muted, setMutedState] = useState(isMuted);
  const levelsRef = useRef<HTMLElement>(null);

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
    levelsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function toggleSound() {
    setMuted(!muted);
    setMutedState(!muted);
  }

  const active = activeItems(state);
  const bought = state.items.length - active.length;
  const wanted = active.reduce((s, it) => s + it.price, 0);
  const saved = active.reduce((s, it) => s + Math.min(it.saved, it.price), 0);
  const hp = wanted ? Math.round((saved / wanted) * 100) : 0;

  return (
    <>
      <header className="hud">
        <span className="hud__xp">
          XP<span className="hud__label">: WISH LEVEL</span> {String(bought + 1).padStart(2, '0')}
        </span>
        <span className="hud__spacer" />
        <span className="hud__hp" title={`${hp}% of your wishlist saved`}>
          <Pixel name="heart" size={2} />
          <span className="hud__bar">
            <span style={{ width: `${hp}%` }} />
          </span>
          <span className="hud__label">PLAYER 01</span>
        </span>
        <button type="button" className="hud__sound" onClick={toggleSound} aria-pressed={!muted}>
          {muted ? 'SOUND OFF' : 'SOUND ON'}
        </button>
      </header>

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
          <p className="hero__year">2026</p>
          <h1 className="hero__title">WISHFUND</h1>
          <p className="hero__tag">Save the links you love. Split your money. Level up until every wish is yours.</p>
          <button type="button" className="btn-start" onClick={() => go(page)}>
            START
          </button>
        </div>
        <div className="ground" />
      </section>

      <Ticker words={['Wishlist', 'This month', 'Save', 'Level up', 'About me']} />

      <nav className="levels" ref={levelsRef} aria-label="Levels">
        {PAGES.map((p) => (
          <button key={p.id} type="button" aria-current={page === p.id ? 'page' : undefined} onClick={() => go(p.id)}>
            {p.label}
          </button>
        ))}
      </nav>

      <main>
        {page === 'wishlist' && <WishlistPage />}
        {page === 'month' && <MonthPage onDone={() => go('wishlist')} />}
        {page === 'history' && <HistoryPage />}
        {page === 'about' && <AboutPage />}
      </main>

      <footer className="footer-ground">
        <div className="ground" style={{ marginTop: 0 }} />
        <Ticker words={['Missions', 'Missions', 'Missions']} />
      </footer>
    </>
  );
}
