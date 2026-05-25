/** Local calendar date as YYYY-MM-DD (avoids UTC midnight skew for streaks). */
export function localDateStamp(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Normalize API / persisted values to YYYY-MM-DD for streak comparisons. */
export function normalizeDateStamp(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return localDateStamp(d);
}

export function daysBetweenDates(a: string, b: string): number {
  const aNorm = normalizeDateStamp(a) ?? a;
  const bNorm = normalizeDateStamp(b) ?? b;
  const ms = new Date(bNorm).getTime() - new Date(aNorm).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}
