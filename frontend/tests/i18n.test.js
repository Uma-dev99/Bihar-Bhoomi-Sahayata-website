import { describe, expect, it } from 'vitest';
import en from '../src/locales/en.json';
import hi from '../src/locales/hi.json';
import { articles } from '../src/content/articles';
import { serviceTypeOptions } from '../src/content/services';

function flatten(value, prefix = '') {
  if (Array.isArray(value)) {
    return value.reduce((acc, item, i) => ({ ...acc, ...flatten(item, `${prefix}[${i}]`) }), {
      [`${prefix}.length`]: value.length,
    });
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce(
      (acc, [k, v]) => ({ ...acc, ...flatten(v, prefix ? `${prefix}.${k}` : k) }),
      {},
    );
  }
  return { [prefix]: value };
}

const flatHi = flatten(hi);
const flatEn = flatten(en);
const DEVANAGARI = /[ऀ-ॿ]/;

describe('translations', () => {
  it('Hindi and English have exactly the same keys and list lengths', () => {
    expect(Object.keys(flatHi).sort()).toEqual(Object.keys(flatEn).sort());
    for (const key of Object.keys(flatHi).filter((k) => k.endsWith('.length'))) {
      expect(flatHi[key], key).toBe(flatEn[key]);
    }
  });

  it('has no empty strings', () => {
    for (const [key, value] of Object.entries({ ...flatHi, ...flatEn })) {
      if (typeof value === 'string') expect(value.trim(), key).not.toBe('');
    }
  });

  it('every Hindi string is actually written in Devanagari', () => {
    for (const [key, value] of Object.entries(flatHi)) {
      if (typeof value === 'string') expect(value, key).toMatch(DEVANAGARI);
    }
  });

  it('uses the same {{placeholders}} in both languages', () => {
    const placeholders = (s) => (s.match(/{{\s*\w+\s*}}/g) ?? []).sort();
    for (const key of Object.keys(flatHi)) {
      if (typeof flatHi[key] === 'string') {
        expect(placeholders(flatHi[key]), key).toEqual(placeholders(flatEn[key]));
      }
    }
  });

  it('has a name for every service option in both languages', () => {
    for (const id of serviceTypeOptions) {
      expect(hi.services.items[id]?.name, id).toBeTruthy();
      expect(en.services.items[id]?.name, id).toBeTruthy();
    }
  });

  it('every article is complete in both languages and lists official sources', () => {
    for (const article of articles) {
      for (const lang of ['hi', 'en']) {
        expect(article[lang].title, `${article.slug} ${lang}`).toBeTruthy();
        expect(article[lang].description).toBeTruthy();
        expect(article[lang].body.length).toBeGreaterThan(0);
      }
      expect(article.hi.body.length).toBe(article.en.body.length);
      expect(article.hi.title).toMatch(DEVANAGARI);
      expect(article.sources.length).toBeGreaterThan(0);
      for (const source of article.sources)
        expect(source.url).toMatch(/^https:\/\/[\w.-]+\.gov\.in\//);
      expect(article.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
