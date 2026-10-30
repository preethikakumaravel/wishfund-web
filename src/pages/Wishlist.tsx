import { useState } from 'react';
import type { FormEvent } from 'react';

import { monthsToFund } from '../lib/budget';
import { formatMoney, hostOf, normalizeUrl, parseMoney, toInputValue } from '../lib/money';
import { playPowerUp } from '../lib/sfx';
import { activeItems, createItem } from '../state/reducer';
import type { WishItem } from '../state/reducer';
import { useStore } from '../state/store';
import { Pixel } from '../ui/Pixel';
import { LevelHeading, Window } from '../ui/Window';

export function WishlistPage() {
  const { state, dispatch } = useStore();
  const [editing, setEditing] = useState<WishItem | 'new' | null>(null);

  const money = (n: number) => formatMoney(n, state.currency);
  const active = activeItems(state);
  const bought = state.items.filter((it) => it.purchasedAt);

  const lastFund = state.months[0]?.amounts.wishlist ?? 0;
  const etas = monthsToFund(lastFund, active);
  const totalWanted = active.reduce((s, it) => s + it.price, 0);
  const totalSaved = active.reduce((s, it) => s + Math.min(it.saved, it.price), 0);

  function markBought(item: WishItem) {
    if (!window.confirm(`Mark "${item.title}" as bought? It moves to your trophy shelf.`)) return;
    playPowerUp();
    dispatch({ type: 'setPurchased', id: item.id, purchased: true });
  }

  return (
    <div className="page">
      <LevelHeading level="01" subtitle="Collect the" title="Quest Items" />

      {active.length > 0 && (
        <Window title="Hello !!" tone="violet" className="summary-win">
          <div className="summary">
            <div>
              <div className="small">Saved towards wishes</div>
              <div className="summary__big">
                {money(totalSaved)} <span className="small">/ {money(totalWanted)}</span>
              </div>
              <div className="bar">
                <span style={{ width: `${totalWanted ? (totalSaved / totalWanted) * 100 : 0}%` }} />
              </div>
              <p className="small" style={{ margin: '10px 0 0' }}>
                {lastFund
                  ? `Last wishlist fund: ${money(lastFund)}. Item #1 fills first.`
                  : 'Go to Level 02 to fund your wishes.'}
              </p>
            </div>
            <Pixel name="gift" size={7} className="float-in-place" />
          </div>
        </Window>
      )}

      {active.length === 0 && (
        <div className="empty">
          <Pixel name="star" size={8} />
          <p>No quest items yet. Found something you want? Grab its link and press + ADD WISH.</p>
        </div>
      )}

      <div className="quest-grid" style={{ marginTop: 24 }}>
        {active.map((item, i) => {
          const funded = item.saved >= item.price;
          const eta = etas[item.id];
          return (
            <Window key={item.id} title={hostOf(item.url) || 'wish.exe'} tone={funded ? 'green' : 'pink'}>
              <div className="row">
                <span className="quest__rank">#{i + 1}</span>
                <span className="spacer" />
                <span className="quest__price">{money(item.price)}</span>
              </div>
              <h4 className="quest__name">{item.title}</h4>
              {item.note && <div className="small muted">{item.note}</div>}
              <div className={`bar ${funded ? 'bar--done' : ''}`} style={{ marginTop: 10 }}>
                <span style={{ width: `${Math.min(1, item.saved / item.price) * 100}%` }} />
              </div>
              <div className="row small" style={{ marginTop: 6 }}>
                <span>{money(Math.min(item.saved, item.price))} saved</span>
                <span className="spacer" />
                <span>
                  {funded ? '★ READY TO BUY!' : eta === null ? 'no fund yet' : `≈ ${eta} month${eta === 1 ? '' : 's'}`}
                </span>
              </div>
              <div className="quest__actions">
                <button
                  type="button"
                  className="pbtn"
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={() => dispatch({ type: 'moveItem', id: item.id, delta: -1 })}
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="pbtn"
                  aria-label="Move down"
                  disabled={i === active.length - 1}
                  onClick={() => dispatch({ type: 'moveItem', id: item.id, delta: 1 })}
                >
                  ▼
                </button>
                <span className="spacer" />
                {item.url && (
                  <a className="pbtn" href={item.url} target="_blank" rel="noreferrer">
                    OPEN
                  </a>
                )}
                <button type="button" className="pbtn" onClick={() => setEditing(item)}>
                  EDIT
                </button>
                <button
                  type="button"
                  className={`pbtn ${funded ? 'pbtn--go' : 'pbtn--pink'}`}
                  onClick={() => markBought(item)}
                >
                  BOUGHT
                </button>
              </div>
            </Window>
          );
        })}
      </div>

      {bought.length > 0 && (
        <details className="bought">
          <summary>★ Trophy shelf ({bought.length})</summary>
          <div className="quest-grid">
            {bought.map((item) => (
              <Window key={item.id} title="trophy.exe" tone="cream">
                <div className="row">
                  <Pixel name="star" size={3} />
                  <span style={{ fontSize: 22 }}>{item.title}</span>
                  <span className="spacer" />
                  <span className="quest__price">{money(item.price)}</span>
                </div>
                <div className="quest__actions">
                  <button
                    type="button"
                    className="pbtn"
                    onClick={() => dispatch({ type: 'setPurchased', id: item.id, purchased: false })}
                  >
                    BACK TO WISHLIST
                  </button>
                </div>
              </Window>
            ))}
          </div>
        </details>
      )}

      <button type="button" className="add-fab" onClick={() => setEditing('new')}>
        <Pixel name="heart" size={2} /> + ADD WISH
      </button>

      {editing && <ItemModal item={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function ItemModal({ item, onClose }: { item?: WishItem; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [url, setUrl] = useState(item?.url ?? '');
  const [title, setTitle] = useState(item?.title ?? '');
  const [price, setPrice] = useState(item ? toInputValue(item.price) : '');
  const [note, setNote] = useState(item?.note ?? '');

  const parsed = parseMoney(price);
  const canSave = title.trim().length > 0 && parsed !== null && parsed > 0;

  async function pasteLink() {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      const match = text.match(/https?:\/\/\S+/);
      setUrl(match ? match[0] : text);
      // Shopping apps often share "Product name https://link".
      const rest = match ? text.replace(match[0], '').trim() : '';
      if (rest && !title) setTitle(rest);
    } catch {
      window.alert('Clipboard access was blocked. Paste the link into the box instead.');
    }
  }

  function save(e: FormEvent) {
    e.preventDefault();
    if (!canSave || parsed === null) return;
    const fields = { title: title.trim(), url: normalizeUrl(url), price: parsed, note: note.trim() || undefined };
    if (item) dispatch({ type: 'updateItem', id: item.id, patch: fields });
    else dispatch({ type: 'addItem', item: createItem(fields) });
    onClose();
  }

  function remove() {
    if (!item) return;
    const extra = item.saved > 0 ? ` The ${formatMoney(item.saved, state.currency)} saved for it goes back to savings.` : '';
    if (!window.confirm(`Delete "${item.title}"?${extra}`)) return;
    dispatch({ type: 'removeItem', id: item.id });
    onClose();
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={item ? 'Edit wish' : 'New wish'}>
      <Window title={item ? 'edit_wish.exe' : 'new_wish.exe'} onClose={onClose}>
        <form onSubmit={save}>
          <label className="field">
            <span>PRODUCT LINK</span>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.amazon.in/..." />
          </label>
          <button type="button" className="pbtn" onClick={pasteLink} style={{ marginBottom: 14 }}>
            PASTE FROM CLIPBOARD
          </button>
          <label className="field">
            <span>WHAT IS IT?</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Noise-cancelling headphones" />
          </label>
          <label className="field">
            <span>PRICE ({state.currency})</span>
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="4999" inputMode="decimal" />
          </label>
          {price && parsed === null && <p style={{ color: 'var(--red-ink)', marginTop: -6 }}>Enter a valid amount</p>}
          <label className="field">
            <span>NOTE (OPTIONAL)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Colour, size, wait for sale…" />
          </label>
          <div className="row" style={{ marginTop: 6 }}>
            {item && (
              <button type="button" className="pbtn pbtn--danger" onClick={remove}>
                DELETE
              </button>
            )}
            <span className="spacer" />
            <button type="submit" className="pbtn pbtn--go pbtn--big" disabled={!canSave}>
              {item ? 'SAVE' : 'ADD WISH'}
            </button>
          </div>
        </form>
      </Window>
    </div>
  );
}
