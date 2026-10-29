// Public build-time settings. Only VITE_ variables reach the browser,
// and every visitor can read them, so they must never contain secrets.
const env = import.meta.env ?? {};

export const API_BASE_URL = (env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(
  /\/+$/,
  '',
);
export const SITE_URL = (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/+$/, '');
