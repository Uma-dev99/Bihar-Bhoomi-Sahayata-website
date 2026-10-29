import { articles } from '../content/articles';
import { LANGUAGES } from './languages';

/** Path segment for each page (trailing slash style: /hi/services/). */
export const PAGES = {
  home: '',
  services: 'services/',
  articles: 'articles/',
  about: 'about/',
  contact: 'contact/',
  privacy: 'privacy/',
  disclaimer: 'disclaimer/',
};

export function pagePath(lang, page, slug) {
  const base = `/${lang}/${PAGES[page] ?? ''}`;
  return slug ? `${base}${slug}/` : base;
}

/** Every public URL, used for prerendering and the sitemap. */
export function allPublicPaths() {
  const paths = [];
  for (const lang of LANGUAGES) {
    for (const page of Object.keys(PAGES)) paths.push(pagePath(lang, page));
    for (const article of articles) paths.push(pagePath(lang, 'articles', article.slug));
  }
  return paths;
}

/** Work out which page a pathname refers to. Returns null if unknown. */
export function parsePath(pathname) {
  const [lang, section = '', slug = '', extra] = pathname.split('/').filter(Boolean);
  if (!LANGUAGES.includes(lang) || extra) return null;
  if (section === '') return { lang, page: 'home' };
  const page = Object.keys(PAGES).find((key) => PAGES[key] === `${section}/`);
  if (!page) return null;
  if (slug) {
    if (page !== 'articles' || !articles.some((a) => a.slug === slug)) return null;
    return { lang, page: 'article', slug };
  }
  return { lang, page };
}
