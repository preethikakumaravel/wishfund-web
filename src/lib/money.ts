// Money is stored as integer minor units (e.g. paise). These helpers convert
// to and from what the user types and sees.

/** Parse "1,299.50" -> 129950. Returns null for empty or invalid input. */
export function parseMoney(input: string): number | null {
  const cleaned = input.replace(/[,\s]/g, '').replace(/^[^\d.]+/, '');
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned) && !/^\.\d{1,2}$/.test(cleaned)) {
    return null;
  }
  return Math.round(parseFloat(cleaned) * 100);
}

export function formatMoney(minor: number, symbol: string): string {
  const sign = minor < 0 ? '-' : '';
  const abs = Math.abs(minor);
  const whole = Math.floor(abs / 100).toLocaleString('en-IN');
  const frac = abs % 100;
  return `${sign}${symbol}${whole}${frac ? '.' + String(frac).padStart(2, '0') : ''}`;
}

/** Value for pre-filling an input: 129950 -> "1299.5". */
export function toInputValue(minor: number): string {
  return String(minor / 100);
}

export function monthLabel(isoMonth: string): string {
  const [y, m] = isoMonth.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export function currentIsoMonth(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function hostOf(url: string): string {
  const match = url.match(/^[a-z]+:\/\/(?:www\.)?([^/?#]+)/i);
  return match ? match[1] : url;
}

/** Add https:// when the user pastes "amazon.in/..." without a scheme. */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
