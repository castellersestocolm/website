from typing import List
from uuid import UUID

from django.db.models import Q, Prefetch

from comunicat.enums import Module
from event.enums import RegistrationStatus, EventStatus
from event.models import Event, Registration, AgendaItem, Connection
from user.models import FamilyMember


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
