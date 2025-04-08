from typing import List
from uuid import UUID

from django.db.models import Q, Prefetch
from django.utils import timezone, translation

from comunicat.enums import Module
from event.enums import RegistrationStatus, EventStatus
from event.models import Event, Registration, AgendaItem, Connection
from notify.enums import EmailType
from user.enums import FamilyMemberStatus
from user.models import FamilyMember

import user.api
import user.api.event
import notify.tasks

from django.conf import settings


def get_list(module: Module, request_user_id: UUID | None = None) -> List[Event]:
    if request_user_id:
        family_user_ids = [
            family_member_obj.user_id
            for family_member_obj in FamilyMember.objects.filter(
                family__members__user_id=request_user_id
            )
        ]
        if not family_user_ids:
            family_user_ids = [request_user_id]
    else:
        family_user_ids = []

    return list(
        Event.objects.filter(
            Q(module__isnull=True) | Q(module=module) | Q(modules__module=module),
            status=EventStatus.PUBLISHED,
        )
        .select_related("location")
        .prefetch_related(
            "modules",
            Prefetch(
                "registrations",
                (
                    Registration.objects.filter(
                        status__in=(
                            RegistrationStatus.REQUESTED,
                            RegistrationStatus.ACTIVE,
                        ),
                        user_id__in=family_user_ids,
                    )
                    if request_user_id
                    else Registration.objects.none()
                ),
            ),
            Prefetch(
                "agenda_items",
                (AgendaItem.objects.order_by("time_from")),
            ),
            Prefetch(
                "location__connections",
                (Connection.objects.order_by("-type")),
            ),
        )
        .with_module_information(module=module)
        .order_by("time_from", "id")
        .distinct("time_from", "id")
    )


def send_events_signup(
    user_ids: List[UUID] | None = None, module: Module | None = None
) -> None:
    time_now = timezone.now()
    modules = [m for m in Module] if module is None else [module]

    for m in modules:
        days_from, days_to = getattr(
            settings, f"MODULE_{m.name}_NOTIFY_EVENT_SIGNUP_RANGE_DAYS"
        )
        time_from = time_now + timezone.timedelta(days=days_from)
        time_to = time_now + timezone.timedelta(days=days_to)

        future_event_objs = list(
            Event.objects.filter(
                time_from__gte=time_from,
                time_from__lte=time_to,
                modules__module=m,
                status=EventStatus.PUBLISHED,
            ).order_by("time_from")[:5]
        )

        if not future_event_objs:
            continue

        for user_id in user_ids:
            user_obj = user.api.get(user_id=user_id)

            token = user.api.event.get_events_signup_token(user_id=user_obj.id)

            notify.tasks.send_user_email.delay(
                user_id=user_obj.id,
                email_type=EmailType.EVENT_SIGNUP,
                module=m,
                context={
                    "event_ids": [
                        str(future_event_obj.id)
                        for future_event_obj in future_event_objs
                    ],
                    "user_ids": (
                        [
                            str(family_member_obj.user_id)
                            for family_member_obj in user_obj.family_member.family.members.filter(
                                status=FamilyMemberStatus.ACTIVE
                            ).order_by(
                                "-role", "user__firstname", "user__lastname"
                            )
                        ]
                        if hasattr(user_obj, "family_member")
                        else [str(user_obj.id)]
                    ),
                    "token": token,
                },
                locale=user_obj.preferred_language or translation.get_language(),
            )
