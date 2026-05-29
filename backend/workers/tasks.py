from .celery_app import celery_app


@celery_app.task(name="workers.tasks.crawl_businesses")
def crawl_businesses(city: str, category: str, radius_miles: int = 25) -> dict:
    """Trigger a discovery crawl for a given city + category."""
    # TODO: invoke crawlers.google_crawler and crawlers.yelp_crawler
    return {"status": "queued", "city": city, "category": category}


@celery_app.task(name="workers.tasks.send_outreach_email")
def send_outreach_email(outreach_id: str) -> dict:
    """Send a single outreach email via SendGrid."""
    # TODO: implement SendGrid send logic
    return {"status": "queued", "outreach_id": outreach_id}


@celery_app.task(name="workers.tasks.refresh_all_qualifications")
def refresh_all_qualifications() -> dict:
    """Recompute qualification scores for all businesses."""
    # TODO: batch update qualification scores
    return {"status": "queued"}
