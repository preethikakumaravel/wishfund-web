import { SPLIT_KEYS, SPLIT_META } from '../lib/budget';
import { formatMoney, monthLabel } from '../lib/money';
import { useStore } from '../state/store';
import { Pixel } from '../ui/Pixel';
import { PageHeading, Window } from '../ui/Window';

const CURRENCIES = ['₹', '$', '€', '£', '¥'];

export function HistoryPage() {
  const { state, dispatch, cloud } = useStore();
  const money = (n: number) => formatMoney(n, state.currency);
  const titleOf = (id: string) => state.items.find((it) => it.id === id)?.title ?? 'Deleted item';

  const totals = Object.fromEntries(
    SPLIT_KEYS.map((k) => [k, state.months.reduce((s, m) => s + m.amounts[k], 0)]),
  ) as Record<string, number>;
  const leftover = state.months.reduce((s, m) => s + m.leftover, 0);

  return (
    <div className="page">
      <PageHeading title="History" subtitle="Every month you have split, with all-time totals." />

      <div className="log-grid">
        <Window title="All-time totals" tone="green">
          <p style={{ margin: '0 0 8px' }}>All time</p>
          {SPLIT_KEYS.map((k) => (
            <div key={k} className="kv">
              <span>
                {SPLIT_META[k].emoji} {SPLIT_META[k].label}
              </span>
              <span>{money(totals[k])}</span>
            </div>
          ))}
          {leftover > 0 && <p className="small">Includes {money(leftover)} of unused wishlist fund moved to savings.</p>}
        </Window>

        <Window title="Settings" tone="cream">
          <p style={{ margin: '0 0 8px' }}>Currency</p>
          <div className="chips">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={state.currency === c}
                onClick={() => dispatch({ type: 'setCurrency', currency: c })}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="small">
            {cloud
              ? 'Your data is saved to your account and is private to you.'
              : 'Data lives only in this browser. Nothing is uploaded.'}
          </p>
          <button
            type="button"
            className="pbtn pbtn--danger"
            onClick={() => {
              if (window.confirm(`Erase all wishes, months and settings from ${cloud ? 'your account' : 'this browser'}? This cannot be undone.`)) {
                dispatch({ type: 'reset' });
              }
            }}
          >
            ERASE ALL DATA
          </button>
        </Window>

        {state.months.length === 0 && (
          <Window title="No months yet" tone="pink">
            <div className="row">
              <Pixel name="coin" size={4} />
              <span>Save a month in Monthly budget to start your history.</span>
            </div>
          </Window>
        )}

        {state.months.map((m, i) => (
          <Window key={m.id} title={monthLabel(m.month)} tone="pink">
            <div className="kv" style={{ fontSize: 26 }}>
              <span>Income</span>
              <span>{money(m.income)}</span>
            </div>
            <div className="stack" aria-hidden>
              {SPLIT_KEYS.map((k) => (
                <span key={k} style={{ flex: m.split[k], background: SPLIT_META[k].color }} />
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              {SPLIT_KEYS.map((k) => (
                <div key={k} className="kv small">
                  <span>
                    {SPLIT_META[k].label} · {m.split[k]}%
                  </span>
                  <span>{money(m.amounts[k])}</span>
                </div>
              ))}
            </div>
            {Object.entries(m.allocations).map(([id, amt]) => (
              <div key={id} className="small">
                ★ {titleOf(id)}: +{money(amt)}
              </div>
            ))}
            {i === 0 && (
              <button
                type="button"
                className="pbtn pbtn--danger"
                style={{ marginTop: 10 }}
                onClick={() => {
                  if (window.confirm('Undo this entry? Its wishlist money is taken back from your items.')) {
                    dispatch({ type: 'undoMonth', id: m.id });
                  }
                }}
              >
                UNDO
              </button>
            )}
          </Window>
        ))}
      </div>
    </div>
  );
}
