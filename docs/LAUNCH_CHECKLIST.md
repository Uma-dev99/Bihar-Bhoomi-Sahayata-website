# Launch checklist

Nothing below was invented in the code: every item marked **Owner** needs a real answer from
Bameshwaar Singh before the site is made public.

## Business and legal (Owner)

- [ ] **Business name availability.** "Bihar Bhoomi Sahayata" is a proposed name. Search the
      trade-marks register (ipindia.gov.in), check domain availability and search existing
      businesses before printing or publishing. Wording close to official names (e.g. the
      department's "Bihar Bhumi" portal) can confuse customers; consider whether a more
      distinctive name is wiser.
- [ ] Confirm the Hindi spelling of the owner's name (site uses **बामेश्वर सिंह**).
- [ ] Confirm the background wording: "retired Senior UDC (वरिष्ठ उच्च वर्गीय लिपिक), Government
      of Bihar; experience in revenue administration and land records". Add nothing unconfirmed.
- [ ] Check whether any pension or post-retirement rules apply to private consultancy work.
- [ ] Ask a local accountant about registration (e.g. Udyam, professional tax) and tax on
      consultancy income.
- [ ] Confirm the fees in `frontend/src/content/services.js` (currently proposals for testing).
- [ ] Read the privacy notice and disclaimer (both languages) and confirm they match how you
      will actually work — especially "we do not sell your information", who sees enquiries,
      and the 12-month retention.

## Contact details (Owner → `frontend/src/config/business.js`)

- [ ] Phone number for calls
- [ ] WhatsApp number (may be the same)
- [ ] Email (optional)
- [ ] Working hours in Hindi and English
- [ ] Photograph (optional; place in `frontend/public/images/` and set `ownerPhoto`)

## Articles (Owner)

- [ ] Read each article in both languages; correct anything that does not match practice in Bihar.
- [ ] Open every "Official resources" link and confirm it is the correct, current page.
- [ ] Then set `ownerReviewed: true` and today's date in `lastReviewed` (removes the "draft" notice).

## Technical

- [ ] Dependencies pinned and committed (`requirements.txt`, `package-lock.json`) — docs/DEVELOPMENT.md §2
- [ ] All tests pass locally and in Jenkins, backend tests run on PostgreSQL
- [ ] Staging fully deployed; test enquiry submitted in Hindi and English and seen in the admin
- [ ] Rate limit tested on staging (4 quick submissions → 4th refused)
- [ ] Row Level Security enabled on the Supabase tables (docs/DEPLOYMENT.md §2.6)
- [ ] Admin path is non-default; admin password strong; only the owner has the login
- [ ] First backup taken and a test restore done into staging
- [ ] Real hostnames set in `render.yaml`, `Jenkinsfile`, Render env vars, `VITE_SITE_URL`
- [ ] Production `/api/health/` OK; `https://<site>/sitemap.xml` and `/robots.txt` show the real domain
- [ ] Checked on a real Android phone over mobile data, both languages
- [ ] Submit the sitemap in Google Search Console after launch
