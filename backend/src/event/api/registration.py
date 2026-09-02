import itertools
from uuid import UUID

from django.db import transaction
from django.db.models import Prefetch, Q
from django.utils import timezone

import notify.tasks
import payment.api.entity
from comunicat.enums import Module
from event.api import get_event_price
from event.consts import REGISTRATION_CLEAN_STATUS_REQUESTED_HOURS
from event.enums import RegistrationStatus
from event.models import Event, Registration
from event.utils.event import get_registration_initial_status
from notify.enums import EmailType
from user.models import FamilyMember


def get_list(
    module: Module,
    registration_id: UUID | None = None,
    user_id: UUID | None = None,
    event_ids: list[UUID] | None = None,
    for_admin: bool = False,
) -> list[Registration]:
    if not for_admin and not user_id and not registration_id:
        return []

    registration_filter = Q()

    if registration_id:
        registration_filter &= Q(id=registration_id)

    if event_ids:
        registration_filter &= Q(event_id__in=event_ids)

    if not for_admin and user_id:
        registration_filter &= Q(
            entity__user_id=user_id, status=RegistrationStatus.ACTIVE
        )

    registration_queryset = Registration.objects.filter(registration_filter)

    if user_id:
        family_user_ids = [
            family_member_obj.user_id
            for family_member_obj in FamilyMember.objects.filter(
                family__members__user_id=user_id
            )
        ]
        if not family_user_ids:
            family_user_ids = [user_id]
    else:
        family_user_ids = []

    event_registration_filter = Q(entity__user_id__in=family_user_ids)

    if user_id:
        event_registration_filter |= Q(owner__user_id=user_id)

    if for_admin or user_id:
        registration_queryset = registration_queryset.filter_with_user()

    return list(
        # TODO: Allow non-user registrations but add support for entity on serializer instead before
        registration_queryset.select_related(
            "event",
            "entity",
            "entity__user",
            "price",
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
            Prefetch(
                "event__registrations",
                (
                    Registration.objects.filter(event_registration_filter)
                    .select_related("entity", "entity__user")
                    .with_amount()
                    if user_id
                    else Registration.objects.none()
                ),
            ),
        )
        .with_amount()
        .order_by("-event__time_from", "created_at")
    )


def get(
    module: Module,
    registration_id: UUID | None = None,
) -> Registration | None:
    return (
        get_list(
            registration_id=registration_id,
            module=module,
        )
        + [None]
    )[0]


def delete(
    registration_id: UUID, request_user_id: UUID, module: Module
) -> Registration | None:
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
        return None

    registration_obj.status = RegistrationStatus.CANCELLED
    registration_obj.save(update_fields=("status",))

    notify.tasks.send_registration_message_slack.delay(
        registration_id=registration_obj.id,
    )

    return get(registration_id=registration_obj.id, module=module)


# TODO: Check if over the limit of registrations AND if registration already opened
# TODO: Add limit of registrations per person
# TODO: Don't allow if the registration exists, has an owner and doesn't match
def create(  # noqa: C901
    entity_id: UUID,
    event_id: UUID,
    module: Module,
    status: RegistrationStatus | None = None,
    owner_id: UUID | None = None,
    request_user_id: UUID | None = None,
    data: dict | None = None,
) -> Registration | None:
    event_obj = (
        Event.objects.filter(id=event_id).with_module_information(module=module).first()
    )

    if not event_obj:
        return None

    if not data:
        data = {}

    if event_obj.require_user:
        if request_user_id:
            family_entity_ids = [
                family_member_obj.user.entity.id
                for family_member_obj in FamilyMember.objects.filter(
                    family__members__user_id=request_user_id
                ).select_related("user", "user__entity")
                if hasattr(family_member_obj.user, "entity")
            ]
            if entity_id not in family_entity_ids:
                return None
        else:
            return None

    registration_obj = Registration.objects.filter(
        entity_id=entity_id, event_id=event_id
    ).first()

    if event_obj.require_approve:
        event_price_obj = get_event_price(
            entity_id=entity_id,
            event_id=event_id,
        )
        if not event_price_obj:
            return None
    else:
        event_price_obj = None

    # TODO: Change this, for now allow only creating with cancelled if specified
    if status is not None and status == RegistrationStatus.CANCELLED:
        registration_status = status
    else:
        registration_status = get_registration_initial_status(
            require_approve=event_obj.require_approve,
            amount=event_price_obj and event_price_obj.amount,
        )

    if request_user_id:
        owner_id = payment.api.entity.get_entity_by_key(user_id=request_user_id).id

    if not owner_id:
        owner_id = entity_id

    if registration_obj:
        registration_obj.status = registration_status
        registration_obj.price = event_price_obj
        registration_obj.data = {**registration_obj.data, **data}

        if not registration_obj.owner:
            registration_obj.owner_id = owner_id

        registration_obj.save(update_fields=("status", "price", "data", "owner"))
    else:
        registration_obj = Registration.objects.create(
            entity_id=entity_id,
            owner_id=owner_id,
            event_id=event_id,
            status=registration_status,
            price=event_price_obj,
            data=data,
        )

    notify.tasks.send_registration_message_slack.delay(
        registration_id=registration_obj.id,
    )

    return get(registration_id=registration_obj.id, module=module)


@transaction.atomic
def complete(registration_ids: list[UUID], with_notify: bool = True) -> bool:
    registration_objs = list(
        Registration.objects.filter(
            id__in=registration_ids, status=RegistrationStatus.REQUESTED
        ).select_related("event")
    )

    event_objs = {registration_obj.event for registration_obj in registration_objs}

    if not registration_objs or len(event_objs) != 1:
        return False

    # TODO: Check if this goes above the limit for the event
    for registration_obj in registration_objs:
        registration_obj.status = RegistrationStatus.ACTIVE

    Registration.objects.bulk_update(registration_objs, fields=("status",))

    if with_notify:
        for (
            event_obj,
            event_registration_objs,
        ) in itertools.groupby(
            registration_objs,
            lambda registration_obj: registration_obj.event,
        ):
            registration_ids = [
                event_registration_obj.id
                for event_registration_obj in event_registration_objs
            ]
            transaction.on_commit(
                lambda: notify.tasks.send_registration_email.delay(
                    registration_ids=registration_ids,
                    email_type=EmailType.REGISTRATION_PAID,
                    module=event_obj.module,
                )
            )

    return True


def clean_pending_registrations() -> None:
    registration_ids = list(
        Registration.objects.filter(
            status=RegistrationStatus.REQUESTED,
            line__isnull=True,
            created_at__lte=timezone.now()
            - timezone.timedelta(hours=REGISTRATION_CLEAN_STATUS_REQUESTED_HOURS)
            - timezone.timedelta(minutes=5),
        ).values_list("id", flat=True)
    )

    Registration.objects.filter(id__in=registration_ids).update(
        status=RegistrationStatus.CANCELLED
    )
