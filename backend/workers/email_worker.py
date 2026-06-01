"""Email worker — SendGrid outreach send + follow-up scheduling."""

import logging
from datetime import datetime, timezone
from uuid import UUID

from app.db import AsyncSessionLocal
from app.models import Outreach, OutreachStatus, Business, Award, EmailTemplate

logger = logging.getLogger(__name__)

FOLLOW_UP_DAYS = {2: 4, 3: 10}  # step → days after step 1


async def _send_outreach(outreach_id: UUID) -> None:
    async with AsyncSessionLocal() as db:
        outreach: Outreach | None = await db.get(Outreach, outreach_id)
        if not outreach:
            logger.error("Outreach %s not found", outreach_id)
            return

        template = await db.execute(
            # type: ignore[arg-type]
            __import__("sqlalchemy", fromlist=["select"])
            .select(EmailTemplate)
            .where(EmailTemplate.name == f"outreach_step_{outreach.sequence_step}")
            .where(EmailTemplate.is_active.is_(True))
        )
        tmpl = template.scalar_one_or_none()

        if tmpl is None:
            logger.warning("No template for outreach step %s", outreach.sequence_step)
            return

        business: Business | None = await db.get(Business, outreach.business_id)
        award: Award | None = await db.get(Award, outreach.award_id)

        # Render template (merge fields)
        subject = _render(tmpl.subject, business, award)
        body_html = _render(tmpl.body_html, business, award)
        body_text = _render(tmpl.body_text, business, award)

        # TODO: replace stub with real SendGrid send
        # message_id = await _sendgrid_send(
        #     to=outreach.email_address,
        #     subject=subject,
        #     body_html=body_html,
        #     body_text=body_text,
        # )
        message_id = f"stub-{outreach_id}"
        logger.info(
            "Sent outreach %s (step %s) to %s",
            outreach_id,
            outreach.sequence_step,
            outreach.email_address,
        )

        outreach.status = OutreachStatus.sent
        outreach.sent_at = datetime.now(timezone.utc)
        outreach.sendgrid_message_id = message_id
        await db.commit()

        # schedule follow-up
        if outreach.sequence_step in FOLLOW_UP_DAYS:
            next_step = outreach.sequence_step + 1
            delay_days = FOLLOW_UP_DAYS[outreach.sequence_step]
            _schedule_follow_up(
                str(outreach.business_id),
                str(outreach.award_id),
                outreach.email_address,
                next_step,
                delay_days,
            )


def _render(template: str, business: Business | None, award: Award | None) -> str:
    import html

    fields = {
        "business_name": html.escape(business.name if business else ""),
        "award_tier": html.escape(award.tier if award else ""),
        "award_year": html.escape(str(award.year) if award else ""),
    }
    for key, value in fields.items():
        template = template.replace(f"{{{{{key}}}}}", value)
    return template


def _schedule_follow_up(
    business_id: str, award_id: str, email: str, step: int, delay_days: int
) -> None:
    from workers.tasks import send_outreach_follow_up

    send_outreach_follow_up.apply_async(
        kwargs={
            "business_id": business_id,
            "award_id": award_id,
            "email": email,
            "step": step,
        },
        countdown=delay_days * 86400,
    )
