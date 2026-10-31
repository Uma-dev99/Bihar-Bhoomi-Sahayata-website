/**
 * Used only at build time by scripts/prerender.mjs. Renders each public page
 * to HTML so search engines and slow phones get real content immediately.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';
import { API_BASE_URL, SITE_URL } from './config/env';
import { allPublicPaths } from './config/routes';
import { headTags, resolveMeta } from './seo/meta';

export { allPublicPaths, API_BASE_URL, SITE_URL };

export function render(url) {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
  const meta = resolveMeta(url);
  return { html, head: headTags(meta), lang: meta.lang, modified: meta.modified };
}
