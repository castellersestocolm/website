from uuid import UUID

from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.db.models import Prefetch, Q

from membership.enums import MembershipStatus
from membership.models import Membership, MembershipUser
from membership.utils import get_membership_account
from payment.enums import PaymentType, PaymentStatus, AccountCategory
from payment.models import Payment, PaymentLine, Entity, Account

from django.conf import settings


def create_or_update_payment(membership_id: UUID) -> Payment | None:
    membership_obj = (
        Membership.objects.filter(id=membership_id)
        .prefetch_related(
            "modules",
            Prefetch(
                "membership_users",
                MembershipUser.objects.with_family_role().order_by("-family_role"),
            ),
        )
        .first()
    )

    if not membership_obj:
        return None

    # TODO: Fix when payment exists before registration

    item_type = ContentType.objects.get_by_natural_key("membership", "membershipmodule")

    with transaction.atomic():
        membership_module_objs = list(membership_obj.modules.all())
        payment_line_by_membership_module_id = {
            UUID(payment_line_obj.item_id): payment_line_obj
            for payment_line_obj in PaymentLine.objects.filter(
                item_type=item_type,
                item_id__in=[
                    membership_module_obj.id
                    for membership_module_obj in membership_module_objs
                ],
                payment__type=PaymentType.DEBIT,
            )
        }
        payment_line_by_missing_membership_module_type = {
            payment_line_obj.account.module: payment_line_obj
            for payment_line_obj in PaymentLine.objects.filter(
                item_id__isnull=True,
                account__category=AccountCategory.MEMBERSHIPS,
                payment__entity__user__in=[
                    membership_user_obj.user
                    for membership_user_obj in membership_obj.membership_users.all()
                ],
                payment__type=PaymentType.DEBIT,
            )
        }

        membership_user_objs = list(membership_obj.membership_users.all())

        if not membership_user_objs:
            return None

        membership_user_obj = membership_user_objs[0]

        entity_obj, __ = Entity.objects.update_or_create(
            email=membership_user_obj.user.email,
            defaults={
                "firstname": membership_user_obj.user.firstname,
                "lastname": membership_user_obj.user.lastname,
                "phone": membership_user_obj.user.phone,
                "user_id": membership_user_obj.user_id,
            },
        )

        all_included = True
        membership_status = membership_obj.status
        for membership_module_obj in membership_module_objs:
            if (
                membership_module_obj.id not in payment_line_by_membership_module_id
                or membership_module_obj.amount
                != payment_line_by_membership_module_id[membership_module_obj.id].amount
            ):
                if (
                    membership_module_obj.module
                    in payment_line_by_missing_membership_module_type
                ):
                    payment_line_obj = payment_line_by_missing_membership_module_type[
                        membership_module_obj.module
                    ]
                    payment_line_obj.item_type = item_type
                    payment_line_obj.item_id = membership_module_obj.id
                    payment_line_obj.save(
                        update_fields=(
                            "item_id",
                            "item_type",
                        )
                    )
                    payment_line_by_membership_module_id[membership_module_obj.id] = (
                        payment_line_obj
                    )

                    if payment_line_obj.payment.status != PaymentStatus.COMPLETED:
                        membership_status = membership_obj.status
                else:
                    all_included = False
            elif membership_module_obj.id in payment_line_by_membership_module_id:
                if (
                    payment_line_by_membership_module_id[
                        membership_module_obj.id
                    ].payment.status
                    != PaymentStatus.COMPLETED
                ):
                    membership_status = membership_obj.status

        if membership_status != membership_obj.status:
            membership_obj.status = membership_status
            membership_obj.save(update_fields=("status",))

        # No changes detected
        if all_included:
            return None

        account_by_code = {
            account_obj.code: account_obj for account_obj in Account.objects.all()
        }

        payment_objs = list(
            Payment.objects.filter(
                lines__item_type=item_type,
                lines__membership_module__membership_id=membership_obj.id,
            ).order_by("created_at")
        )
        payment_pending_objs = [
            payment_obj
            for payment_obj in payment_objs
            if payment_obj.status == PaymentStatus.PENDING
        ]
        payment_pending_obj = payment_pending_objs[0] if payment_pending_objs else None

        for membership_module_obj in membership_module_objs:
            account_code = get_membership_account(
                member_count=len(membership_user_objs),
                module=membership_module_obj.module,
            )

            account_obj = None
            if account_code:
                account_obj = account_by_code.get(account_code)

                # Move old payments to the new accounts
                for payment_obj in payment_objs:
                    PaymentLine.objects.filter(
                        payment=payment_obj,
                        item_type=item_type,
                        item_id=membership_module_obj.id,
                    ).update(account=account_obj)

            if membership_module_obj.id not in payment_line_by_membership_module_id:
                if not payment_pending_obj:
                    payment_pending_obj = Payment.objects.create(
                        entity=entity_obj,
                        type=PaymentType.DEBIT,
                        status=PaymentStatus.PENDING,
                    )

                PaymentLine.objects.create(
                    payment=payment_pending_obj,
                    amount=membership_module_obj.amount,
                    vat=settings.MODULE_ALL_VAT,
                    item_type=item_type,
                    item_id=membership_module_obj.id,
                    account=account_obj,
                )
            elif (
                membership_module_obj.amount
                > payment_line_by_membership_module_id[membership_module_obj.id].amount
            ):
                payment_line_obj = payment_line_by_membership_module_id[
                    membership_module_obj.id
                ]
                if payment_line_obj.payment.status > PaymentStatus.PENDING:
                    if not payment_pending_obj:
                        payment_pending_obj = Payment.objects.create(
                            entity=entity_obj,
                            type=PaymentType.DEBIT,
                            status=PaymentStatus.PENDING,
                        )

                    PaymentLine.objects.create(
                        payment=payment_pending_obj,
                        amount=membership_module_obj.amount - payment_line_obj.amount,
                        vat=settings.MODULE_ALL_VAT,
                        item_type=item_type,
                        item_id=membership_module_obj.id,
                        account=account_obj,
                    )
                else:
                    payment_line_obj.amount = membership_module_obj.amount
                    payment_line_obj.save(update_fields=("amount",))

    return payment_pending_obj
