import { LOCALE_CODES } from '../config/languages';

/** '2026-10-29' -> '29 अक्तूबर 2026' / '29 October 2026' (no time-zone shifts). */
export function formatDate(isoDate, lang) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat(LOCALE_CODES[lang] ?? 'en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
