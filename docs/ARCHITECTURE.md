# Architecture decisions

Short explanations of the important choices, so future changes keep the same reasoning.

## Django is the only API; React never touches the database
The browser can be inspected by anyone, so anything in the frontend is public. Database
credentials therefore live only in Django's environment on Render. React talks to one
endpoint, `POST /api/enquiries/`, and Django decides what is allowed. Supabase's own
client libraries and API keys are not used at all.

## The public API is create-only
`EnquiryCreateView` is a `CreateAPIView` with a `CreateOnly` permission. GET, PUT, PATCH and
DELETE are refused, and there is no detail URL. Responses never echo the submitted data. The
owner reads enquiries only through the Django admin, which requires a login.

## Errors are codes, translated in the browser
The API returns `{"ok": false, "error": "validation_error", "fields": {"phone": [{"code": "invalid", ...}]}}`.
The frontend maps codes to Hindi or English messages, so the server never needs to know the
visitor's language and both languages stay consistent.

## Spam and abuse
* **Rate limits** per IP: 3 per minute and 10 per day by default (env-configurable). Counters
  live in a database cache table so every Gunicorn worker shares them. `DRF_NUM_PROXIES=1`
  on Render makes Django use the visitor's IP, not Render's proxy.
* **Honeypot:** a hidden `website` field. If filled, the API replies "success" and saves nothing.
* **Server-side validation** of every field; the frontend checks are only for convenience.
* **Request size cap:** 100 KB.
* **No CAPTCHA yet.** It adds friction for elderly or low-bandwidth visitors. If spam gets
  through, add Cloudflare Turnstile (free) — a contained change to the form and serializer.

## Personal data
The model stores only what is needed to call back: name, phone, language, service, optional
district, message, status, date. No documents, Aadhaar, bank details or passwords. Logs record
IDs and categories, never names, phones or message text (a test enforces this). Deletion of
old closed enquiries is a deliberate manual command (`purge_old_enquiries`), not an automatic job.

## One settings file, driven by environment variables
Separate dev/prod settings files tend to drift. Instead `config/settings.py` reads environment
variables with **safe defaults**: DEBUG is off unless set, production refuses to start without
`DJANGO_SECRET_KEY` and `DATABASE_URL`, and HTTPS protections switch on whenever DEBUG is off.

## Bilingual URLs: `/hi/...` and `/en/...`
Each language has its own URL so search engines can index both, each page declares the other
with `hreflang`, and links can be shared in a specific language. Switching language is a
client-side navigation to the same page in the other language — no reload. The visitor's
choice is saved in `localStorage`; `/` sends them to it (Hindi by default). A first-visit
banner offers both languages until one is chosen.

Each language has its own i18next instance, selected by the URL. This keeps prerendering
deterministic: the HTML for `/en/services/` is always English.

## Prerendering instead of a server-rendered framework
Client-only React gives search engines an empty page at first. Rather than adopting a full SSR
framework, the build renders every known page to HTML once (`scripts/prerender.mjs`) and React
hydrates it in the browser. The result is plain static files — free to host on Cloudflare
Pages, fast on slow connections, and no Node server to run. The same build writes
`sitemap.xml` (with hreflang alternates), `robots.txt` and security headers (`_headers`).

## Content lives in code files, not a CMS
Fees (`content/services.js`), articles (`content/articles.js`) and contact details
(`config/business.js`) are simple data files. Changing them means a commit and a deploy, which
gives free review and history without running a CMS. If the owner later needs to edit content
without Git, the natural next step is moving articles/services into Django models shown in the
admin, served through read-only API endpoints.

## Hosting
* **Cloudflare Pages** for static files: free tier, global CDN, custom headers.
* **Render** for Django: simple Python hosting with deploy hooks and rollbacks.
* **Supabase** for PostgreSQL: managed Postgres with a free tier; connect through the
  **session pooler** because Supabase's direct connection uses IPv6, which Render does not
  provide. Session mode behaves like a normal Postgres connection, which Django expects.
* **Jenkins** on a machine you control (see docs/JENKINS.md).

## Future expansion (not built in v1)
Customer accounts, document storage, payments or a CMS would each add security and legal
obligations (especially for storing land documents). The current structure — Django owning
the data, a small public API, a static frontend — allows adding them as new Django apps and
endpoints without reworking what exists.
