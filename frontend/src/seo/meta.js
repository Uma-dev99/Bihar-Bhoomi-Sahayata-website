import { SITE_URL } from '../config/env';
import { DEFAULT_LANGUAGE, LANGUAGES, LOCALE_CODES } from '../config/languages';
import { pagePath, parsePath } from '../config/routes';
import { getArticle } from '../content/articles';
import { getI18n } from '../i18n';

/**
 * Title, description, canonical URL and hreflang alternates for a pathname.
 * Used in the browser (applyMeta) and at build time (headTags), so search
 * engines and visitors always see the same values.
 */
export function resolveMeta(pathname, fallbackLang = DEFAULT_LANGUAGE) {
  const info = parsePath(pathname);
  if (!info) {
    const t = getI18n(fallbackLang).t;
    return {
      lang: fallbackLang,
      title: t('meta.notFound.title'),
      description: t('meta.notFound.description'),
      canonical: null,
      alternates: [],
      noindex: true,
    };
  }

  const { lang, page, slug } = info;
  const t = getI18n(lang).t;
  let title;
  let description;
  let type = 'website';
  if (page === 'article') {
    const article = getArticle(slug)[lang];
    title = `${article.title} – ${t('meta.siteName')}`;
    description = article.description;
    type = 'article';
  } else {
    title = t(`meta.${page}.title`);
    description = t(`meta.${page}.description`);
  }

  const routePage = page === 'article' ? 'articles' : page;
  const urlFor = (l) => `${SITE_URL}${pagePath(l, routePage, slug)}`;
  return {
    lang,
    title,
    description,
    type,
    canonical: urlFor(lang),
    alternates: [
      ...LANGUAGES.map((l) => ({ hreflang: l, href: urlFor(l) })),
      { hreflang: 'x-default', href: urlFor(DEFAULT_LANGUAGE) },
    ],
    locale: LOCALE_CODES[lang].replace('-', '_'),
    siteName: t('meta.siteName'),
    noindex: false,
  };
}

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** HTML for the <head>, written into each prerendered page. */
export function headTags(meta) {
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
  ];
  if (meta.noindex) tags.push('<meta name="robots" content="noindex" />');
  if (meta.canonical) {
    tags.push(`<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`);
    for (const alt of meta.alternates) {
      tags.push(`<link rel="alternate" hreflang="${alt.hreflang}" href="${escapeHtml(alt.href)}" />`);
    }
    tags.push(
      `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
      `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
      `<meta property="og:url" content="${escapeHtml(meta.canonical)}" />`,
      `<meta property="og:type" content="${meta.type}" />`,
      `<meta property="og:locale" content="${meta.locale}" />`,
      `<meta property="og:site_name" content="${escapeHtml(meta.siteName)}" />`,
    );
  }
  return tags.join('\n    ');
}

function setMeta(doc, selector, attrs) {
  let el = doc.head.querySelector(selector);
  if (!el) {
    el = doc.createElement(selector.startsWith('link') ? 'link' : 'meta');
    doc.head.appendChild(el);
  }
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
}

/** Update the live document after client-side navigation. */
export function applyMeta(meta, doc = document) {
  doc.title = meta.title;
  doc.documentElement.lang = meta.lang;
  setMeta(doc, 'meta[name="description"]', { name: 'description', content: meta.description });
  doc.head.querySelectorAll('link[rel="alternate"][hreflang], meta[name="robots"]').forEach((el) => el.remove());
  const canonical = doc.head.querySelector('link[rel="canonical"]');
  if (meta.canonical) {
    setMeta(doc, 'link[rel="canonical"]', { rel: 'canonical', href: meta.canonical });
    for (const alt of meta.alternates) {
      const link = doc.createElement('link');
      link.rel = 'alternate';
      link.hreflang = alt.hreflang;
      link.href = alt.href;
      doc.head.appendChild(link);
    }
    setMeta(doc, 'meta[property="og:title"]', { property: 'og:title', content: meta.title });
    setMeta(doc, 'meta[property="og:description"]', { property: 'og:description', content: meta.description });
    setMeta(doc, 'meta[property="og:url"]', { property: 'og:url', content: meta.canonical });
    setMeta(doc, 'meta[property="og:locale"]', { property: 'og:locale', content: meta.locale });
  } else {
    canonical?.remove();
  }
  if (meta.noindex) setMeta(doc, 'meta[name="robots"]', { name: 'robots', content: 'noindex' });
}
