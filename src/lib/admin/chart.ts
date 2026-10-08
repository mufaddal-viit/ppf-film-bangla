/** Pure helpers for the dashboard trend chart. No server-only imports, so they are easy to test. */

export type TrendPoint = { key: string; label: string; value: number };

/** One point per calendar day in the business timezone, oldest first, with 0 for days that have no entry. */
export function fillDays(
  counts: Record<string, number>,
  days: number,
  timeZone: string,
  now: Date = new Date(),
): TrendPoint[] {
  const key = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const label = new Intl.DateTimeFormat('en-GB', { timeZone, day: 'numeric', month: 'short' });
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(now.getTime() - (days - 1 - index) * 86_400_000);
    const day = key.format(date);
    return { key: day, label: label.format(date), value: counts[day] ?? 0 };
  });
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * SVG paths for a smooth line and the filled area under it, in a `width` x `height` box.
 * Control points sit level with their end points, so the curve never dips below zero between days.
 */
export function trendPaths(values: number[], width: number, height: number): { line: string; area: string } {
  if (values.length < 2) return { line: '', area: '' };
  const max = Math.max(1, ...values);
  const headroom = height * 0.12;
  const step = width / (values.length - 1);
  const points = values.map((value, index) => ({
    x: round(index * step),
    y: round(height - (value / max) * (height - headroom)),
  }));
  const line = points
    .map((point, index) => {
      if (index === 0) return `M${point.x},${point.y}`;
      const previous = points[index - 1]!;
      const middle = round((previous.x + point.x) / 2);
      return `C${middle},${previous.y} ${middle},${point.y} ${point.x},${point.y}`;
    })
    .join(' ');
  return { line, area: `${line} L${width},${height} L0,${height} Z` };
}
