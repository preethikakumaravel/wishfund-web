import { describe, expect, it } from 'vitest';
import { allocateByPriority, monthsToFund, PRESETS, splitIncome, splitTotal } from '../budget';
import { formatMoney, normalizeUrl, parseMoney } from '../money';

describe('splitIncome', () => {
  it('splits by percentage', () => {
    const parts = splitIncome(100_000_00, { bills: 40, spending: 25, savings: 20, wishlist: 15 });
    expect(parts).toEqual({ bills: 40_000_00, spending: 25_000_00, savings: 20_000_00, wishlist: 15_000_00 });
  });

  it('always sums to the income, rounding remainder into savings', () => {
    const income = 33_333_33;
    const parts = splitIncome(income, { bills: 33, spending: 33, savings: 17, wishlist: 17 });
    expect(parts.bills + parts.spending + parts.savings + parts.wishlist).toBe(income);
  });

  it('rejects splits that do not total 100', () => {
    expect(() => splitIncome(1000, { bills: 50, spending: 50, savings: 10, wishlist: 0 })).toThrow();
  });

  it('ships only presets that total 100', () => {
    for (const p of PRESETS) expect(splitTotal(p.split)).toBe(100);
  });
});

describe('allocateByPriority', () => {
  const items = [
    { id: 'a', price: 5000, saved: 1000 },
    { id: 'b', price: 3000, saved: 0 },
    { id: 'c', price: 2000, saved: 0 },
  ];

  it('fills the top item before the next', () => {
    expect(allocateByPriority(3000, items)).toEqual({ allocations: { a: 3000 }, leftover: 0 });
  });

  it('cascades the remainder down the list', () => {
    expect(allocateByPriority(6000, items)).toEqual({ allocations: { a: 4000, b: 2000 }, leftover: 0 });
  });

  it('returns leftover when everything is funded', () => {
    expect(allocateByPriority(10_000, items)).toEqual({
      allocations: { a: 4000, b: 3000, c: 2000 },
      leftover: 1000,
    });
  });

  it('skips already funded items', () => {
    const result = allocateByPriority(500, [{ id: 'x', price: 100, saved: 100 }, ...items]);
    expect(result.allocations).toEqual({ a: 500 });
  });
});

describe('monthsToFund', () => {
  it('estimates months in priority order', () => {
    const items = [
      { id: 'a', price: 5000, saved: 1000 }, // needs 4000
      { id: 'b', price: 3000, saved: 0 }, // cumulative 7000
      { id: 'c', price: 100, saved: 100 }, // funded
    ];
    expect(monthsToFund(2000, items)).toEqual({ a: 2, b: 4, c: 0 });
  });

  it('returns null when there is no fund', () => {
    expect(monthsToFund(0, [{ id: 'a', price: 10, saved: 0 }])).toEqual({ a: null });
  });
});

describe('money helpers', () => {
  it('parses user input to minor units', () => {
    expect(parseMoney('1,299.50')).toBe(129950);
    expect(parseMoney('₹ 499')).toBe(49900);
    expect(parseMoney('.5')).toBe(50);
    expect(parseMoney('')).toBeNull();
    expect(parseMoney('abc')).toBeNull();
    expect(parseMoney('1.234')).toBeNull();
  });

  it('formats minor units', () => {
    expect(formatMoney(129950, '₹')).toBe('₹1,299.50');
    expect(formatMoney(49900, '$')).toBe('$499');
  });

  it('adds a scheme to bare links', () => {
    expect(normalizeUrl('amazon.in/dp/123')).toBe('https://amazon.in/dp/123');
    expect(normalizeUrl('https://flipkart.com/x')).toBe('https://flipkart.com/x');
    expect(normalizeUrl('  ')).toBe('');
  });
});
