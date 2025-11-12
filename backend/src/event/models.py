import os
import re
import unicodedata
from zoneinfo import ZoneInfo

from celery.beat import event_t
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.core.exceptions import ValidationError
from django.db.models import JSONField, Q
from django.db.models.functions import Trunc
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from djmoney.models.fields import MoneyField
from versatileimagefield.fields import VersatileImageField

from comunicat.consts import GOOGLE_ENABLED_BY_MODULE
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

from event.managers import EventQuerySet, RegistrationQuerySet, AgendaItemQuerySet
from event.utils.event import get_event_name


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


def get_event_poster_name(instance, filename):
    return os.path.join(
        "event/event/poster/", f"{instance.id}.{filename.split('.')[-1]}"
    )


# TODO: Add event status
class Event(StandardModel, Timestamps):
    title = models.CharField(max_length=255)

    code = models.CharField(max_length=255, blank=True)

    time_from = models.DateTimeField()
    time_to = models.DateTimeField()

    location = models.ForeignKey(
        Location, null=True, blank=True, related_name="events", on_delete=models.CASCADE
    )

    description = JSONField(default=language_field_default)

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

    poster = VersatileImageField(
        "Image", blank=True, null=True, upload_to=get_event_poster_name
    )

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

        if not self.code:
            self.code = unicodedata.normalize(
                "NFKD", re.sub(r"[^\w\-]", "", self.title.replace(" ", "-"))
            ).lower()

        if self.module and self.status == EventStatus.PUBLISHED:
            import event.tasks

            if GOOGLE_ENABLED_BY_MODULE[self.module]["calendar"]:
                transaction.on_commit(
                    lambda: event.tasks.create_or_update_event.delay(event_id=self.id)
                )

            if GOOGLE_ENABLED_BY_MODULE[self.module]["photos"]:
                transaction.on_commit(
                    lambda: event.tasks.create_or_update_album.delay(event_id=self.id)
                )
        elif hasattr(self, "google_event"):
            transaction.on_commit(lambda: self.google_event.delete())

        import pinyator.tasks

        transaction.on_commit(
            lambda: pinyator.tasks.update_or_create_event.delay(event_id=self.id)
        )

        super().save(*args, **kwargs)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                "code",
                Trunc(
                    "time_from",
                    "day",
                    output_field=models.DateTimeField(),
                    tzinfo=ZoneInfo(settings.TIME_ZONE),
                ),
                condition=Q(status=EventStatus.PUBLISHED),
                name="event_event_code_time_from_unique",
            )
        ]


# TODO: Automatically create other event modules for events in series
class EventModule(StandardModel, Timestamps):
    event = models.ForeignKey(Event, related_name="modules", on_delete=models.CASCADE)
    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
        # TODO: For registrations by externals
        # null=True, blank=True,
    )
    team = models.ForeignKey(
        "legal.Team",
        related_name="event_modules",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )

    require_signup = models.BooleanField(default=True)
    require_approve = models.BooleanField(default=False)

    def clean(self):
        if self.team and self.module != self.team.module:
            raise ValidationError({"size": _("Team's module must match module.")})

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        event_modules = [
            (
                event_module_obj.module,
                event_module_obj.team and event_module_obj.team.type,
            )
            for event_module_obj in self.event.modules.all()
        ]
        self.event.title = get_event_name(
            event_title=self.event.title,
            event_type=self.event.type,
            modules=event_modules,
        )
        self.event.save(update_fields=("title",))

    class Meta:
        unique_together = ("event", "module", "team")


class EventModulePrice(StandardModel, Timestamps):
    module = models.ForeignKey(
        EventModule, related_name="prices", on_delete=models.CASCADE
    )

    is_over_minimum_age = models.BooleanField(default=False)

    amount = MoneyField(
        max_digits=7, decimal_places=2, null=True, blank=True, default_currency="SEK"
    )

    class Meta:
        unique_together = ("module", "is_over_minimum_age")


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

    line = models.OneToOneField(
        "payment.PaymentLine",
        related_name="registration",
        blank=True,
        null=True,
        on_delete=models.PROTECT,
    )

    __status = None
    __line = None

    objects = RegistrationQuerySet.as_manager()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__status = self.status
        self.__line = self.line

    def save(self, *args, **kwargs):
        if self.pk:
            if self.status != self.__status:
                RegistrationLog.objects.create(
                    registration_id=self.id, status=self.status
                )
            if self.line != self.__line:
                if self.line:
                    self.line.item = self
                    self.line.save(
                        update_fields=(
                            "item_type",
                            "item_id",
                        )
                    )
                if self.__line:
                    self.__line.item = None
                    self.__line.save(
                        update_fields=(
                            "item_type",
                            "item_id",
                        )
                    )

        if not self.pk or self.status != self.__status:
            import event.tasks

            if GOOGLE_ENABLED_BY_MODULE[self.event.module]["calendar"]:
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


# TODO: Maybe add type?
class AgendaItem(StandardModel, Timestamps):
    name = JSONField(default=language_field_default)

    description = JSONField(default=language_field_default)

    time_from = models.DateTimeField()
    time_to = models.DateTimeField(null=True, blank=True)

    event = models.ForeignKey(
        Event, related_name="agenda_items", on_delete=models.CASCADE
    )

    objects = AgendaItemQuerySet.as_manager()


class GoogleCalendar(StandardModel, Timestamps):
    name = models.CharField(max_length=255)
    external_id = models.CharField(max_length=255, unique=True)

    is_primary = models.BooleanField(default=False)

    google_integration = models.ForeignKey(
        "integration.GoogleIntegration",
        related_name="google_calendars",
        on_delete=models.CASCADE,
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

    def __str__(self) -> str:
        return f"{Module(self.google_calendar.google_integration.module).name} - {self.external_id}"


@receiver(pre_delete, sender=GoogleEvent)
def event_on_delete(sender, instance, using, **kwargs):
    import event.api.google_calendar

    event.api.google_calendar.delete_google_event(google_event_id=instance.id)


class GoogleAlbum(StandardModel, Timestamps):
    event = models.OneToOneField(
        Event, related_name="google_album", on_delete=models.CASCADE
    )
    google_integration = models.ForeignKey(
        "integration.GoogleIntegration",
        related_name="google_albums",
        on_delete=models.CASCADE,
    )
    external_id = models.CharField(max_length=255, unique=True)

    def __str__(self) -> str:
        return f"{Module(self.google_integration.module).name} - {self.external_id}"


@receiver(pre_delete, sender=GoogleAlbum)
def album_on_delete(sender, instance, using, **kwargs):
    import event.api.google_album

    event.api.google_album.delete_google_album(google_album_id=instance.id)
