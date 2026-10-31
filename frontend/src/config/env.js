// Public build-time settings. Only VITE_ variables reach the browser,
// and every visitor can read them, so they must never contain secrets.
const env = import.meta.env ?? {};

// The local fallbacks exist only on the dev server, so they never reach a production bundle.
export const API_BASE_URL = (
  env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : '')
).replace(/\/+$/, '');
export const SITE_URL = (
  env.VITE_SITE_URL || (import.meta.env.DEV ? 'http://localhost:5173' : '')
).replace(/\/+$/, '');
