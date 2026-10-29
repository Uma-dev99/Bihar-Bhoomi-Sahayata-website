#!/usr/bin/env bash
# Start command used by Render. Migrations run before the new version serves
# traffic; if a migration fails the deploy fails and the old version keeps running.
set -o errexit
python manage.py migrate --no-input
python manage.py createcachetable
exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers "${WEB_CONCURRENCY:-2}" \
  --timeout 30 \
  --access-logfile - \
  --access-logformat '%(t)s "%(m)s %(U)s" %(s)s %(L)ss'
