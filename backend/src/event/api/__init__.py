import datetime
from collections import defaultdict
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
)
from django.db.models.functions import Coalesce
from django.utils import timezone, translation

import legal.api.team
from comunicat.enums import Module
from event.enums import EventStatus, RegistrationStatus, EventType
from event.models import Event, Registration, AgendaItem, Connection, EventModule
from legal.enums import TeamType
from notify.enums import EmailType
from user.enums import FamilyMemberStatus
from user.models import FamilyMember, User

import user.api
import user.api.event
import notify.tasks

from django.conf import settings


def get_list(
    module: Module,
    event_ids: list[UUID] | None = None,
    date: datetime.date | None = None,
    code: str | None = None,
    request_user_id: UUID | None = None,
    date_from: datetime.date | None = None,
    date_to: datetime.date | None = None,
    with_counts: bool = False,
    for_musicians: bool | None = None,
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

    event_filter = Q()

    if event_ids:
        event_filter &= Q(id__in=event_ids)

    if date:
        # TODO: Check if this causes timezone issues
        event_filter &= Q(time_from__date=date)

    if code:
        event_filter &= Q(code=code)

    if for_musicians is not None:
        if for_musicians:
            event_filter &= Q(
                ~Q(type=EventType.REHEARSAL)
                | Q(
                    modules__team__module=module, modules__team__type=TeamType.MUSICIANS
                )
            )
        else:
            event_filter &= Q(
                ~Q(type=EventType.REHEARSAL)
                | Q(modules__team__module=module, modules__team__type__isnull=True)
            )

    event_qs = (
        Event.objects.filter(
            event_filter,
            Q(module__isnull=True) | Q(module=module) | Q(modules__module=module),
            status=EventStatus.PUBLISHED,
        )
        .select_related(
            "location",
            "google_event",
            "google_event__google_calendar",
            "google_event__google_calendar__google_integration",
            "google_album",
            "google_album__google_integration",
        )
        .prefetch_related(
            Prefetch(
                "modules",
                (
                    EventModule.objects.select_related("team").order_by(
                        "module", "team__type"
                    )
                ),
            ),
            Prefetch(
                "registrations",
                (
                    Registration.objects.filter(
                        entity__user_id__in=family_user_ids,
                    ).select_related("entity", "entity__user")
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
        user_ids = [user_obj.id for user_obj in user_objs if user_obj.is_adult]
        child_ids = [user_obj.id for user_obj in user_objs if not user_obj.is_adult]

        event_qs = event_qs.annotate(
            registration_count_total=Value(len(user_ids)),
            registration_count_children_total=Value(len(child_ids)),
            registration_count_active=Coalesce(
                Subquery(
                    Registration.objects.filter(
                        event_id=OuterRef("id"),
                        status=RegistrationStatus.ACTIVE,
                    )
                    .filter(entity__user_id__in=user_ids)
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
                    .filter(entity__user_id__in=child_ids)
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
                    .filter(entity__user_id__in=user_ids)
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
                    .filter(entity__user_id__in=child_ids)
                    .values("event_id")
                    .annotate(count=Count("id"))
                    .values("count")[:1]
                ),
                Value(0),
                output_field=IntegerField(),
            ),
        )

    return list(event_qs)


def get(
    module: Module,
    event_id: UUID | None = None,
    date: datetime.date | None = None,
    code: str | None = None,
) -> Event | None:
    return (
        get_list(
            event_ids=[event_id] if event_id else None,
            date=date,
            code=code,
            module=module,
        )
        + [None]
    )[0]


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
            )
            .prefetch_related(
                Prefetch("modules", EventModule.objects.select_related("team"))
            )
            .order_by("time_from")[:5]
        )

        if not future_event_objs:
            continue

        exclude_event_team_types = getattr(
            settings, f"MODULE_{m.name}_NOTIFY_EVENT_SIGNUP_SKIP_TEAM_TYPES"
        )
        user_objs = user.api.get_list(user_ids=user_ids, modules=[m])

        team_objs = legal.api.team.get_list(module=m)

        user_ids_by_team_id = defaultdict(list)
        user_ids_by_team_type = defaultdict(list)

        # Can't be a simpler inline because team type could be repeated
        for team_obj in team_objs:
            for member_obj in team_obj.members.all():
                user_ids_by_team_id[team_obj.id].append(member_obj.user_id)
                user_ids_by_team_type[team_obj.type].append(member_obj.user_id)

        for user_obj in user_objs:
            if not user_obj.can_manage:
                continue

            token = user.api.event.get_events_signup_token(user_id=user_obj.id)

            user_event_objs = [
                future_event_obj
                for future_event_obj in future_event_objs
                if any(
                    [
                        event_module_obj.module == m
                        and (
                            (
                                not event_module_obj.team
                                and all(
                                    [
                                        user_obj.id
                                        not in user_ids_by_team_type.get(
                                            exclude_team_type, []
                                        )
                                        for event_type, exclude_team_type in exclude_event_team_types
                                        if future_event_obj.type == event_type
                                    ]
                                )
                            )
                            or (
                                user_obj.id
                                in user_ids_by_team_id[event_module_obj.team_id]
                            )
                        )
                        for event_module_obj in future_event_obj.modules.all()
                    ]
                )
            ]

            if not user_event_objs:
                continue

            notify.tasks.send_user_email.delay(
                user_id=user_obj.id,
                email_type=EmailType.EVENT_SIGNUP,
                module=m,
                context={
                    "event_ids": [
                        str(user_event_obj.id) for user_event_obj in user_event_objs
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
