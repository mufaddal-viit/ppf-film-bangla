/** Pure, locale-aware formatting helpers. No config imports: callers pass what they need. */
import type { Weekday } from '@/lib/config/schema';

const WEEKDAYS: Weekday[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** BCP 47 tag for number and date formatting. Latin digits are the UAE norm in both languages. */
function intlLocale(locale: string, region: string): string {
  return `${locale}-${region}-u-nu-latn`;
}

export function formatPrice(amount: number, currency: string, locale: string, region: string): string {
  return new Intl.NumberFormat(intlLocale(locale, region), {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number, locale: string, region: string): string {
  return new Intl.NumberFormat(intlLocale(locale, region)).format(value);
}

export function formatDate(isoDate: string, locale: string, region: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale, region), { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
}

export function weekdayName(day: Weekday, locale: string, region: string): string {
  // 2024-01-01 was a Monday.
  const date = new Date(Date.UTC(2024, 0, 1 + WEEKDAYS.indexOf(day)));
  return new Intl.DateTimeFormat(intlLocale(locale, region), { weekday: 'long', timeZone: 'UTC' }).format(date);
}

/** Groups consecutive weekdays: [Mon, Tue, Wed, Fri] -> [[Mon, Wed], [Fri, Fri]]. */
export function groupConsecutiveDays(days: readonly Weekday[]): Array<[Weekday, Weekday]> {
  const sorted = [...new Set(days)].sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b));
  const groups: Array<[Weekday, Weekday]> = [];
  for (const day of sorted) {
    const last = groups.at(-1);
    if (last && WEEKDAYS.indexOf(day) === WEEKDAYS.indexOf(last[1]) + 1) last[1] = day;
    else groups.push([day, day]);
  }
  return groups;
}

export function formatList(items: readonly string[], locale: string, region: string): string {
  return new Intl.ListFormat(intlLocale(locale, region), { style: 'long', type: 'conjunction' }).format(items);
}

/**
 * Replaces {token} placeholders. Throws on unknown or missing tokens so content
 * errors surface at build time instead of shipping "{priceFrom}" to the page.
 */
export function fillTokens(template: string, tokens: Record<string, string | null>, where: string): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = tokens[name];
    if (value === undefined) throw new Error(`Unknown token {${name}} in ${where}`);
    if (value === null) throw new Error(`Token {${name}} in ${where} has no value (check config/catalog.ts)`);
    return value;
  });
}
