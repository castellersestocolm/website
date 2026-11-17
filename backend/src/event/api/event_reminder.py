from django.utils import timezone

from event.enums import EventReminderStatus
from event.models import EventReminder


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
