import { business } from '../config/business';
import { SITE_URL } from '../config/env';
import { LANGUAGES } from '../config/languages';
import { pagePath } from '../config/routes';
import { services } from '../content/services';
import { getI18n } from '../i18n';

export const SOCIAL_IMAGE = { path: '/og-image.png', width: 1200, height: 630 };

const BUSINESS_ID = `${SITE_URL}/#business`;
const absolute = (path) => `${SITE_URL}${path}`;

/**
 * The business, as search engines should understand it. Only facts shown on the
 * website belong here. Opening hours are left out because schema.org needs the
 * days of the week, which the owner has not confirmed.
 */
function businessNode(t, lang) {
  const otherLang = LANGUAGES.find((l) => l !== lang);
  const fees = services.map((s) => s.fee).filter(Boolean);
  return {
    '@type': 'ProfessionalService',
    '@id': BUSINESS_ID,
    name: t('meta.siteName'),
    alternateName: getI18n(otherLang).t('meta.siteName'),
    description: t('meta.home.description'),
    url: absolute(pagePath(lang, 'home')),
    image: absolute(SOCIAL_IMAGE.path),
    priceRange: `₹${Math.min(...fees)} – ₹${Math.max(...fees)}`,
    knowsLanguage: LANGUAGES,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      postalCode: business.address.pincode,
      addressCountry: business.address.country,
    },
    areaServed: [
      { '@type': 'City', name: 'Gaya' },
      { '@type': 'City', name: 'Bodh Gaya' },
      { '@type': 'State', name: 'Bihar' },
    ],
    employee: {
      '@type': 'Person',
      name: t('about.name'),
      jobTitle: t('about.role'),
      url: absolute(pagePath(lang, 'about')),
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: t('services.title'),
      url: absolute(pagePath(lang, 'services')),
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: t(`services.items.${service.id}.name`),
          description: t(`services.items.${service.id}.scope`),
        },
        ...(service.fee ? { price: service.fee, priceCurrency: 'INR' } : {}),
      })),
    },
    ...(business.phone ? { telephone: business.phone } : {}),
    ...(business.email ? { email: business.email } : {}),
  };
}

function articleNodes(t, lang, slug, article, canonical) {
  const text = article[lang];
  const publisher = { '@type': 'Organization', '@id': BUSINESS_ID, name: t('meta.siteName') };
  return [
    {
      '@type': 'Article',
      headline: text.title,
      description: text.description,
      inLanguage: lang,
      dateModified: article.lastReviewed,
      image: absolute(SOCIAL_IMAGE.path),
      mainEntityOfPage: canonical,
      author: publisher,
      publisher,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { name: t('nav.home'), item: absolute(pagePath(lang, 'home')) },
        { name: t('nav.articles'), item: absolute(pagePath(lang, 'articles')) },
        { name: text.title, item: absolute(pagePath(lang, 'articles', slug)) },
      ].map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, ...crumb })),
    },
  ];
}

/** JSON-LD for a page, or null for pages with nothing to describe (privacy, disclaimer…). */
export function buildStructuredData({ t, lang, page, slug, article, canonical }) {
  let graph = [];
  if (page === 'home') {
    graph = [
      businessNode(t, lang),
      {
        '@type': 'WebSite',
        name: t('meta.siteName'),
        url: canonical,
        inLanguage: lang,
        publisher: { '@id': BUSINESS_ID },
      },
    ];
  } else if (['services', 'about', 'contact'].includes(page)) {
    graph = [businessNode(t, lang)];
  } else if (page === 'article') {
    graph = articleNodes(t, lang, slug, article, canonical);
  }
  return graph.length ? { '@context': 'https://schema.org', '@graph': graph } : null;
}
