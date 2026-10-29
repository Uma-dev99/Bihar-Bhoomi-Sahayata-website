import i18next from 'i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import { DEFAULT_LANGUAGE, LANGUAGES } from './config/languages';

export const resources = {
  hi: { translation: hi },
  en: { translation: en },
};

/**
 * One i18next instance per language. The language comes from the URL
 * (/hi/... or /en/...), and the page layout hands the matching instance to
 * React. Switching language is just a client-side navigation - no reload,
 * and it renders identically on the server during prerendering.
 */
function createInstance(lng) {
  const instance = i18next.createInstance();
  instance.init({
    lng,
    resources,
    supportedLngs: LANGUAGES,
    // Safety net only: tests check that both files contain every key.
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false }, // React already escapes output
    returnNull: false,
    initAsync: false, // resources are bundled, so initialise synchronously
    initImmediate: false, // same option under its older name
    react: { useSuspense: false },
  });
  return instance;
}

export const i18nInstances = Object.fromEntries(LANGUAGES.map((lng) => [lng, createInstance(lng)]));

export function getI18n(lang) {
  return i18nInstances[lang] ?? i18nInstances[DEFAULT_LANGUAGE];
}
