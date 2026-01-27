import datetime
import re
from uuid import UUID

from django.db import transaction
from django.db.models import Q, Prefetch
from django.utils import timezone
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

import payment.api.entity
from comunicat.consts import GOOGLE_ENABLED_BY_MODULE
from comunicat.enums import Module
from event.consts import (
    GOOGLE_CALENDAR_SCOPES,
    REGISTRATION_STATUS_TO_GOOGLE_RESPONSE_STATUS,
    GOOGLE_RESPONSE_STATUS_TO_REGISTRATION_STATUS,
)
from event.enums import EventType, RegistrationStatus
from event.models import (
    Event,
    GoogleEvent,
    GoogleCalendar,
    EventModule,
    AgendaItem,
    Registration,
    Location,
)

from django.conf import settings

from event.utils.google_calendar import get_event_type_by_title
from integration.models import GoogleIntegration
from user.models import User


def import_events() -> None:
    time_now = timezone.localtime()
    google_event_by_key = {
        (
            google_event_obj.google_calendar.external_id,
            google_event_obj.external_id,
        ): google_event_obj
        for google_event_obj in GoogleEvent.objects.filter(
            event__time_to__gte=time_now
        ).select_related("google_calendar")
    }

    location_objs = list(Location.objects.all())

    event_creates = []
    event_updates = []
    event_module_creates = []
    google_event_creates = []
    registration_creates = []
    registration_updates = []

    for google_integration_obj in GoogleIntegration.objects.prefetch_related(
        "google_calendars"
    ):

        if not GOOGLE_ENABLED_BY_MODULE[google_integration_obj.module]["calendar"]:
            continue

        if (
            google_integration_obj.module
            in settings.MODULE_ALL_GOOGLE_CALENDAR_INVITE_MODULES
        ):
            entity_by_email = {
                user_obj.email: (
                    user_obj.entity
                    if hasattr(user_obj, "entity")
                    else payment.api.entity.get_entity_by_key(email=user_obj.email)
                )
                for user_obj in User.objects.with_has_active_membership(
                    modules=[google_integration_obj.module]
                ).filter(has_active_membership=True)
                if user_obj.can_manage
            }
        else:
            entity_by_email = {}

        # TODO: Don't update if "approve required" on the event
        # TODO: Not necessarily with user only
        registration_by_key = {
            (
                registration_obj.event_id,
                registration_obj.entity_id,
            ): registration_obj
            for registration_obj in Registration.objects.filter(
                event__time_to__gte=time_now,
            )
        }

        creds = Credentials.from_authorized_user_info(
            info=google_integration_obj.authorized_user_info,
            scopes=GOOGLE_CALENDAR_SCOPES,
        )
        service = build("calendar", "v3", credentials=creds)

        for google_calendar_obj in google_integration_obj.google_calendars.all():
            try:

                events = (
                    service.events()
                    .list(
                        calendarId=google_calendar_obj.external_id,
                        timeMin=time_now.isoformat(),
                        maxResults=100,
                        singleEvents=True,
                        orderBy="startTime",
                    )
                    .execute()
                )
                for event in events["items"]:
                    if "dateTime" in event["start"] and "dateTime" in event["end"]:
                        event_key = (google_calendar_obj.external_id, event["id"])
                        updated_at = datetime.datetime.fromisoformat(event["updated"])
                        if event_key in google_event_by_key:
                            event_obj = google_event_by_key[event_key].event

                            time_from = datetime.datetime.fromisoformat(
                                event["start"]["dateTime"]
                            )
                            time_to = datetime.datetime.fromisoformat(
                                event["end"]["dateTime"]
                            )
                            if (
                                event_obj.time_from != time_from
                                or event_obj.time_to != time_to
                            ):
                                event_obj.time_from = time_from
                                event_obj.time_to = time_to
                                event_updates.append(event_obj)

                            for attendee in event.get("attendees", []):
                                if attendee["email"] in entity_by_email:
                                    registration_obj = registration_by_key.get(
                                        (
                                            event_obj.id,
                                            entity_by_email[attendee["email"]].id,
                                        )
                                    )
                                    registration_status = (
                                        GOOGLE_RESPONSE_STATUS_TO_REGISTRATION_STATUS[
                                            attendee["responseStatus"]
                                        ]
                                    )
                                    if registration_status in (
                                        RegistrationStatus.ACTIVE,
                                        RegistrationStatus.CANCELLED,
                                    ):
                                        if registration_obj:
                                            if (
                                                registration_obj.status
                                                != registration_status
                                                and registration_obj.updated_at
                                                < updated_at
                                            ):
                                                registration_obj.status = (
                                                    registration_status
                                                )
                                                registration_updates.append(
                                                    registration_obj
                                                )
                                        else:
                                            registration_creates.append(
                                                Registration(
                                                    event=event_obj,
                                                    entity=entity_by_email[
                                                        attendee["email"]
                                                    ],
                                                    status=registration_status,
                                                )
                                            )
                        else:
                            title = event["summary"]
                            location_obj = None
                            for current_location_obj in location_objs:
                                if current_location_obj.name.lower() in title.lower():
                                    location_obj = current_location_obj
                                    title = (
                                        re.sub(
                                            current_location_obj.name,
                                            "",
                                            title,
                                            flags=re.IGNORECASE,
                                        )
                                        .strip()
                                        .strip("-")
                                        .strip()
                                    )
                                    break

                            event_obj = Event(
                                title=title,
                                time_from=datetime.datetime.fromisoformat(
                                    event["start"]["dateTime"]
                                ),
                                time_to=datetime.datetime.fromisoformat(
                                    event["end"]["dateTime"]
                                ),
                                type=get_event_type_by_title(title=event["summary"]),
                                location=location_obj,
                                module=google_integration_obj.module,
                            )
                            event_creates.append(event_obj)

                            if google_integration_obj.module == Module.TOWERS:
                                if event_obj.type in (
                                    EventType.REHEARSAL,
                                    EventType.PERFORMANCE,
                                ):
                                    event_module_creates.append(
                                        EventModule(
                                            event=event_obj,
                                            module=Module.TOWERS,
                                            require_signup=True,
                                            require_approve=False,
                                        )
                                    )
                                    event_module_creates.append(
                                        EventModule(
                                            event=event_obj,
                                            module=Module.ORG,
                                            require_signup=False,
                                            require_approve=False,
                                        )
                                    )
                            for attendee in event.get("attendees", []):
                                if attendee["email"] in entity_by_email:
                                    registration_status = (
                                        GOOGLE_RESPONSE_STATUS_TO_REGISTRATION_STATUS[
                                            attendee["responseStatus"]
                                        ]
                                    )
                                    if registration_status in (
                                        RegistrationStatus.ACTIVE,
                                        RegistrationStatus.CANCELLED,
                                    ):
                                        registration_creates.append(
                                            Registration(
                                                event=event_obj,
                                                entity=entity_by_email[
                                                    attendee["email"]
                                                ],
                                                status=registration_status,
                                            )
                                        )
                            google_event_creates.append(
                                GoogleEvent(
                                    event=event_obj,
                                    google_calendar=google_calendar_obj,
                                    external_id=event["id"],
                                )
                            )
            except HttpError:
                pass

    if event_creates:
        event_objs = Event.objects.bulk_create(event_creates)

        import event.tasks

        for event_obj in event_objs:
            if GOOGLE_ENABLED_BY_MODULE[event_obj.module]["photos"]:
                transaction.on_commit(
                    lambda: event.tasks.create_or_update_album.delay(
                        event_id=event_obj.id
                    )
                )

    if event_updates:
        Event.objects.bulk_update(event_updates, fields=("time_from", "time_to"))

        import event.tasks

        for event_obj in event_updates:
            if GOOGLE_ENABLED_BY_MODULE[event_obj.module]["photos"]:
                transaction.on_commit(
                    lambda: event.tasks.create_or_update_album.delay(
                        event_id=event_obj.id
                    )
                )

    if google_event_creates:
        GoogleEvent.objects.bulk_create(google_event_creates)

    if event_module_creates:
        EventModule.objects.bulk_create(event_module_creates)

    if registration_creates:
        Registration.objects.bulk_create(registration_creates)

    if registration_updates:
        Registration.objects.bulk_update(registration_updates, fields=("status",))


def create_or_update_event(
    event_id: UUID, registration_id: UUID | None = None
) -> GoogleEvent | None:
    event_obj = (
        Event.objects.filter(id=event_id)
        .select_related("location", "google_event")
        .prefetch_related(
            "modules",
            "registrations",
            Prefetch(
                "agenda_items",
                (
                    AgendaItem.objects.with_name()
                    .with_description()
                    .order_by("time_from")
                ),
            ),
        )
        .first()
    )

    if not event_obj or not event_obj.module:
        return None

    if not GOOGLE_ENABLED_BY_MODULE[event_obj.module]["calendar"]:
        return None

    google_integration_obj = GoogleIntegration.objects.filter(
        module=event_obj.module
    ).first()

    if not google_integration_obj:
        return None

    google_calendar_obj = (
        GoogleCalendar.objects.filter(
            Q(is_primary=True) | Q(google_defaults__type=event_obj.type),
            google_integration=google_integration_obj,
        )
        .order_by("is_primary")
        .first()
    )

    if not google_calendar_obj:
        return None

    event_modules = list(
        set(settings.MODULE_ALL_GOOGLE_CALENDAR_INVITE_MODULES).intersection(
            event_obj.modules.values_list("module", flat=True)
        )
    )

    user_objs = [
        user_obj
        for user_obj in User.objects.with_has_active_membership(
            modules=event_modules
        ).filter(has_active_membership=True)
        if user_obj.can_manage
    ]
    registration_by_user_id = {
        registration_obj.entity.user_id: registration_obj
        for registration_obj in event_obj.registrations.filter_with_user()
    }

    registration_updates = []

    try:
        creds = Credentials.from_authorized_user_info(
            info=google_integration_obj.authorized_user_info,
            scopes=GOOGLE_CALENDAR_SCOPES,
        )
        service = build("calendar", "v3", credentials=creds)

        if (
            event_obj.type in (EventType.REHEARSAL, EventType.WORKSHOP)
            and event_obj.location
        ):
            event_title = f"{event_obj.title} - {event_obj.location.name}"
        else:
            event_title = event_obj.title

        if hasattr(event_obj, "google_event"):
            event = (
                service.events()
                .get(
                    calendarId=google_calendar_obj.external_id,
                    eventId=event_obj.google_event.external_id,
                )
                .execute()
            )

            attendee_status_by_email = {
                attendee["email"]: attendee["responseStatus"]
                for attendee in event.get("attendees", [])
            }

            attendees = []
            for user_obj in user_objs:
                if user_obj.id in registration_by_user_id and (
                    not registration_id
                    or registration_by_user_id[user_obj.id].id == registration_id
                ):
                    attendees.append(
                        {
                            "email": user_obj.email,
                            "responseStatus": REGISTRATION_STATUS_TO_GOOGLE_RESPONSE_STATUS[
                                registration_by_user_id[user_obj.id].status
                            ],
                        }
                    )
                elif user_obj.email in attendee_status_by_email:
                    attendees.append(
                        {
                            "email": user_obj.email,
                            "responseStatus": attendee_status_by_email[user_obj.email],
                        }
                    )
                    if user_obj.id in registration_by_user_id:
                        registration_obj = registration_by_user_id[user_obj.id]
                        registration_status = (
                            GOOGLE_RESPONSE_STATUS_TO_REGISTRATION_STATUS[
                                attendee_status_by_email[user_obj.email]
                            ]
                        )
                        if (
                            registration_obj.status != registration_status
                            and registration_status
                            in (RegistrationStatus.ACTIVE, RegistrationStatus.CANCELLED)
                        ):
                            registration_obj.status = registration_status
                            registration_updates.append(registration_obj)
                else:
                    attendees.append({"email": user_obj.email})

            service.events().update(
                calendarId=google_calendar_obj.external_id,
                eventId=event_obj.google_event.external_id,
                sendUpdates="externalOnly",
                body={
                    "summary": event_title,
                    **(
                        {"location": event_obj.location.address}
                        if event_obj.location
                        else {}
                    ),
                    "start": {
                        "dateTime": event_obj.time_from.isoformat(),
                        "timeZone": settings.TIME_ZONE,
                    },
                    "end": {
                        "dateTime": event_obj.time_to.isoformat(),
                        "timeZone": settings.TIME_ZONE,
                    },
                    "description": "\n\n".join(
                        [
                            f"<b>{timezone.localtime(agenda_item_obj.time_from).strftime('%H:%M')} — {agenda_item_obj.name_locale}</b>\n{agenda_item_obj.description_locale}"
                            for agenda_item_obj in event_obj.agenda_items.all()
                        ]
                    ),
                    "attendees": attendees,
                    "guestsCanInviteOthers": False,
                    "guestsCanModify": False,
                    "guestsCanSeeOtherGuests": False,
                },
            ).execute()
        else:
            event = (
                service.events()
                .insert(
                    calendarId=google_calendar_obj.external_id,
                    sendUpdates="externalOnly",
                    body={
                        "summary": event_title,
                        **(
                            {"location": event_obj.location.address}
                            if event_obj.location
                            else {}
                        ),
                        "start": {
                            "dateTime": event_obj.time_from.isoformat(),
                            "timeZone": settings.TIME_ZONE,
                        },
                        "end": {
                            "dateTime": event_obj.time_to.isoformat(),
                            "timeZone": settings.TIME_ZONE,
                        },
                        "description": "\n\n".join(
                            [
                                f"<b>{timezone.localtime(agenda_item_obj.time_from).strftime('%H:%M')} — {agenda_item_obj.name}</b>\n{agenda_item_obj.description}"
                                for agenda_item_obj in event_obj.agenda_items.all()
                            ]
                        ),
                        "attendees": [
                            {
                                "email": user_obj.email,
                                **(
                                    {
                                        "responseStatus": REGISTRATION_STATUS_TO_GOOGLE_RESPONSE_STATUS[
                                            registration_by_user_id[user_obj.id].status
                                        ]
                                    }
                                    if user_obj.id in registration_by_user_id
                                    else {}
                                ),
                            }
                            for user_obj in user_objs
                        ],
                        "guestsCanInviteOthers": False,
                        "guestsCanModify": False,
                        "guestsCanSeeOtherGuests": False,
                    },
                    # **({"maxAttendees": event_obj.max_registrations} if event_obj.max_registrations else {}),
                )
                .execute()
            )

            GoogleEvent.objects.create(
                event=event_obj,
                google_calendar=google_calendar_obj,
                external_id=event["id"],
            )
    except HttpError:
        pass

    if registration_updates:
        Registration.objects.bulk_update(registration_updates, fields=("status",))


def delete_google_event(google_event_id: UUID) -> bool:
    google_event_obj = (
        GoogleEvent.objects.filter(id=google_event_id)
        .select_related("google_calendar", "google_calendar__google_integration")
        .first()
    )

    if not google_event_obj:
        return False

    if not GOOGLE_ENABLED_BY_MODULE[
        google_event_obj.google_calendar.google_integration.module
    ]["calendar"]:
        return False

    try:
        creds = Credentials.from_authorized_user_info(
            info=google_event_obj.google_calendar.google_integration.authorized_user_info,
            scopes=GOOGLE_CALENDAR_SCOPES,
        )
        service = build("calendar", "v3", credentials=creds)

        service.events().delete(
            calendarId=google_event_obj.google_calendar.external_id,
            eventId=google_event_obj.external_id,
        ).execute()
    except HttpError:
        pass

    return True
