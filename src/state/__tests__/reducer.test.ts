import { describe, expect, it } from 'vitest';
import { initialState, reducer } from '../reducer';
import type { AppState, MonthEntry, WishItem } from '../reducer';

const item = (id: string, extra: Partial<WishItem> = {}): WishItem => ({
  id,
  title: id,
  url: '',
  price: 1000,
  saved: 0,
  createdAt: 0,
  ...extra,
});

const withItems = (...items: WishItem[]): AppState => ({ ...initialState, items });

describe('reducer', () => {
  it('moves items up and down, skipping bought ones', () => {
    const state = withItems(item('a'), item('b', { purchasedAt: 1 }), item('c'));
    const moved = reducer(state, { type: 'moveItem', id: 'c', delta: -1 });
    expect(moved.items.map((i) => i.id)).toEqual(['c', 'b', 'a']);
    expect(reducer(state, { type: 'moveItem', id: 'a', delta: -1 })).toBe(state);
  });

  it('commits a month and credits allocations to items', () => {
    const entry: MonthEntry = {
      id: 'm1',
      month: '2026-10',
      income: 10000,
      split: initialState.defaultSplit,
      amounts: { bills: 4000, spending: 2500, savings: 2000, wishlist: 1500 },
      allocations: { a: 1000, b: 500 },
      leftover: 0,
      createdAt: 0,
    };
    const committed = reducer(withItems(item('a'), item('b')), { type: 'commitMonth', entry });
    expect(committed.items.map((i) => i.saved)).toEqual([1000, 500]);
    expect(committed.months).toHaveLength(1);

    const undone = reducer(committed, { type: 'undoMonth', id: 'm1' });
    expect(undone.items.map((i) => i.saved)).toEqual([0, 0]);
    expect(undone.months).toHaveLength(0);
  });

  it('hydrates missing fields with defaults', () => {
    const hydrated = reducer(initialState, { type: 'hydrate', state: { items: [item('a')] } as AppState });
    expect(hydrated.currency).toBe('₹');
    expect(hydrated.items).toHaveLength(1);
  });
});
