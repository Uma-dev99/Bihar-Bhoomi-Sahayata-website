import { describe, expect, it } from 'vitest';
import { allPublicPaths, parsePath } from '../src/config/routes';
import { headTags, resolveMeta } from '../src/seo/meta';

describe('SEO metadata', () => {
  it('gives every public page a unique title and description per language', () => {
    const paths = allPublicPaths();
    const titles = paths.map((p) => resolveMeta(p).title);
    const descriptions = paths.map((p) => resolveMeta(p).description);
    expect(new Set(titles).size).toBe(paths.length);
    expect(new Set(descriptions).size).toBe(paths.length);
  });

  it('has reciprocal hreflang links and a self canonical', () => {
    for (const path of allPublicPaths()) {
      const meta = resolveMeta(path);
      expect(meta.canonical.endsWith(path)).toBe(true);
      const hrefs = Object.fromEntries(meta.alternates.map((a) => [a.hreflang, a.href]));
      expect(Object.keys(hrefs).sort()).toEqual(['en', 'hi', 'x-default']);
      const other = path.startsWith('/hi/')
        ? path.replace('/hi/', '/en/')
        : path.replace('/en/', '/hi/');
      const otherMeta = resolveMeta(other);
      expect(hrefs[otherMeta.lang]).toBe(otherMeta.canonical);
      expect(otherMeta.alternates.find((a) => a.hreflang === meta.lang).href).toBe(meta.canonical);
    }
  });

  it('marks unknown pages noindex without a canonical', () => {
    const meta = resolveMeta('/en/nope/');
    expect(meta.noindex).toBe(true);
    expect(headTags(meta)).toContain('noindex');
    expect(headTags(meta)).not.toContain('canonical');
  });

  it('escapes HTML in head tags', () => {
    const tags = headTags({ ...resolveMeta('/en/'), title: '<script>"x"</script>' });
    expect(tags).not.toContain('<script>');
  });

  it('keeps titles short enough for search results', () => {
    for (const path of allPublicPaths()) {
      expect(resolveMeta(path).title.length).toBeLessThanOrEqual(70);
    }
  });

  it('adds a social image and Twitter card to every public page', () => {
    for (const path of allPublicPaths()) {
      const tags = headTags(resolveMeta(path));
      expect(tags).toContain('property="og:image"');
      expect(tags).toContain('name="twitter:card"');
    }
  });

  it('describes the business to search engines without a phone number', () => {
    const graph = resolveMeta('/en/').structuredData['@graph'];
    const node = graph.find((n) => n['@type'] === 'ProfessionalService');
    expect(node.address.addressLocality).toBe('Gaya');
    expect(node.address.streetAddress).toContain('H.No 88');
    expect(node.address.postalCode).toBe('823001');
    expect(node.areaServed.map((a) => a.name)).toEqual(['Gaya', 'Bodh Gaya', 'Bihar']);
    expect(node).not.toHaveProperty('telephone');
  });

  it('marks articles up with their real date and a breadcrumb', () => {
    const meta = resolveMeta('/hi/articles/mutation-application-rejected/');
    const types = meta.structuredData['@graph'].map((n) => n['@type']);
    expect(types).toEqual(['Article', 'BreadcrumbList']);
    expect(meta.modified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(resolveMeta('/hi/').modified).toBeNull();
  });

  it('leaves structured data off pages with nothing to describe', () => {
    expect(resolveMeta('/en/privacy/').structuredData).toBeNull();
    expect(headTags(resolveMeta('/en/privacy/'))).not.toContain('ld+json');
  });

  it('parses paths', () => {
    expect(parsePath('/hi/')).toEqual({ lang: 'hi', page: 'home' });
    expect(parsePath('/en/services/')).toEqual({ lang: 'en', page: 'services' });
    expect(parsePath('/en/articles/mutation-application-rejected/')).toEqual({
      lang: 'en',
      page: 'article',
      slug: 'mutation-application-rejected',
    });
    expect(parsePath('/en/services/extra/')).toBeNull();
    expect(parsePath('/de/')).toBeNull();
  });
});
