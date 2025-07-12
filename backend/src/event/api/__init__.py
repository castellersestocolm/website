import datetime
from typing import List
from uuid import UUID

from django.db.models import (
    Q,
    Prefetch,
    Subquery,
    OuterRef,
    Count,
    Value,
    IntegerField,
    F,
    Case,
    When,
)
from django.db.models.functions import Coalesce
from django.utils import timezone, translation

from comunicat.enums import Module
from event.enums import EventStatus, RegistrationStatus
from event.models import Event, Registration, AgendaItem, Connection
from notify.enums import EmailType
from user.enums import FamilyMemberStatus
from user.models import FamilyMember, User

import user.api
import user.api.event
import notify.tasks

from django.conf import settings


def get_list(
    module: Module,
    request_user_id: UUID | None = None,
    date_from: datetime.date | None = None,
    date_to: datetime.date | None = None,
    with_counts: bool = False,
) -> List[Event]:
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

    event_qs = (
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

    # TODO: This can lead to timezone issues close to midnight
    if date_from is not None:
        event_qs = event_qs.filter(time_from__date__gte=date_from)

    # TODO: This can lead to timezone issues close to midnight
    if date_to is not None:
        event_qs = event_qs.filter(time_from__date__lte=date_to)

    if with_counts:
        # Unfortunately getting the count for every event date is too heavy
        user_objs = list(
            User.objects.with_has_active_membership(
                with_pending=True,
                modules=[module],
            )
            .filter(
                has_active_membership=True,
            )
            .with_is_adult()
        )
        user_count = len([user_obj for user_obj in user_objs if user_obj.is_adult])
        child_count = len([user_obj for user_obj in user_objs if not user_obj.is_adult])

        event_qs = event_qs.annotate(
            registration_count_total=Value(user_count),
            registration_count_children_total=Value(child_count),
            registration_count_active=Coalesce(
                Subquery(
                    Registration.objects.filter(
                        event_id=OuterRef("id"),
                        status=RegistrationStatus.ACTIVE,
                    )
                    .with_is_user_adult()
                    .filter(is_user_adult=True)
                    .values("event_id")
                    .annotate(count=Count("id"))
                    .values("count")[:1]
                ),
                Value(0),
                output_field=IntegerField(),
            ),
            registration_count_children_active=Coalesce(
                Subquery(
                    Registration.objects.filter(
                        event_id=OuterRef("id"),
                        status=RegistrationStatus.ACTIVE,
                    )
                    .with_is_user_adult()
                    .filter(is_user_adult=False)
                    .values("event_id")
                    .annotate(count=Count("id"))
                    .values("count")[:1]
                ),
                Value(0),
                output_field=IntegerField(),
            ),
            registration_count_cancelled=Coalesce(
                Subquery(
                    Registration.objects.filter(
                        event_id=OuterRef("id"),
                        status=RegistrationStatus.CANCELLED,
                    )
                    .with_is_user_adult()
                    .filter(is_user_adult=True)
                    .values("event_id")
                    .annotate(count=Count("id"))
                    .values("count")[:1]
                ),
                Value(0),
                output_field=IntegerField(),
            ),
            registration_count_children_cancelled=Coalesce(
                Subquery(
                    Registration.objects.filter(
                        event_id=OuterRef("id"),
                        status=RegistrationStatus.CANCELLED,
                    )
                    .with_is_user_adult()
                    .filter(is_user_adult=False)
                    .values("event_id")
                    .annotate(count=Count("id"))
                    .values("count")[:1]
                ),
                Value(0),
                output_field=IntegerField(),
            ),
        )

    return list(event_qs)


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

        exclude_team_types = getattr(
            settings, f"MODULE_{m.name}_NOTIFY_EVENT_SIGNUP_SKIP_TEAM_TYPES"
        )
        user_objs = user.api.get_list(
            user_ids=user_ids, modules=[m], exclude_team_types=exclude_team_types
        )

        for user_obj in user_objs:
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
