from typing import List
from uuid import UUID

from django.db.models import Prefetch
from django.utils import translation
from rest_framework.exceptions import ValidationError

from comunicat.enums import Module
from notify.enums import EmailType
from user.enums import FamilyMemberRole, FamilyMemberStatus, FamilyMemberRequestStatus
from user.models import FamilyMember, User, Family, FamilyMemberRequest
from notify.tasks import send_user_email

from django.utils.translation import gettext_lazy as _

from django.conf import settings

import membership.api


def create(
    user_id: UUID,
    email: str,
    module: Module,
) -> FamilyMemberRequest | None:
    user_sender_obj = (
        User.objects.filter(id=user_id)
        .prefetch_related(
            Prefetch(
                "family_member__family__members",
                FamilyMember.objects.filter(
                    status__in=(FamilyMemberStatus.REQUESTED, FamilyMemberStatus.ACTIVE)
                ).order_by("-role", "user__firstname", "user__lastname"),
            )
        )
        .first()
    )

    if not user_sender_obj:
        return None

    user_receiver_obj = User.objects.filter(email=email).first()

    if (
        FamilyMemberRequest.objects.filter(
            user_sender_id=user_id, status=FamilyMemberRequestStatus.REQUESTED
        ).count()
        >= 5
    ):
        raise ValidationError(
            _(
                "You have too many pending requests, cancel some of them before you send a new one."
            )
        )

    if hasattr(user_sender_obj, "family_member"):
        existing_family_member_user_objs = [
            family_member_obj.user
            for family_member_obj in user_sender_obj.family_member.family.members.all()
        ]

        if user_receiver_obj:
            if user_receiver_obj in existing_family_member_user_objs:
                raise ValidationError(_("The member already belongs to your family."))

        if (
            len(existing_family_member_user_objs)
            > settings.MODULE_ALL_MEMBERSHIP_LIMIT_ALL
        ):
            raise ValidationError(
                _("You have reached the maximum amount of members in your family.")
            )

        if (
            len(
                [
                    user_obj
                    for user_obj in existing_family_member_user_objs
                    if user_obj.is_adult
                ]
            )
            > settings.MODULE_ALL_MEMBERSHIP_LIMIT_ADULTS
        ):
            raise ValidationError(
                _(
                    "You have reached the maximum amount of adult members in your family."
                )
            )

        family_obj = user_sender_obj.family_member.family
    else:
        family_obj = Family.objects.create()
        FamilyMember.objects.create(
            user=user_sender_obj,
            family=family_obj,
            role=FamilyMemberRole.MANAGER,
            status=FamilyMemberStatus.ACTIVE,
        )

    # TODO: Don't create if a pending request with that email already exists + DB CONSTRAINT

    family_member_request_obj = FamilyMemberRequest.objects.filter(
        user_sender=user_sender_obj,
        email_receiver=email,
        status=FamilyMemberRequestStatus.REQUESTED,
    )

    if not family_member_request_obj:
        family_member_request_obj = FamilyMemberRequest.objects.create(
            user_sender=user_sender_obj,
            email_receiver=email,
            user_receiver=user_receiver_obj,
            family=family_obj,
        )

    send_user_email.delay(
        user_id=user_receiver_obj.id if user_receiver_obj else None,
        email=email,
        email_type=EmailType.FAMILY_INVITE,
        module=module,
        context={
            "user_sender_obj": {
                "firstname": user_sender_obj.firstname,
                "lastname": user_sender_obj.lastname,
            }
        },
    )

    return family_member_request_obj


def get_list_sent(
    user_id: UUID,
    module: Module,
) -> List[FamilyMemberRequest]:
    return list(
        FamilyMemberRequest.objects.filter(user_sender_id=user_id)
        .select_related("user_sender", "user_receiver", "family")
        .prefetch_related(
            "family__members",
            "family__members__user",
            "family__members__user__towers",
            "family__members__user__emails",
            "family__members__user__members",
            "family__members__user__members__team",
            "family__members__user__members__role",
        )
        .order_by("status", "created_at")
    )


def get_list_received(
    user_id: UUID,
    module: Module,
) -> List[FamilyMemberRequest]:
    return list(
        FamilyMemberRequest.objects.filter(user_receiver_id=user_id)
        .select_related("user_sender", "user_receiver", "family")
        .prefetch_related(
            "family__members",
            "family__members__user",
            "family__members__user__towers",
            "family__members__user__emails",
            "family__members__user__members",
            "family__members__user__members__team",
            "family__members__user__members__role",
        )
        .order_by("status", "created_at")
    )


def delete(id: UUID, user_id: UUID, module: Module) -> bool:
    family_member_request_obj = FamilyMemberRequest.objects.filter(
        id=id, user_sender_id=user_id, status=FamilyMemberRequestStatus.REQUESTED
    ).first()

    if not family_member_request_obj:
        return False

    family_member_request_obj.status = FamilyMemberRequestStatus.DELETED
    family_member_request_obj.save(update_fields=("status",))

    return True


def accept(id: UUID, user_id: UUID, module: Module) -> bool:
    family_member_request_obj = FamilyMemberRequest.objects.filter(
        id=id, user_receiver_id=user_id, status=FamilyMemberRequestStatus.REQUESTED
    ).first()

    if not family_member_request_obj:
        return False

    family_member_request_obj.status = FamilyMemberRequestStatus.ACCEPTED
    family_member_request_obj.save(update_fields=("status",))

    user_obj = family_member_request_obj.user_receiver

    if hasattr(user_obj, "family_member"):
        move_user_objs = [user_obj]
        old_family_obj = user_obj.family_member.family

        if user_obj.family_member.role == FamilyMemberRole.MANAGER:
            move_user_objs += [
                family_member_obj.user
                for family_member_obj in FamilyMember.objects.filter(
                    family=old_family_obj
                ).exclude(user_id=user_obj.id)
            ]

        for move_user_obj in move_user_objs:
            move_user_obj.family_member.family = family_member_request_obj.family
            move_user_obj.family_member.save(update_fields=("family",))

        if not FamilyMember.objects.filter(family=old_family_obj).exists():
            Family.objects.filter(id=old_family_obj.id).delete()
    else:
        FamilyMember.objects.create(
            user=user_obj,
            family=family_member_request_obj.family,
            role=FamilyMemberRole.MEMBER,
            status=FamilyMemberStatus.ACTIVE,
        )

    # TODO: Merge families

    # Add the user to the existing membership
    membership.api.create_or_update(
        user_id=user_obj.id,
        modules=[module],
    )

    return True


def reject(id: UUID, user_id: UUID, module: Module) -> bool:
    family_member_request_obj = FamilyMemberRequest.objects.filter(
        id=id, user_receiver_id=user_id, status=FamilyMemberRequestStatus.REQUESTED
    ).first()

    if not family_member_request_obj:
        return False

    family_member_request_obj.status = FamilyMemberRequestStatus.REJECTED
    family_member_request_obj.save(update_fields=("status",))

    return True


def link(email: str) -> None:
    user_obj = User.objects.filter(email=email).first()

    if not user_obj:
        return None

    FamilyMemberRequest.objects.filter(
        email_receiver=email, status=FamilyMemberRequestStatus.REQUESTED
    ).update(user_receiver=user_obj)
