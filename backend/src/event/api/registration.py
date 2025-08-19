from typing import List
from uuid import UUID

from comunicat.enums import Module
from event.enums import RegistrationStatus
from event.models import Registration, Event
from event.utils.event import get_registration_initial_status
from user.models import FamilyMember


def get_list(
    event_id: UUID,
    user_id: UUID,
    module: Module,
    for_admin: bool = False,
) -> List[Registration]:
    registration_qs = (
        Registration.objects.filter(event_id=event_id)
        .select_related("event", "user")
        .order_by("user__firstname", "user__lastname", "created_at")
    )

    if not for_admin:
        registration_qs = registration_qs.filter(user_id=user_id)

    return list(registration_qs)


def delete(registration_id: UUID, request_user_id: UUID, module: Module) -> bool:
    registration_obj = (
        Registration.objects.filter(id=registration_id).select_related("user").first()
    )

    user_ids = [
        family_member_obj.user_id
        for family_member_obj in FamilyMember.objects.filter(
            family__members__user_id=request_user_id
        )
    ]

    if not registration_obj or registration_obj.user_id not in user_ids:
        return False

    registration_obj.status = RegistrationStatus.CANCELLED
    registration_obj.save(update_fields=("status",))

    return True


def create(
    user_id: UUID,
    request_user_id: UUID,
    event_id: UUID,
    module: Module,
    status: RegistrationStatus | None = None,
) -> List[Registration]:
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
        user_id=user_id, event_id=event_id
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
        registration_obj = Registration.objects.create(
            user_id=user_id, event_id=event_id, status=registration_status
        )

    return registration_obj
