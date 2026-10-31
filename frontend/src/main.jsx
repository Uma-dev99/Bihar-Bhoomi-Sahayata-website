// Site-wide styles come first so that page and component styles, imported by
// the files inside App, can build on them.
import './styles/global.css';
import './styles/shared/button.css';
import './styles/shared/page.css';
import './styles/shared/notice.css';
import './styles/shared/card-grid.css';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';

const container = document.getElementById('root');
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Language pages are prerendered at build time, so React attaches to the
// existing HTML. "/" (which redirects) and the dev server render from scratch.
const isLanguagePage = /^\/(hi|en)(\/|$)/.test(window.location.pathname);
if (container.hasChildNodes() && isLanguagePage) {
  hydrateRoot(container, app);
} else {
  container.textContent = '';
  createRoot(container).render(app);
}
