# Development guide

## 1. First-time setup

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate            # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt pytest pytest-django ruff pip-tools
cp .env.example .env
```

`backend/.env` is read automatically. With `DJANGO_DEBUG=True` and an empty `DATABASE_URL`,
Django uses a local SQLite file so you can start immediately.

To develop against PostgreSQL (recommended before every release):

```bash
docker compose up -d          # from the repository root; starts PostgreSQL 16 on localhost:5432
# in backend/.env:
DATABASE_URL=postgres://bbs:bbs@localhost:5432/bbs
```

Then:

```bash
python manage.py migrate
python manage.py createcachetable      # table used for shared rate limiting
python manage.py createsuperuser
python manage.py runserver
```

Admin: http://127.0.0.1:8000/manage-enquiries/ (path set by `DJANGO_ADMIN_PATH`).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173/ — you will be sent to `/hi/` (or your saved language).

## 2. Pin dependencies (do this once, then whenever you upgrade)

This project was written in an environment without package-registry access, so the exact
versions could not be installed and recorded there. On your machine:

```bash
# backend
cd backend && source .venv/bin/activate
pip-compile requirements.in -o requirements.txt     # writes exact versions of every package
pip install -r requirements.txt
pytest                                               # must pass before you commit

# frontend
cd frontend
npm install                                          # creates package-lock.json
npm test && npm run build
```

Commit `backend/requirements.txt` and `frontend/package-lock.json`. Jenkins installs exactly
these versions (`npm ci`), so production runs what you tested.

**First commit only:** run the formatters once so the CI format checks pass:

```bash
cd backend && ruff format . && ruff check --fix .
cd ../frontend && npm run format && npm run lint
```

## 3. Running tests

| Where | Command | What it covers |
| --- | --- | --- |
| `backend/` | `pytest` | API validation, create-only access, rate limit, honeypot, admin login, logging without personal data, health check, retention command |
| `backend/` | `ruff check . && ruff format --check .` | Lint and formatting |
| `frontend/` | `npm test` | Hindi default, language switching and persistence, routing, translation completeness, form validation/loading/success/error states, API failure handling, keyboard access, SEO tags |
| `frontend/` | `npm run lint` / `npm run format:check` | ESLint / Prettier |
| `frontend/` | `npm run build` | Production build + prerender of every page |

Run the backend tests against PostgreSQL before deploying (set `DATABASE_URL` as above).
SQLite is convenient but does not behave identically.

Mobile layout: open the dev server in your browser's device toolbar at 360–390 px wide and
check Home, Services and Contact in both languages. There should be no sideways scrolling.

## 4. Editing content

| To change | Edit |
| --- | --- |
| Any text on the site | `frontend/src/locales/hi.json` **and** `en.json` (same key in both) |
| A fee | `frontend/src/content/services.js` (`fee: 599`, or `null` for "quote") |
| Phone, WhatsApp, email, hours, photo | `frontend/src/config/business.js` |
| Articles | `frontend/src/content/articles.js` |
| Privacy notice | `privacy.sections` in both locale files, and `PRIVACY_LAST_UPDATED` in `src/pages/Privacy.jsx` |

The translation test fails if a key exists in one language but not the other, or if a Hindi
string contains no Devanagari — so you cannot accidentally ship a half-translated page.

Adding a **new service type** also needs the backend: add it to `ServiceType` in
`backend/enquiries/choices.py`, run `python manage.py makemigrations`, and add its texts
under `services.items.<id>` in both locale files.

## 5. Git workflow

* `main` is protected on GitHub: no direct pushes, pull request required, Jenkins status check
  must pass, at least the owner's review.
* Work on a branch: `git switch -c feature/short-name` (or `fix/...`, `content/...`).
* Push and open a pull request. Jenkins lints, tests and builds it.
* Merge when green. Jenkins then deploys to staging and waits for your approval before production.
* Tag releases after a production deploy: `git tag -a v1.0.0 -m "First public release" && git push --tags`.

Never commit `.env` files, database dumps or real customer data. `.gitignore` blocks the
common cases, but check `git status` before committing.

## 6. Updating dependencies

Monthly, or when a security advisory appears:

```bash
cd backend && pip-compile --upgrade requirements.in -o requirements.txt && pip install -r requirements.txt && pytest
cd frontend && npm outdated && npm update && npm test && npm run build && npm audit
```

Stay on Django 5.2 (LTS, supported until April 2028) unless you deliberately plan an upgrade.
