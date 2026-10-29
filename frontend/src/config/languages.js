export const LANGUAGES = ['hi', 'en'];
export const DEFAULT_LANGUAGE = 'hi';
export const STORAGE_KEY = 'bbs.language';

export const LANGUAGE_LABELS = { hi: 'हिन्दी', en: 'English' };
export const LOCALE_CODES = { hi: 'hi-IN', en: 'en-IN' };

export function isLanguage(value) {
  return LANGUAGES.includes(value);
}

/** Read the saved language, tolerating browsers where storage is blocked. */
export function getStoredLanguage() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isLanguage(value) ? value : null;
  } catch {
    return null;
  }
}

export function storeLanguage(lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Storage unavailable (private mode, blocked): the URL still carries the language.
  }
}

/** /hi/services/ -> /en/services/ (keeps the rest of the path). */
export function switchLanguagePath(pathname, lang) {
  const parts = pathname.split('/');
  if (isLanguage(parts[1])) {
    parts[1] = lang;
    return parts.join('/');
  }
  return `/${lang}/`;
}

export function formatINR(amount, lang) {
  return new Intl.NumberFormat(LOCALE_CODES[lang] ?? 'en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
