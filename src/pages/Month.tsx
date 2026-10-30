import { useMemo, useState } from 'react';

import { allocateByPriority, PRESETS, SPLIT_KEYS, SPLIT_META, splitIncome, splitTotal } from '../lib/budget';
import type { Split } from '../lib/budget';
import { currentIsoMonth, formatMoney, monthLabel, parseMoney } from '../lib/money';
import { playCoin } from '../lib/sfx';
import { activeItems, newId } from '../state/reducer';
import { useStore } from '../state/store';
import { LevelHeading, Window } from '../ui/Window';

function shiftMonth(iso: string, delta: number): string {
  const [y, m] = iso.split('-').map(Number);
  return currentIsoMonth(new Date(y, m - 1 + delta, 1));
}

export function MonthPage({ onDone }: { onDone: () => void }) {
  const { state, dispatch } = useStore();
  const money = (n: number) => formatMoney(n, state.currency);

  const [month, setMonth] = useState(currentIsoMonth());
  const [incomeText, setIncomeText] = useState('');
  const [split, setSplit] = useState<Split>(state.defaultSplit);

  const income = parseMoney(incomeText) ?? 0;
  const total = splitTotal(split);
  const valid = total === 100 && income > 0;
  const alreadyDone = state.months.some((m) => m.month === month);
  const active = activeItems(state);
  const isDefault = SPLIT_KEYS.every((k) => split[k] === state.defaultSplit[k]);

  const preview = useMemo(() => {
    if (total !== 100) return null;
    const amounts = splitIncome(income, split);
    return { amounts, ...allocateByPriority(amounts.wishlist, activeItems(state)) };
  }, [income, split, total, state]);

  function commit() {
    if (!valid || !preview) return;
    if (
      alreadyDone &&
      !window.confirm(`You already split money for ${monthLabel(month)}. Add this as an extra amount (like a bonus)?`)
    ) {
      return;
    }
    playCoin();
    dispatch({
      type: 'commitMonth',
      entry: { id: newId(), month, income, split, ...preview, createdAt: Date.now() },
    });
    setIncomeText('');
    onDone();
  }

  return (
    <div className="page">
      <LevelHeading level="02" subtitle="Power up your" title="Monthly Budget" />

      <div className="month-layout">
        <div className="console">
          <div className="console__screen console__screen--top">
            <div className="month-nav">
              <button type="button" aria-label="Previous month" onClick={() => setMonth((m) => shiftMonth(m, -1))}>
                ‹
              </button>
              <span>{monthLabel(month).toUpperCase()}</span>
              <button type="button" aria-label="Next month" onClick={() => setMonth((m) => shiftMonth(m, 1))}>
                ›
              </button>
            </div>
            <input
              className="income-input"
              value={incomeText}
              onChange={(e) => setIncomeText(e.target.value)}
              placeholder={`${state.currency}30000`}
              inputMode="decimal"
              aria-label="Money for this month"
            />
            <div className="stack" aria-hidden>
              {SPLIT_KEYS.map((k) => (
                <span key={k} style={{ flex: split[k], background: SPLIT_META[k].color }} />
              ))}
            </div>
            {alreadyDone && <p className="small">Already split this month. New entries add on top.</p>}
          </div>

          <div className="console__hinge" />

          <div className="console__screen">
            <div className="presets">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  aria-pressed={SPLIT_KEYS.every((k) => split[k] === p.split[k])}
                  onClick={() => setSplit(p.split)}
                >
                  {p.name.toUpperCase()}
                </button>
              ))}
            </div>
            {SPLIT_KEYS.map((key) => (
              <div key={key} className="split-row">
                <span className="split-row__label">
                  {SPLIT_META[key].emoji} {SPLIT_META[key].label}{' '}
                  <span className="split-row__amt">{preview ? money(preview.amounts[key]) : '—'}</span>
                </span>
                <span className="split-row__pct">{split[key]}%</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={split[key]}
                  aria-label={`${SPLIT_META[key].label} percent`}
                  onChange={(e) => setSplit((s) => ({ ...s, [key]: Number(e.target.value) }))}
                />
              </div>
            ))}
            <div className={`total ${total === 100 ? 'total--ok' : 'total--bad'}`}>
              TOTAL {total}%{' '}
              {total === 100 ? '✓' : total < 100 ? `(ADD ${100 - total}%)` : `(REMOVE ${total - 100}%)`}
            </div>
          </div>

          <div className="console__buttons">
            <span className="dpad" aria-hidden />
            {!isDefault && total === 100 && (
              <button type="button" className="pbtn" onClick={() => dispatch({ type: 'setDefaultSplit', split })}>
                SAVE AS DEFAULT
              </button>
            )}
            <button type="button" className="pbtn pbtn--go pbtn--big" disabled={!valid} onClick={commit}>
              CONFIRM ▶
            </button>
          </div>
        </div>

        <div className="side-windows">
          <Window title="Weapons Mastery" tone="violet">
            <p style={{ margin: '0 0 8px' }}>Where the money goes:</p>
            {SPLIT_KEYS.map((k) => (
              <div key={k} className="alloc-row">
                <span>
                  {SPLIT_META[k].emoji} {SPLIT_META[k].label}
                </span>
                <b>{preview && income ? money(preview.amounts[k]) : `${split[k]}%`}</b>
              </div>
            ))}
          </Window>

          <Window title="Loot Drop" tone="pink">
            <p style={{ margin: '0 0 8px' }}>Wishlist fund goes to:</p>
            {active.length === 0 && <p className="small">No wishes yet. The whole fund goes to savings.</p>}
            {active.map((item, i) => {
              const give = preview?.allocations[item.id] ?? 0;
              const willFund = give > 0 && item.saved + give >= item.price;
              return (
                <div key={item.id} className="alloc-row">
                  <span>
                    #{i + 1} {item.title}
                  </span>
                  <b>
                    {give ? `+${money(give)}` : '—'}
                    {willFund ? ' ★' : ''}
                  </b>
                </div>
              );
            })}
            {preview && preview.leftover > 0 && active.length > 0 && (
              <p className="small" style={{ marginBottom: 0 }}>
                All wishes funded! Extra {money(preview.leftover)} goes to savings.
              </p>
            )}
          </Window>
        </div>
      </div>
    </div>
  );
}
