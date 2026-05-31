from celery import Celery

from app.config.settings import settings
from workers.beat_schedule import BEAT_SCHEDULE

celery_app = Celery(
    "apex_workers",
    broker=settings.redis_url,
    backend=settings.redis_url,
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
