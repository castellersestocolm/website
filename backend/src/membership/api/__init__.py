from typing import List
from uuid import UUID

from django.conf import settings
from django.db import transaction
from django.db.models import Prefetch, Q
from django.utils import timezone
from djmoney.money import Money

import notify.tasks
from comunicat.enums import Module
from membership.enums import MembershipStatus
from membership.models import Membership, MembershipModule, MembershipUser
from membership.types import MembershipRenewModule, MembershipRenewOption
from membership.utils import (
    get_membership_amount,
    get_membership_date_to,
    get_membership_length,
)
from notify.enums import EmailType
from user.enums import FamilyMemberStatus
from user.models import FamilyMember, User


def get_list(
    user_id: UUID, module: Module, filter_status: list[MembershipStatus] | None = None
) -> List[Membership]:
    membership_filter = Q()

    if filter_status:
        membership_filter &= Q(status__in=filter_status)

    return list(
        Membership.objects.filter(membership_filter, membership_users__user_id=user_id)
        .with_amount()
        .prefetch_related(
            Prefetch(
                "modules",
                MembershipModule.objects.filter(membership_filter).order_by("module"),
            )
        )
        .order_by("-date_from")
    )


@transaction.atomic
def renew(membership_id: UUID) -> Membership | None:
    membership_obj = (
        Membership.objects.filter(id=membership_id)
        .prefetch_related("modules", "membership_users")
        .first()
    )

    if not membership_obj:
        return None

    if hasattr(membership_obj, "new"):
        return membership_obj.new

    user_ids = membership_obj.membership_users.values_list("user_id", flat=True)

    membership_length = get_membership_length(member_count=len(user_ids))

    if not membership_length:
        return None

    date_to = get_membership_date_to(months=membership_length)

    if not date_to:
        return None

    if date_to <= membership_obj.date_to:
        return membership_obj

    new_membership_obj = Membership.objects.create(
        date_from=timezone.localdate(),
        date_to=date_to,
        previous=membership_obj,
    )

    for membership_module_obj in membership_obj.modules.all():
        membership_amount = get_membership_amount(
            member_count=len(user_ids), module=membership_module_obj.module
        )
        new_amount = Money(
            amount=membership_amount, currency=settings.MODULE_ALL_CURRENCY
        )
        MembershipModule.objects.create(
            membership_id=new_membership_obj.id,
            module=membership_module_obj.module,
            amount=new_amount,
        )

    for membership_user_obj in membership_obj.membership_users.all():
        MembershipUser.objects.get_or_create(
            user_id=membership_user_obj.user_id,
            membership_id=new_membership_obj.id,
            family_id=membership_user_obj.family_id,
        )

    return new_membership_obj


def create_or_update(user_id: UUID, modules: list[Module]) -> Membership | None:
    user_obj = User.objects.filter(id=user_id).select_related("family_member").first()
    family_id = (
        user_obj.family_member.family_id if hasattr(user_obj, "family_member") else None
    )

    if family_id is None:
        user_ids = [user_id]
    else:
        user_ids = list(
            {user_id}
            | {
                family_member_obj.user_id
                for family_member_obj in FamilyMember.objects.filter(
                    family_id=family_id, status=FamilyMemberStatus.ACTIVE
                )
            }
        )

    membership_length = get_membership_length(member_count=len(user_ids))

    if not membership_length:
        return None

    date_to = get_membership_date_to(months=membership_length)

    if not date_to:
        return None

    # TODO: Check for updates, merges and splits + partial amounts
    # TODO: Handle renewals

    membership_user_objs = list(
        MembershipUser.objects.filter(
            user_id__in=user_ids,
            membership__date_end__isnull=True,
            membership__date_to__gte=timezone.localdate()
            + timezone.timedelta(days=settings.MODULE_ALL_MEMBERSHIP_RENEW_DAYS),
        )
        .with_family_role()
        .order_by("-family_role")
    )

    with transaction.atomic():
        membership_obj = None
        for membership_user_obj in membership_user_objs:
            membership_obj = membership_user_obj.membership
            break

        if not membership_obj:
            membership_obj = Membership.objects.create(
                date_from=timezone.localdate(),
                date_to=date_to,
            )

        modules = list(set(modules) | set(settings.MODULE_ALL_MEMBERSHIP_REQUIRED))

        membership_status = membership_obj.status

        for module in modules:
            membership_amount = get_membership_amount(
                member_count=len(user_ids), module=module
            )
            new_amount = Money(
                amount=membership_amount, currency=settings.MODULE_ALL_CURRENCY
            )
            membership_module_obj, __ = MembershipModule.objects.get_or_create(
                membership_id=membership_obj.id,
                module=module,
                defaults={"amount": new_amount},
            )

            if new_amount > membership_module_obj.amount:
                membership_module_obj.amount = new_amount
                membership_module_obj.status = MembershipStatus.REQUESTED
                membership_module_obj.save(update_fields=("amount", "status"))
                membership_status = MembershipStatus.REQUESTED

        if membership_status != membership_obj.status:
            membership_obj.status = membership_status
            membership_obj.save(update_fields=("status",))

        for user_id in user_ids:
            MembershipUser.objects.get_or_create(
                user_id=user_id,
                membership_id=membership_obj.id,
                defaults={"family_id": family_id},
            )

    # TODO: Perhaps no need to create the payment but do it only on importing transactions
    # # Create or update the payment
    # payment.api.membership.create_or_update_payment(membership_id=membership_obj.id)

    return (
        Membership.objects.filter(id=membership_obj.id)
        .with_amount()
        .prefetch_related(
            Prefetch("modules", MembershipModule.objects.order_by("module"))
        )
        .order_by("-date_from")
    ).first()


def get_renew_options(user_id: UUID) -> list[MembershipRenewOption]:
    user_obj = User.objects.filter(id=user_id).select_related("family_member").first()
    family_id = (
        user_obj.family_member.family_id if hasattr(user_obj, "family_member") else None
    )

    if family_id is None:
        user_ids = [user_id]
    else:
        user_ids = list(
            {user_id}
            | {
                family_member_obj.user_id
                for family_member_obj in FamilyMember.objects.filter(
                    family_id=family_id, status=FamilyMemberStatus.ACTIVE
                )
            }
        )

    membership_length = get_membership_length(member_count=len(user_ids))

    if not membership_length:
        return []

    date_to = get_membership_date_to(months=membership_length)

    if not date_to:
        return []

    membership_renew_options = []

    for module in Module:
        modules = list({module} | set(settings.MODULE_ALL_MEMBERSHIP_REQUIRED))
        membership_renew_modules = []
        current_amount = None
        for current_module in modules:
            membership_amount = get_membership_amount(
                member_count=len(user_ids), module=current_module
            )
            new_amount = Money(
                amount=membership_amount, currency=settings.MODULE_ALL_CURRENCY
            )
            membership_renew_modules.append(
                MembershipRenewModule(module=current_module, amount=new_amount)
            )
            current_amount = (
                current_amount + new_amount if current_amount else new_amount
            )

        membership_renew_options.append(
            MembershipRenewOption(
                modules=membership_renew_modules, amount=current_amount, date_to=date_to
            )
        )

    return membership_renew_options


@transaction.atomic
def complete(
    membership_module_ids: list[UUID],
    is_completed: bool = True,
    with_notify: bool = True,
) -> bool:
    membership_module_objs = list(
        MembershipModule.objects.filter(
            id__in=membership_module_ids, status__lte=MembershipStatus.PROCESSING
        )
        .select_related("membership")
        .prefetch_related(
            "membership__membership_users", "membership__membership_users__user"
        )
    )

    membership_objs = {
        membership_module_obj.membership
        for membership_module_obj in membership_module_objs
    }

    if not membership_module_objs or len(membership_objs) != 1:
        return False

    membership_obj = list(membership_objs)[0]

    for membership_module_obj in membership_module_objs:
        membership_module_obj.status = (
            MembershipStatus.ACTIVE if is_completed else MembershipStatus.PROCESSING
        )

    MembershipModule.objects.bulk_update(membership_module_objs, fields=("status",))

    if membership_obj.status != MembershipStatus.ACTIVE:
        membership_obj.status = (
            MembershipStatus.ACTIVE if is_completed else MembershipStatus.PROCESSING
        )
        membership_obj.save(update_fields=("status",))

    if with_notify:
        for membership_user_obj in membership_obj.membership_users.all():
            if not membership_user_obj.user.can_manage:
                continue

            transaction.on_commit(
                lambda: notify.tasks.send_user_email.delay(
                    user_id=membership_user_obj.user_id,
                    email_type=EmailType.MEMBERSHIP_PAID,
                    module=membership_user_obj.user.origin_module,
                )
            )

    return True
