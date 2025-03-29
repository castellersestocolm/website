from django.contrib.postgres.fields import ArrayField
from django.core.exceptions import ValidationError
from django.db.models import JSONField
from django.db.models.signals import pre_delete
from django.dispatch import receiver

from comunicat.db.mixins import StandardModel, Timestamps
from django.db import models, transaction

from comunicat.enums import Module
from comunicat.utils.models import language_field_default
from event.enums import (
    EventType,
    EventRequirementType,
    RegistrationStatus,
    TransportMode,
    EventStatus,
)

from django.utils.translation import gettext_lazy as _

from event.managers import EventQuerySet


# TODO: Split address into fields, add coordinates
class Location(StandardModel, Timestamps):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    description = JSONField(default=language_field_default)
    coordinate_lat = models.FloatField()
    coordinate_lon = models.FloatField()

    def __str__(self) -> str:
        return self.name


class Connection(StandardModel, Timestamps):
    name = models.CharField(max_length=255)
    type = models.PositiveSmallIntegerField(
        choices=((et.value, et.name) for et in TransportMode),
    )
    coordinate_lat = models.FloatField()
    coordinate_lon = models.FloatField()
    path = ArrayField(
        base_field=ArrayField(base_field=models.FloatField(), default=list),
        default=list,
    )
    location = models.ForeignKey(
        Location,
        null=True,
        blank=True,
        related_name="connections",
        on_delete=models.CASCADE,
    )


class EventSeries(StandardModel, Timestamps):
    name = models.CharField(max_length=255)


# TODO: Add event status
class Event(StandardModel, Timestamps):
    title = models.CharField(max_length=255)

    time_from = models.DateTimeField()
    time_to = models.DateTimeField()

    location = models.ForeignKey(
        Location, null=True, blank=True, related_name="events", on_delete=models.CASCADE
    )

    series = models.ForeignKey(
        EventSeries,
        null=True,
        blank=True,
        related_name="events",
        on_delete=models.CASCADE,
    )

    type = models.PositiveSmallIntegerField(
        choices=((et.value, et.name) for et in EventType),
        default=EventType.GENERAL,
    )
    status = models.PositiveSmallIntegerField(
        choices=((es.value, es.name) for es in EventStatus),
        default=EventStatus.DRAFT,
    )
    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
        null=True,
        blank=True,
    )

    max_registrations = models.PositiveSmallIntegerField(null=True, blank=True)

    objects = EventQuerySet.as_manager()

    def __str__(self) -> str:
        return self.title

    def clean(self):
        if self.time_to < self.time_from:
            raise ValidationError(
                {"time_to": _("End time must be greater than start time.")}
            )

    def save(self, *args, **kwargs):
        if self.series:
            self.series.events.exclude(id=self.id).update(type=self.type)

        if self.status == EventStatus.PUBLISHED:
            import event.tasks

            transaction.on_commit(
                lambda: event.tasks.create_or_update_event.delay(event_id=self.id)
            )
        elif hasattr(self, "google_event"):
            transaction.on_commit(lambda: self.google_event.delete())

        import pinyator.tasks

        transaction.on_commit(
            lambda: pinyator.tasks.update_or_create_event.delay(event_id=self.id)
        )

        super().save(*args, **kwargs)


# TODO: Automatically create other event modules for events in series
class EventModule(StandardModel, Timestamps):
    event = models.ForeignKey(Event, related_name="modules", on_delete=models.CASCADE)
    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
        # TODO: For registrations by externals
        # null=True, blank=True,
    )

    require_signup = models.BooleanField(default=True)
    require_approve = models.BooleanField(default=False)


# TODO: Multilanguage support
class EventRequirement(StandardModel, Timestamps):
    name = models.CharField(max_length=255)
    type = models.PositiveSmallIntegerField(
        choices=((et.value, et.name) for et in EventRequirementType),
    )

    only_signup = models.BooleanField(default=True)

    event = models.ForeignKey(
        Event, related_name="requirements", on_delete=models.CASCADE
    )


# TODO: Handle registrations without users (external)
class Registration(StandardModel, Timestamps):
    event = models.ForeignKey(
        Event, related_name="registrations", on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        "user.User", related_name="registrations", on_delete=models.CASCADE
    )

    status = models.PositiveSmallIntegerField(
        choices=((rs.value, rs.name) for rs in RegistrationStatus),
        default=RegistrationStatus.REQUESTED,
    )

    __status = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__status = self.status

    def save(self, *args, **kwargs):
        if self.status != self.__status:
            RegistrationLog.objects.create(registration_id=self.id, status=self.status)

        if not self.pk or self.status != self.__status:
            import event.tasks

            transaction.on_commit(
                lambda: event.tasks.create_or_update_event.delay(
                    event_id=self.event_id, registration_id=self.id
                )
            )

        import pinyator.tasks

        transaction.on_commit(
            lambda: pinyator.tasks.update_or_create_registration.delay(
                registration_id=self.id
            )
        )

        super().save(*args, **kwargs)

    class Meta:
        unique_together = ("event", "user")


class RegistrationLog(StandardModel, Timestamps):
    registration = models.ForeignKey(
        "Registration", related_name="logs", on_delete=models.CASCADE
    )
    status = models.PositiveSmallIntegerField(
        choices=((rs.value, rs.name) for rs in RegistrationStatus),
    )


# TODO: Maybe add type, multilanguage support?
class AgendaItem(StandardModel, Timestamps):
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=1000, null=True, blank=True)

    time_from = models.DateTimeField()
    time_to = models.DateTimeField(null=True, blank=True)

    event = models.ForeignKey(
        Event, related_name="agenda_items", on_delete=models.CASCADE
    )


class GoogleCalendar(StandardModel, Timestamps):
    name = models.CharField(max_length=255)
    external_id = models.CharField(max_length=255, unique=True)

    is_primary = models.BooleanField(default=False)

    google_integration = models.ForeignKey(
        "integration.GoogleIntegration", related_name="google_calendars", on_delete=models.CASCADE
    )


class GoogleCalendarDefault(StandardModel, Timestamps):
    google_calendar = models.ForeignKey(
        GoogleCalendar, related_name="google_defaults", on_delete=models.CASCADE
    )
    type = models.PositiveSmallIntegerField(
        choices=((et.value, et.name) for et in EventType),
        default=EventType.GENERAL,
        unique=True,
    )


# TODO: Attendance, allow syncing with registrations
class GoogleEvent(StandardModel, Timestamps):
    event = models.OneToOneField(
        Event, related_name="google_event", on_delete=models.CASCADE
    )
    google_calendar = models.ForeignKey(
        GoogleCalendar, related_name="google_events", on_delete=models.CASCADE
    )
    external_id = models.CharField(max_length=255, unique=True)


@receiver(pre_delete, sender=GoogleEvent)
def event_on_delete(sender, instance, using, **kwargs):
    import event.api.google_calendar

    event.api.google_calendar.delete_google_event(google_event_id=instance.id)
