// Pure budgeting math. All money values are integer minor units (paise/cents)
// so splits always add up exactly.

export type SplitKey = 'bills' | 'spending' | 'savings' | 'wishlist';

/** Percentages per bucket; must total 100. */
export type Split = Record<SplitKey, number>;

export const SPLIT_KEYS: SplitKey[] = ['bills', 'spending', 'savings', 'wishlist'];

export const SPLIT_META: Record<SplitKey, { label: string; emoji: string; color: string }> = {
  bills: { label: 'Regular payments', emoji: '🧾', color: '#ffd23f' },
  spending: { label: 'Spending', emoji: '🛍️', color: '#ff4fa3' },
  savings: { label: 'Savings', emoji: '🏦', color: '#5dfc8d' },
  wishlist: { label: 'Wishlist fund', emoji: '🎁', color: '#8f7cff' },
};

export const PRESETS: { name: string; split: Split }[] = [
  { name: 'Balanced', split: { bills: 40, spending: 25, savings: 20, wishlist: 15 } },
  { name: '50/30/20', split: { bills: 50, spending: 20, savings: 20, wishlist: 10 } },
  { name: 'Saver', split: { bills: 35, spending: 15, savings: 35, wishlist: 15 } },
  { name: 'Wish hunter', split: { bills: 35, spending: 15, savings: 20, wishlist: 30 } },
];

export const DEFAULT_SPLIT: Split = PRESETS[0].split;

export function splitTotal(split: Split): number {
  return SPLIT_KEYS.reduce((sum, k) => sum + split[k], 0);
}

/**
 * Divide income into buckets. Each bucket is rounded down; the few leftover
 * minor units from rounding go to savings so the parts sum to the income.
 */
export function splitIncome(income: number, split: Split): Record<SplitKey, number> {
  if (splitTotal(split) !== 100) {
    throw new Error('Split must total 100%');
  }
  const parts = {} as Record<SplitKey, number>;
  let used = 0;
  for (const k of SPLIT_KEYS) {
    parts[k] = Math.floor((income * split[k]) / 100);
    used += parts[k];
  }
  parts.savings += income - used;
  return parts;
}

export interface FundTarget {
  id: string;
  price: number;
  saved: number;
}

/**
 * Pour the wishlist fund into items in priority order (array order): the top
 * item is filled completely before the next one gets anything. Whatever is
 * left after every item is fully funded is returned as `leftover`.
 */
export function allocateByPriority(
  fund: number,
  items: FundTarget[],
): { allocations: Record<string, number>; leftover: number } {
  const allocations: Record<string, number> = {};
  let remaining = fund;
  for (const item of items) {
    if (remaining <= 0) break;
    const need = Math.max(0, item.price - item.saved);
    const give = Math.min(need, remaining);
    if (give > 0) {
      allocations[item.id] = give;
      remaining -= give;
    }
  }
  return { allocations, leftover: remaining };
}

/**
 * Months until each item is fully funded if `monthlyFund` keeps flowing in
 * priority order. 0 means already funded; null means never (fund is 0).
 */
export function monthsToFund(monthlyFund: number, items: FundTarget[]): Record<string, number | null> {
  const result: Record<string, number | null> = {};
  let cumulativeNeed = 0;
  for (const item of items) {
    cumulativeNeed += Math.max(0, item.price - item.saved);
    if (item.saved >= item.price) {
      result[item.id] = 0;
    } else if (monthlyFund <= 0) {
      result[item.id] = null;
    } else {
      result[item.id] = Math.ceil(cumulativeNeed / monthlyFund);
    }
  }
  return result;
}
