# Bihar Bhoomi Sahayata

Bilingual (Hindi/English) website for an independent land-record consultancy in Gaya, Bihar.
Visitors read about the services and send an enquiry; the owner manages enquiries in a
password-protected Django admin.

> **Status:** version 1 code complete. Before going live, work through
> [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md) — several details (phone number,
> working hours, photo, article review, business-name check) must come from the owner.

## How it fits together

```
 Visitor's browser
   │  static pages (prerendered HTML, Hindi + English)
   ▼
 Cloudflare Pages  ──────── frontend/   React + Vite + i18next
   │  POST /api/enquiries/  (JSON, create-only, rate-limited)
   ▼
 Render (Gunicorn) ──────── backend/    Django + Django REST Framework
   │  SQL over TLS (session pooler)          + Django admin for the owner
   ▼
 Supabase PostgreSQL        schema owned by Django migrations

 GitHub (code, pull requests)  ──►  Jenkins (lint → test → build → staging → approve → production)
```

* React never talks to the database. Django is the only API, and the only thing the public
  can do is **create** an enquiry.
* Every public page is prerendered to real HTML at build time, so search engines and slow
  phones see content immediately; React then takes over for language switching and the form.

## Repository layout

| Path | What it is |
| --- | --- |
| `backend/` | Django project (`config/`) and the `enquiries` app: model, API, admin, tests |
| `frontend/` | React app: pages, components, `src/locales/hi.json` + `en.json`, tests |
| `frontend/src/content/` | Services and fees, articles, districts — edit content here |
| `frontend/src/config/business.js` | Phone, WhatsApp, hours, photo (all `null` until confirmed) |
| `Jenkinsfile` | CI/CD pipeline |
| `render.yaml` | Render blueprint for the staging and production API |
| `scripts/` | Health check and database backup scripts |
| `docs/` | Development, deployment, Jenkins, operations and launch guides |

## Quick start (local)

Requirements: Python 3.12+, Node.js 22 (or 20.19+), Git. Docker is optional (for local PostgreSQL).

```bash
# Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt pytest pytest-django ruff
cp .env.example .env                                     # DEBUG=True, SQLite by default
python manage.py migrate
python manage.py createcachetable
python manage.py createsuperuser                          # your admin login
python manage.py runserver                                # http://127.0.0.1:8000/manage-enquiries/

# Frontend (second terminal)
cd frontend
npm install
cp .env.example .env
npm run dev                                               # http://localhost:5173/
```

Tests: `pytest` in `backend/`, `npm test` in `frontend/`. Full details: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Documentation

* [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) — local setup, tests, editing content and translations, Git workflow
* [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — why things are built the way they are
* [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Supabase, Render, Cloudflare Pages, migrations, rollback, costs
* [docs/JENKINS.md](docs/JENKINS.md) — setting up and securing Jenkins
* [docs/OPERATIONS.md](docs/OPERATIONS.md) — using the admin, backups, restore, retention, incidents
* [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md) — everything to confirm before going public

## Important

This is an independent consultancy website. It must never present itself as a Government of
Bihar service, and it must not publish invented contact details, credentials, fees for
government services, deadlines or legal rules.
