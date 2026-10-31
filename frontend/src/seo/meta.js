import { SITE_URL } from '../config/env';
import { DEFAULT_LANGUAGE, LANGUAGES, LOCALE_CODES } from '../config/languages';
import { pagePath, parsePath } from '../config/routes';
import { getArticle } from '../content/articles';
import { getI18n } from '../i18n';
import { buildStructuredData, SOCIAL_IMAGE } from './structuredData';

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
  let article;
  if (page === 'article') {
    article = getArticle(slug);
    // No site name here: these titles are already as long as search results show.
    title = article[lang].title;
    description = article[lang].description;
    type = 'article';
  } else {
    title = t(`meta.${page}.title`);
    description = t(`meta.${page}.description`);
  }

  const routePage = page === 'article' ? 'articles' : page;
  const urlFor = (l) => `${SITE_URL}${pagePath(l, routePage, slug)}`;
  const canonical = urlFor(lang);
  return {
    lang,
    title,
    description,
    type,
    canonical,
    image: `${SITE_URL}${SOCIAL_IMAGE.path}`,
    imageAlt: t('meta.imageAlt'),
    // Only articles record a real date; the sitemap leaves it out for other pages.
    modified: article?.lastReviewed ?? null,
    structuredData: buildStructuredData({ t, lang, page, slug, article, canonical }),
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

// "<" must not appear inside a script tag, or text such as "</script>" could end it early.
const jsonForScript = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

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
      tags.push(
        `<link rel="alternate" hreflang="${alt.hreflang}" href="${escapeHtml(alt.href)}" />`,
      );
    }
    tags.push(
      `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
      `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
      `<meta property="og:url" content="${escapeHtml(meta.canonical)}" />`,
      `<meta property="og:type" content="${meta.type}" />`,
      `<meta property="og:locale" content="${meta.locale}" />`,
      `<meta property="og:site_name" content="${escapeHtml(meta.siteName)}" />`,
      `<meta property="og:image" content="${escapeHtml(meta.image)}" />`,
      `<meta property="og:image:width" content="${SOCIAL_IMAGE.width}" />`,
      `<meta property="og:image:height" content="${SOCIAL_IMAGE.height}" />`,
      `<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}" />`,
      '<meta name="twitter:card" content="summary_large_image" />',
      `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
      `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
      `<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`,
    );
    if (meta.structuredData) {
      tags.push(
        `<script type="application/ld+json">${jsonForScript(meta.structuredData)}</script>`,
      );
    }
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
  doc.head
    .querySelectorAll(
      'link[rel="alternate"][hreflang], meta[name="robots"], script[type="application/ld+json"]',
    )
    .forEach((el) => el.remove());
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
    setMeta(doc, 'meta[property="og:description"]', {
      property: 'og:description',
      content: meta.description,
    });
    setMeta(doc, 'meta[property="og:url"]', { property: 'og:url', content: meta.canonical });
    setMeta(doc, 'meta[property="og:locale"]', { property: 'og:locale', content: meta.locale });
    setMeta(doc, 'meta[property="og:type"]', { property: 'og:type', content: meta.type });
    setMeta(doc, 'meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: meta.siteName,
    });
    setMeta(doc, 'meta[property="og:image"]', { property: 'og:image', content: meta.image });
    setMeta(doc, 'meta[property="og:image:alt"]', {
      property: 'og:image:alt',
      content: meta.imageAlt,
    });
    setMeta(doc, 'meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    setMeta(doc, 'meta[name="twitter:title"]', { name: 'twitter:title', content: meta.title });
    setMeta(doc, 'meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: meta.description,
    });
    setMeta(doc, 'meta[name="twitter:image"]', { name: 'twitter:image', content: meta.image });
    if (meta.structuredData) {
      const script = doc.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = jsonForScript(meta.structuredData);
      doc.head.appendChild(script);
    }
  } else {
    canonical?.remove();
  }
  if (meta.noindex) setMeta(doc, 'meta[name="robots"]', { name: 'robots', content: 'noindex' });
}
