# Deployment guide

Order of work: **Supabase → Render → Cloudflare Pages → Jenkins → domain**. Do it all for
staging first, test, then repeat for production.

Hostnames used below are examples (`bbs-api.onrender.com`, `bbs-site.pages.dev`). Replace
them everywhere — `render.yaml`, `Jenkinsfile`, environment variables — with your real ones.

---

## 1. Costs and free-tier limits (checked October 2026 — re-check before relying on them)

| Item | Option | Approx. cost | Limits to know |
| --- | --- | --- | --- |
| Domain (e.g. `.in`) | any registrar | ~₹700–1,200 / year | Check the business name first |
| Frontend | Cloudflare Pages free | ₹0 | Build-count limits per month; plenty for this site |
| API staging | Render free | ₹0 | Sleeps after 15 min idle, ~1 min to wake; 750 free hours/month per workspace; ephemeral disk; outbound SMTP blocked; Render says free instances are not for production |
| API production | Render Starter | $7/month (~₹600) | 512 MB RAM, does not sleep. Hobby workspace includes 5 GB bandwidth/month after Render's 1 Aug 2026 plan change; overage $0.15/GB |
| Database | Supabase free (×2 projects: staging + production) | ₹0 | 500 MB per project; projects **pause after 1 week of inactivity**; no backups you can rely on — use our own backups (docs/OPERATIONS.md) |
| Database (later) | Supabase Pro | $25/month | Daily backups, no pausing; consider once income justifies it |
| Jenkins | your own computer | ₹0 (electricity) | Needs to be on when you deploy |

**Budget fit (first year):** domain (~₹1,000) + Render Starter for production (~₹7,200/year)
≈ ₹8,000–8,500, inside the ₹5,000–10,000 budget. To stay near ₹1,000, run production on
Render free initially and accept the ~1-minute wake-up (the form already tells visitors to
wait), then upgrade when enquiries start arriving.

Do not use Render's free PostgreSQL: it is deleted 30 days after creation.

---

## 2. Supabase (database)

1. Create an account at supabase.com. Create two projects: `bbs-staging` and `bbs-production`.
   Region: **Mumbai (ap-south-1)** if offered — closest to your users and to Render Singapore.
2. Use a long random database password (save it in a password manager, nowhere else).
3. Project → **Connect** → choose the **Session pooler** connection string (port 5432,
   host like `aws-0-ap-south-1.pooler.supabase.com`, user like `postgres.<project-ref>`).
   *Why:* the direct connection is IPv6-only; Render is IPv4. Session mode behaves like a
   normal connection; the transaction pooler (port 6543) is not suited to Django's persistent connections.
4. Add `?sslmode=require` to the end. That full URL is your `DATABASE_URL`.
5. Do **not** create tables in the Supabase dashboard. Django creates them with migrations.
6. Supabase's auto-generated REST API: since we never use the `anon` key, keep it private
   anyway, and under **Database → Tables** confirm Row Level Security is **enabled** on
   `enquiries_enquiry` and the other Django tables so the auto-API exposes nothing. (Run
   `ALTER TABLE public.enquiries_enquiry ENABLE ROW LEVEL SECURITY;` in the SQL editor after
   the first migration, and the same for the `auth_*`, `django_*` tables — Django connects as
   the table owner, which bypasses RLS, so the app keeps working.)

## 3. Render (Django API)

1. Push the repository to GitHub.
2. Render → **New → Blueprint** → pick the repo. It reads `render.yaml` and proposes
   `bbs-api-staging` and `bbs-api`.
3. Enter the secret values when asked:
   * `DATABASE_URL` — the Supabase session-pooler URL for that environment.
   * `DJANGO_ADMIN_PATH` — a non-obvious path, e.g. `office-a7k3/` (keep it private).
4. Check `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` (the website's address) and
   `CSRF_TRUSTED_ORIGINS` (the API's own https address, needed for admin login).
5. Each deploy runs `build.sh` (install, collect static files) and `start.sh` (migrate,
   create cache table, start Gunicorn). If a migration fails, the deploy fails and the
   previous version keeps serving.
6. Create the owner's admin login once, from Render → service → **Shell** (paid plans) or
   locally with production `DATABASE_URL` set in your terminal only:
   `python manage.py createsuperuser`. Use a long unique password. Never put it in a file.
7. Service → **Settings → Deploy Hook**: copy the URL into Jenkins credentials
   (`render-deploy-hook-staging` / `render-deploy-hook-production`). Treat it like a password.
8. Confirm `https://<api-host>/api/health/` returns `{"status": "ok", "database": "ok", ...}`.

## 4. Cloudflare Pages (website)

1. Cloudflare → Workers & Pages → **Create → Pages → Direct Upload**, project name `bbs-site`
   (Jenkins uploads the built files; Cloudflare does not need GitHub access).
2. Create an API token: My Profile → API Tokens → **Create token** → template
   "Edit Cloudflare Workers" or a custom token with **Account → Cloudflare Pages → Edit** only.
   Store it in Jenkins as `cloudflare-api-token`, and your account ID as `cloudflare-account-id`.
3. Jenkins deploys branch `staging` → `https://staging.bbs-site.pages.dev` and branch
   `main` → production.
4. Custom domain (later): Pages project → Custom domains → add `www.yourdomain.in`. Then
   update `VITE_SITE_URL` / `PRODUCTION_SITE_URL` and the API's `CORS_ALLOWED_ORIGINS`, and redeploy both.

Build settings if you ever build on Cloudflare instead of Jenkins: root `frontend`, command
`npm run build`, output `dist`, environment `NODE_VERSION=22`, `VITE_API_BASE_URL`, `VITE_SITE_URL`.

## 5. The release flow

1. Merge a pull request into `main`.
2. Jenkins: lint + tests (backend on a throwaway PostgreSQL, frontend) → triggers the
   staging API deploy → builds and uploads the staging website → waits until staging reports
   the new commit in `/api/health/` and the site responds.
3. You open the staging site, check both languages, submit a test enquiry, see it in the
   staging admin.
4. Click **Deploy to production** in Jenkins. Same steps against production.
5. Visit the live site and submit nothing — just check pages load. (Use staging for test
   enquiries, so production holds only real customers.)

## 6. Migrations safely

* Migrations run automatically at API start. The website keeps working during the deploy.
* Make every migration **backward compatible** with the previous code version, because during
  a rollback the old code meets the new schema:
  * Adding a nullable column or a column with a default: safe.
  * Renaming or removing a column: do it in two releases (add new → deploy → stop using old →
    deploy → remove old).
* Before a release containing a migration, take a backup (docs/OPERATIONS.md §3).

## 7. Rollback

**Website (Cloudflare Pages):** Pages project → Deployments → pick the previous production
deployment → **Rollback**. Instant.

**API (Render):** service → Events/Deploys → previous successful deploy → **Rollback**. Then
check `/api/health/`. If the bad release included a migration that the old code cannot work
with, either fix forward (new commit) or restore the backup taken before the release
(docs/OPERATIONS.md §4) — restoring loses enquiries received since the backup, so note them first.

**Code:** `git revert <commit>` on a branch → pull request → normal pipeline. Avoid
force-pushing `main`.

## 8. Production settings checklist

* `DJANGO_DEBUG=False` · strong `DJANGO_SECRET_KEY` (Render generates it)
* `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS` = real hostnames only
* `DATABASE_URL` ends with `sslmode=require` · `DRF_NUM_PROXIES=1`
* Non-default `DJANGO_ADMIN_PATH` · admin password ≥ 12 characters, unique
* After a week of stable HTTPS on your own domain, raise `DJANGO_HSTS_SECONDS` to `31536000`
* Jenkins runs `python manage.py check --deploy` on every build
