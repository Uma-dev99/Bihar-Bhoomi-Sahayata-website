#!/usr/bin/env bash
# Back up the database to a compressed file OUTSIDE the repository.
#
#   DATABASE_URL='postgres://...supabase...?sslmode=require' scripts/backup-db.sh [backup-dir]
#
# Requires pg_dump version >= the server's PostgreSQL major version.
# Backups contain customer names and phone numbers: keep them on an encrypted
# disk or encrypted cloud folder, never in Git, and delete old ones (below).
set -euo pipefail

: "${DATABASE_URL:?Set DATABASE_URL in your terminal (do not save it in a file)}"
BACKUP_DIR="${1:-$HOME/bbs-backups}"
KEEP_DAYS="${KEEP_DAYS:-30}"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
file="$BACKUP_DIR/bbs-$(date +%Y%m%d-%H%M%S).dump"

# Custom format (-Fc) is compressed and lets pg_restore restore selectively.
# --no-owner/--no-privileges make it restorable into a fresh project.
pg_dump --format=custom --no-owner --no-privileges --dbname="$DATABASE_URL" --file="$file"
chmod 600 "$file"

# Sanity check: the archive must list the enquiries table.
if ! pg_restore --list "$file" | grep -q "enquiries_enquiry"; then
  echo "Backup looks incomplete: $file" >&2
  exit 1
fi
echo "Backup written: $file ($(du -h "$file" | cut -f1))"

# Remove backups older than KEEP_DAYS days.
find "$BACKUP_DIR" -name 'bbs-*.dump' -mtime +"$KEEP_DAYS" -print -delete
