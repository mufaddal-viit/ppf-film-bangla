/** Date formatting for the admin panel, in the business timezone from config/site.ts. */
export function adminDates(timeZone: string) {
  const dateTime = new Intl.DateTimeFormat('en-GB', { timeZone, dateStyle: 'medium', timeStyle: 'short' });
  const date = new Intl.DateTimeFormat('en-GB', { timeZone, dateStyle: 'medium' });
  // Follow-up dates are stored at midday UTC and mean a calendar day, not a moment.
  const day = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', dateStyle: 'medium' });
  return {
    dateTime: (value: Date) => dateTime.format(value),
    date: (value: Date) => date.format(value),
    day: (value: Date) => day.format(value),
  };
}

/** "Sara Al Mansoori" -> "SA", for avatar circles. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? '') + (words.length > 1 ? (words.at(-1)?.[0] ?? '') : '')).toUpperCase() || '?';
}

/** "apex-clear-ppf" -> "Apex clear ppf", for slugs that have no display name to hand. */
export function humanize(slug: string): string {
  const text = slug.replaceAll('-', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
