#!/usr/bin/env bash
# Usage: scripts/health-check.sh <api-health-url> <site-url> [expected-git-commit]
#
# Waits until the API health check answers {"status": "ok"} - and, when a
# commit is given, until the API reports that commit (so we know the NEW
# version is live, not the old one) - then checks the website responds.
# Free Render services sleep and redeploys take a few minutes, so this
# waits up to ~15 minutes before failing.
set -euo pipefail

API_URL="$1"
SITE_URL="$2"
EXPECTED="${3:-}"
EXPECTED="${EXPECTED:0:7}"

for attempt in $(seq 1 90); do
  body="$(curl -fsS --max-time 70 "$API_URL" 2>/dev/null || true)"
  if echo "$body" | grep -q '"status": *"ok"'; then
    if [ -z "$EXPECTED" ] || echo "$body" | grep -q "\"version\": *\"$EXPECTED\""; then
      echo "API healthy: $body"
      break
    fi
    echo "Attempt $attempt: API healthy but still running the previous version: $body"
  else
    echo "Attempt $attempt: API not ready yet"
  fi
  if [ "$attempt" -eq 90 ]; then
    echo "API health check FAILED for $API_URL" >&2
    exit 1
  fi
  sleep 10
done

code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "$SITE_URL")"
if [ "$code" != "200" ]; then
  echo "Website check FAILED: $SITE_URL returned HTTP $code" >&2
  exit 1
fi
echo "Website OK: $SITE_URL"
