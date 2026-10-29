#!/usr/bin/env bash
# Build command used by Render (see render.yaml). Exits on the first error.
set -o errexit
pip install --upgrade pip
pip install -r requirements.txt
python manage.py collectstatic --no-input
