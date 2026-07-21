from uuid import UUID

from django.db.models import Q

import notify.tasks
import payment.api.entity
from comunicat.enums import Module
from event.enums import RegistrationStatus
from event.models import Event, Registration
from event.utils.event import get_registration_initial_status
from user.models import FamilyMember


def get_list(
    user_id: UUID,
    module: Module,
    event_ids: list[UUID] | None = None,
    for_admin: bool = False,
) -> list[Registration]:
    registration_filter = Q()

    if event_ids:
        registration_filter &= Q(event_id__in=event_ids)

    if not for_admin:
        registration_filter &= Q(
            entity__user_id=user_id, status=RegistrationStatus.ACTIVE
        )

    return list(
        # TODO: Allow non-user registrations but add support for entity on serializer instead before
        Registration.objects.filter(registration_filter)
        .filter_with_user()
        .select_related(
            "event",
            "entity",
            "entity__user",
            "event__google_album",
            "event__google_event",
            "event__location",
        )
        .prefetch_related(
            "event__modules",
            "event__modules__team",
            "event__prices",
            "event__questions",
            "event__signups",
            "event__requirements",
            "event__agenda_items",
            "event__registrations",
            "event__registrations__entity",
            "event__registrations__entity__user",
        )
        .order_by("-event__time_from", "created_at")
    )


def delete(registration_id: UUID, request_user_id: UUID, module: Module) -> bool:
    registration_obj = (
        Registration.objects.filter(id=registration_id)
        .select_related("entity", "entity__user")
        .first()
    )

    user_ids = [
        family_member_obj.user_id
        for family_member_obj in FamilyMember.objects.filter(
            family__members__user_id=request_user_id
        )
    ]

    if not registration_obj or (
        registration_obj.entity.user and registration_obj.entity.user_id not in user_ids
    ):
        return False

    registration_obj.status = RegistrationStatus.CANCELLED
    registration_obj.save(update_fields=("status",))

    notify.tasks.send_registration_message_slack.delay(
        registration_id=registration_obj.id,
    )

    return True


def create(
    user_id: UUID,
    request_user_id: UUID,
    event_id: UUID,
    module: Module,
    status: RegistrationStatus | None = None,
) -> list[Registration]:
    event_obj = (
        Event.objects.filter(id=event_id).with_module_information(module=module).first()
    )

    if not event_obj:
        return []

    family_user_ids = [
        family_member_obj.user_id
        for family_member_obj in FamilyMember.objects.filter(
            family__members__user_id=request_user_id
        )
    ]
    if user_id not in family_user_ids:
        return []

    registration_obj = Registration.objects.filter(
        entity__user_id=user_id, event_id=event_id
    ).first()

    # TODO: Change this, for now allow only creating with cancelled if specified
    if status is not None and status == RegistrationStatus.CANCELLED:
        registration_status = status
    else:
        registration_status = get_registration_initial_status(
            require_approve=event_obj.require_approve
        )

    if registration_obj:
        registration_obj.status = registration_status
        registration_obj.save(update_fields=("status",))
    else:
        entity_obj = payment.api.entity.get_entity_by_key(user_id=user_id)
        registration_obj = Registration.objects.create(
            entity=entity_obj, event_id=event_id, status=registration_status
        )

    notify.tasks.send_registration_message_slack.delay(
        registration_id=registration_obj.id,
    )

    return registration_obj
