import { DEFAULT_SPLIT } from '../lib/budget';
import type { Split, SplitKey } from '../lib/budget';

export interface WishItem {
  id: string;
  title: string;
  url: string;
  /** Target price, minor units. */
  price: number;
  /** Money set aside so far from wishlist funds, minor units. */
  saved: number;
  note?: string;
  createdAt: number;
  purchasedAt?: number;
}

export interface MonthEntry {
  id: string;
  /** "YYYY-MM" */
  month: string;
  income: number;
  split: Split;
  amounts: Record<SplitKey, number>;
  /** itemId -> amount moved from the wishlist fund into that item. */
  allocations: Record<string, number>;
  /** Wishlist money not needed by any item; counted as extra savings. */
  leftover: number;
  createdAt: number;
}

export interface AppState {
  /** Array order is priority: index 0 gets funded first. */
  items: WishItem[];
  months: MonthEntry[];
  defaultSplit: Split;
  currency: string;
}

export const initialState: AppState = {
  items: [],
  months: [],
  defaultSplit: DEFAULT_SPLIT,
  currency: '₹',
};

export type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'addItem'; item: WishItem }
  | { type: 'updateItem'; id: string; patch: Partial<Omit<WishItem, 'id'>> }
  | { type: 'removeItem'; id: string }
  | { type: 'moveItem'; id: string; delta: -1 | 1 }
  | { type: 'setPurchased'; id: string; purchased: boolean }
  | { type: 'commitMonth'; entry: MonthEntry }
  | { type: 'undoMonth'; id: string }
  | { type: 'setDefaultSplit'; split: Split }
  | { type: 'setCurrency'; currency: string }
  | { type: 'reset' };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return { ...initialState, ...action.state };

    case 'addItem':
      return { ...state, items: [...state.items, action.item] };

    case 'updateItem':
      return {
        ...state,
        items: state.items.map((it) => (it.id === action.id ? { ...it, ...action.patch } : it)),
      };

    case 'removeItem':
      return { ...state, items: state.items.filter((it) => it.id !== action.id) };

    case 'moveItem': {
      const from = state.items.findIndex((it) => it.id === action.id);
      // Skip over purchased items so arrows move between active wishes.
      let to = from + action.delta;
      while (to >= 0 && to < state.items.length && state.items[to].purchasedAt) {
        to += action.delta;
      }
      if (from < 0 || to < 0 || to >= state.items.length) return state;
      const items = [...state.items];
      [items[from], items[to]] = [items[to], items[from]];
      return { ...state, items };
    }

    case 'setPurchased':
      return {
        ...state,
        items: state.items.map((it) =>
          it.id === action.id ? { ...it, purchasedAt: action.purchased ? Date.now() : undefined } : it,
        ),
      };

    case 'commitMonth': {
      const { allocations } = action.entry;
      return {
        ...state,
        months: [action.entry, ...state.months],
        items: state.items.map((it) =>
          allocations[it.id] ? { ...it, saved: it.saved + allocations[it.id] } : it,
        ),
      };
    }

    case 'undoMonth': {
      const entry = state.months.find((m) => m.id === action.id);
      if (!entry) return state;
      return {
        ...state,
        months: state.months.filter((m) => m.id !== action.id),
        items: state.items.map((it) =>
          entry.allocations[it.id]
            ? { ...it, saved: Math.max(0, it.saved - entry.allocations[it.id]) }
            : it,
        ),
      };
    }

    case 'setDefaultSplit':
      return { ...state, defaultSplit: action.split };

    case 'setCurrency':
      return { ...state, currency: action.currency };

    case 'reset':
      return initialState;
  }
}

export function activeItems(state: AppState): WishItem[] {
  return state.items.filter((it) => !it.purchasedAt);
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function createItem(fields: Pick<WishItem, 'title' | 'url' | 'price' | 'note'>): WishItem {
  return { id: newId(), saved: 0, createdAt: Date.now(), ...fields };
}
