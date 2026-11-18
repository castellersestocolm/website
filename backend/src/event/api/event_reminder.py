from uuid import UUID

from django.utils import timezone

import notify.api.newsletter
import notify.tasks
from event.enums import EventReminderStatus
from event.models import EventReminder
from notify.enums import EmailType


def send_event_reminders() -> None:
    time_now = timezone.now()

    event_reminder_objs = list(
        EventReminder.objects.filter(
            time__lte=time_now, status=EventReminderStatus.SCHEDULED
        ).order_by("time", "module", "newsletter")
    )

    event_reminder_updates = []

    for event_reminder_obj in event_reminder_objs:
        # TODO: ACTUALLY SEND THE EMAIL

        event_reminder_obj.status = EventReminderStatus.SENT
        event_reminder_updates.append(event_reminder_obj)

    if event_reminder_updates:
        EventReminder.objects.bulk_update(event_reminder_updates, fields=("status",))


def send_event_reminder(event_reminder_id: UUID) -> None:
    event_reminder_obj = (
        EventReminder.objects.filter(id=event_reminder_id)
        .select_related("event", "newsletter")
        .first()
    )

    if not event_reminder_obj:
        return None

    if event_reminder_obj.newsletter:
        entity_objs = notify.api.newsletter.get_entities_by_newsletter(
            newsletter_id=event_reminder_obj.newsletter.id
        )
    else:
        # TODO: Non-newsletter reminders
        entity_objs = []

    for entity_obj in entity_objs:
        notify.tasks.send_event_reminder_email.delay(
            email_template_id=event_reminder_obj.template_id,
            email_type=EmailType.TEMPLATE_EVENT_REGISTER,
            module=event_reminder_obj.event.module,
            entity_id=entity_obj.id,
            event_id=event_reminder_obj.event_id,
            event_reminder_id=event_reminder_obj.id,
        )

    return None
