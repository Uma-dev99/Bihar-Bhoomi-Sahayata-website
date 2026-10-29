# Jenkins setup

Jenkins runs on a machine you control (your development computer or a small server). It does
not need to be reachable from the internet if you start builds yourself or let it poll GitHub.

## 1. Install

* Install Jenkins LTS (jenkins.io → Download → LTS) and Java as its docs require.
* On the same machine: Python 3.12+, Node.js 22, Docker, Git, curl.
  Add the `jenkins` user to the `docker` group so the pipeline can start the test database.
* Plugins (Manage Jenkins → Plugins): **Pipeline**, **Git**, **GitHub Branch Source**,
  **Credentials Binding**, **JUnit**, **Timestamper**, **Workspace Cleanup**.

## 2. Secure it — before anything else

* Complete the setup wizard and create one admin account with a long unique password.
  Disable sign-up (Manage Jenkins → Security → "Allow users to sign up" off).
* Authorization: "Logged-in users can do anything" is acceptable for a single user;
  never "Anyone can do anything".
* Keep it **off the public internet**: bind to localhost (`--httpListenAddress=127.0.0.1`
  in the Jenkins service settings), or put it behind a VPN such as Tailscale. Do not open
  port 8080 on your router.
* Builds on the built-in node are fine for one person; set its executors to 1–2.
* Update Jenkins and plugins monthly (Manage Jenkins shows warnings for vulnerable plugins).
* Back up `JENKINS_HOME` occasionally (it holds the encrypted credentials).

## 3. Credentials (Manage Jenkins → Credentials → System → Global → Add)

| ID | Kind | Value |
| --- | --- | --- |
| `github-access` | Username + personal access token | Fine-grained GitHub token, read-only access to this repo (Contents, Metadata, Pull requests, Commit statuses: read/write) |
| `render-deploy-hook-staging` | Secret text | Render staging deploy hook URL |
| `render-deploy-hook-production` | Secret text | Render production deploy hook URL |
| `cloudflare-api-token` | Secret text | Cloudflare token limited to Pages: Edit |
| `cloudflare-account-id` | Secret text | Cloudflare account ID |

The pipeline uses `withCredentials`, so Jenkins masks these values in logs. Never `echo` them.

## 4. Create the job

New Item → **Multibranch Pipeline** → name `bihar-bhoomi-sahayata`:
* Branch Sources → GitHub → credentials `github-access` → repository URL.
* Behaviours: discover branches, discover pull requests from origin.
* Build Configuration: by Jenkinsfile.
* Scan triggers: "Periodically if not otherwise run" every 5 minutes (works without exposing
  Jenkins to GitHub webhooks).

## 5. Protect `main` on GitHub

Repository → Settings → Branches → Add rule for `main`:
* Require a pull request before merging.
* Require status checks to pass → select the Jenkins check (appears after the first PR build).
* Do not allow force pushes or deletions.

## 6. What the pipeline does

| Branch | Stages |
| --- | --- |
| Pull request / feature branch | backend lint → backend tests on throwaway PostgreSQL (+ `check --deploy`, missing-migration check) → frontend lint, format check, tests → build |
| `main` | all of the above → deploy staging → health check (waits for the new commit) → **manual approval** → deploy production → health check |

If any step fails, later steps do not run and production is untouched.

## 7. Scheduled database backup (optional)

Create a Pipeline job **bbs-nightly-backup** → Definition "Pipeline script from SCM" →
this repository, branch `main`, Script Path `ci/Jenkinsfile.backup`. Add a credential
`supabase-production-url` (Secret text = production `DATABASE_URL`). The job runs
`scripts/backup-db.sh` every night around 02:00 and keeps 30 days of backups in
`~/bbs-backups` on the Jenkins machine. Install the PostgreSQL client (`pg_dump`, same or
newer major version than Supabase's server) on that machine.

This also counts as database activity, which helps keep a free Supabase project from pausing.
The backup folder must be on an encrypted disk; see docs/OPERATIONS.md.
