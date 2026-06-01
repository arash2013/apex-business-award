"""Celery Beat schedule — nightly crawl across all active area×category combos."""

from celery.schedules import crontab

BEAT_SCHEDULE = {
    # 2:00 AM America/Chicago every night
    "nightly-crawl-google": {
        "task": "workers.tasks.schedule_nightly_crawls",
        "schedule": crontab(hour=2, minute=0),
        "kwargs": {"platform": "google"},
    },
    "nightly-crawl-yelp": {
        "task": "workers.tasks.schedule_nightly_crawls",
        "schedule": crontab(hour=2, minute=30),
        "kwargs": {"platform": "yelp"},
    },
}
