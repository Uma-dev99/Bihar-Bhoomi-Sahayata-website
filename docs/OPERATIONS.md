# Operations guide (for the owner)

## 1. Daily use: managing enquiries

1. Open `https://<api-host>/<your admin path>/` and log in.
2. **Customer enquiries → Enquiries** lists the newest first.
   * Filter on the right by status, service, language, district or date.
   * Search box: name or phone number.
3. Open an enquiry to read it. Use the **Call** or **WhatsApp** links.
4. Change **Status**: `New` → `Contacted` → `Closed`. You can also tick several rows and use
   the "Mark selected as …" action, or edit the status directly in the list.
5. What the customer submitted cannot be edited (only the status), so the record stays accurate.

Check the admin at least once each working day. There is no email alert in version 1
(Render's free plan blocks outgoing email); if you want alerts later, a transactional email
or WhatsApp Business API service can be added.

**Admin security:** long unique password; do not share the login; log out on shared
computers; sessions expire after 8 hours or when the browser closes. To add an assistant later,
create a separate *staff* user with only "view/change enquiry" permissions — never share yours.

## 2. Customer requests to correct or delete data

* Correction: note the correct details in your own records, or delete and ask the customer to
  re-submit (submitted fields are read-only by design).
* Deletion: open the enquiry → **Delete** (only the superuser account can delete). Confirm to
  the customer that it is done. Remember that backups made before the deletion still contain
  it until they age out (30 days with the provided script) — mention this if asked.

## 3. Backups

Supabase's free plan should not be relied on for backups. Run your own:

```bash
# On a trusted computer with the PostgreSQL client installed.
# Type the URL into the terminal only - do not save it in a file.
export DATABASE_URL='postgresql://postgres.<ref>:<password>@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require'
scripts/backup-db.sh ~/bbs-backups
unset DATABASE_URL
```

* Schedule it nightly with Jenkins (docs/JENKINS.md §7) or run it weekly by hand at minimum,
  and always before a release that contains a migration.
* Keep backups on an encrypted disk (BitLocker / FileVault / LUKS) or an encrypted cloud folder.
* Once a month, **test a restore** into the staging project (below). A backup you have never
  restored is not yet a backup.

## 4. Restore

Restoring replaces the data. Enquiries received after the backup are lost unless you note them first.

```bash
# 1. Note any enquiries received since the backup (admin → filter by date).
# 2. Restore into the target database (staging first, to check the file):
export DATABASE_URL='<target database URL>'
pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$DATABASE_URL" ~/bbs-backups/bbs-YYYYMMDD-HHMMSS.dump
# 3. Bring the schema up to the deployed code (normally a no-op):
cd backend && python manage.py migrate
# 4. Check /api/health/ and the admin.
unset DATABASE_URL
```

## 5. Retention policy

* **New / contacted** enquiries are kept while you are dealing with them.
* **Closed** enquiries are deleted after about **12 months** (matches the privacy notice).
* Deletion is deliberate, never automatic. Every few months:

```bash
cd backend
python manage.py purge_old_enquiries              # dry run: shows how many would be deleted
python manage.py purge_old_enquiries --confirm    # actually deletes closed enquiries > 365 days old
```

(Run with the production `DATABASE_URL` in your terminal, or from Render's Shell.)
If you change the period, change `ENQUIRY_RETENTION_DAYS` **and** the privacy notice together.

## 6. When something goes wrong

| Symptom | Likely cause | What to do |
| --- | --- | --- |
| Form says "could not reach the server" | API asleep (free plan) or down | Open `/api/health/`. If it loads after ~1 minute, it was asleep. If not, check Render → Logs |
| `/api/health/` shows `"database": "unreachable"` (HTTP 503) | Supabase paused, password changed, or outage | Supabase dashboard → restore/unpause project; check `DATABASE_URL` on Render; check status.supabase.com |
| Form says "something went wrong" | Server error | Render → Logs (they never contain customer details). Roll back if it started after a deploy (docs/DEPLOYMENT.md §7) |
| "Too many enquiries" for real customers | Rate limit too strict, or many people behind one mobile network IP | Raise `ENQUIRY_RATE_SUSTAINED` on Render (e.g. `20/day`) |
| Spam enquiries in the admin | Bots getting past the honeypot | Delete them; if it continues, add Cloudflare Turnstile (see ARCHITECTURE.md) |
| Site shows old content | Deploy not finished, or browser cache | Check Jenkins and Cloudflare Pages deployments; hard-refresh |

When the API cannot save an enquiry (database down), the visitor sees a clear error and the
form keeps what they typed, so they can retry; nothing is lost silently.

## 7. Routine maintenance

* Monthly: update dependencies (docs/DEVELOPMENT.md §6), test a restore, check Render and
  Supabase usage pages against the free-tier limits.
* Every 6 months: re-read the articles and official links; update `lastReviewed`.
* Whenever data handling changes: update the privacy notice in both languages.
