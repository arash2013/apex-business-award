#!/bin/sh
# Start Celery beat only when explicitly enabled.
# Set CELERY_BEAT_ENABLED=true in Railway to activate.
if [ "${CELERY_BEAT_ENABLED}" != "true" ]; then
  echo "Celery beat is disabled (CELERY_BEAT_ENABLED != true). Exiting."
  exit 0
fi
exec celery -A workers.celery_app:celery_app beat --loglevel=info
