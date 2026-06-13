import ssl

from celery import Celery

from app.config.settings import settings
from workers.beat_schedule import BEAT_SCHEDULE


def _redis_url(url: str) -> str:
    """Append ssl_cert_reqs for rediss:// URLs (required by Celery's Redis backend)."""
    if url.startswith("rediss://") and "ssl_cert_reqs" not in url:
        sep = "&" if "?" in url else "?"
        return f"{url}{sep}ssl_cert_reqs=CERT_NONE"
    return url


_broker_url = _redis_url(settings.redis_url)
_backend_url = _redis_url(settings.redis_url)

celery_app = Celery(
    "apex_workers",
    broker=_broker_url,
    backend=_backend_url,
    include=["workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="America/Chicago",
    enable_utc=True,
    task_track_started=True,
    beat_schedule=BEAT_SCHEDULE,
)
