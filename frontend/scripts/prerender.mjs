/**
 * Build step 3 of 3 (see "build" in package.json):
 *  - renders every public page to dist/<lang>/<page>/index.html
 *  - writes dist/index.html (for "/") and dist/404.html
 *  - writes dist/sitemap.xml and dist/robots.txt using VITE_SITE_URL
 *  - writes dist/_headers (security headers for Cloudflare Pages)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf-8');
const { render, allPublicPaths, API_BASE_URL, SITE_URL } = await import(
  pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href
);

if (/localhost|127\.0\.0\.1/.test(SITE_URL)) {
  console.warn(`WARNING: VITE_SITE_URL is ${SITE_URL}. Set the real domain for production builds.`);
}

function page(url) {
  const { html, head, lang } = render(url);
  return template
    .replace('<html lang="hi">', `<html lang="${lang}">`)
    .replace('<!--app-head-->', head)
    .replace('<!--app-html-->', html);
}

function write(relativeFile, contents) {
  const file = path.join(dist, relativeFile);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
}

const paths = allPublicPaths();
for (const url of paths) {
  write(path.join(url, 'index.html'), page(url));
}
// "/" shows the Hindi home page (canonical /hi/) and then redirects in the
// browser to the visitor's saved language.
write('index.html', page('/hi/'));
write('404.html', page('/hi/page-not-found/'));

const today = new Date().toISOString().slice(0, 10);
const byPage = new Map();
for (const url of paths) {
  const key = url.replace(/^\/(hi|en)\//, '/');
  byPage.set(key, [...(byPage.get(key) ?? []), url]);
}
const entries = paths.map((url) => {
  const alternates = byPage
    .get(url.replace(/^\/(hi|en)\//, '/'))
    .map(
      (alt) =>
        `    <xhtml:link rel="alternate" hreflang="${alt.split('/')[1]}" href="${SITE_URL}${alt}"/>`,
    )
    .join('\n');
  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${url.replace(/^\/en\//, '/hi/')}"/>`;
  return `  <url>\n    <loc>${SITE_URL}${url}</loc>\n    <lastmod>${today}</lastmod>\n${alternates}\n${xDefault}\n  </url>`;
});
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`,
);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

// Security headers for Cloudflare Pages. The API origin comes from
// VITE_API_BASE_URL so the browser may send the form only to our backend.
const apiOrigin = new URL(API_BASE_URL).origin;
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  `connect-src 'self' ${apiOrigin}`,
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');
write(
  '_headers',
  `/*\n  Content-Security-Policy: ${csp}\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`,
);

console.log(
  `Prerendered ${paths.length} pages plus /, 404, sitemap.xml and robots.txt for ${SITE_URL}`,
);
