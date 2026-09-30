import itertools
from uuid import UUID

from django.conf import settings
from django.db import transaction
from django.db.models import Exists, OuterRef, Prefetch, Q, Value

import notify.tasks
from comunicat.enums import Module
from notify.enums import EmailType
from payment.enums import PaymentStatus
from payment.models import PaymentRequest, PaymentRequestLine, PaymentRequestLog
from user.enums import FamilyMemberStatus
from user.models import FamilyMember


def get_list(
    module: Module, payment_request_id: UUID | None = None, user_id: UUID | None = None
) -> list[PaymentRequest]:
    payment_request_filter = Q()

    if payment_request_id:
        payment_request_filter &= Q(id=payment_request_id)

    if user_id:
        payment_request_filter &= Q(entity__user_id=user_id) | Q(is_user_related=True)

    return list(
        PaymentRequest.objects.annotate(
            is_user_related=(
                Exists(
                    FamilyMember.objects.filter(
                        status=FamilyMemberStatus.ACTIVE,
                        user_id=user_id,
                        family__members__user_id=OuterRef("entity__user_id"),
                    )
                )
                if user_id and settings.MODULE_ALL_FAMILY_SHARE_PAYMENTS
                else Value(False)
            )
        )
        .filter(payment_request_filter)
        .exclude(status=PaymentStatus.CANCELED)
        .select_related("entity")
        .prefetch_related(
            Prefetch(
                "lines",
                PaymentRequestLine.objects.order_by("amount", "text"),
            ),
            Prefetch("logs", PaymentRequestLog.objects.all().order_by("-created_at")),
        )
        .with_amount()
        .order_by("-created_at", "id")
        .distinct()
    )


def get(
    module: Module,
    payment_request_id: UUID | None = None,
    user_id: UUID | None = None,
) -> PaymentRequest | None:
    return (
        get_list(
            module=module,
            payment_request_id=payment_request_id,
            user_id=user_id,
        )
        + [None]
    )[0]


@transaction.atomic
def complete_lines(
    request_line_ids: list[UUID],
    is_completed: bool = True,
    with_notify: bool = True,
) -> bool:
    payment_request_line_objs = list(
        PaymentRequestLine.objects.filter(
            id__in=request_line_ids,
            status__lte=PaymentStatus.PROCESSING,
        )
        .select_related("request", "line", "line__payment")
        .distinct()
    )

    payment_request_objs = list(
        {
            payment_request_line_obj.request_id: payment_request_line_obj.request
            for payment_request_line_obj in payment_request_line_objs
        }.values()
    )

    if not payment_request_line_objs:
        return False

    payment_status = (
        PaymentStatus.COMPLETED if is_completed else PaymentStatus.PROCESSING
    )

    for payment_request_line_obj in payment_request_line_objs:
        payment_request_line_obj.status = payment_status

    PaymentRequestLine.objects.bulk_update(
        payment_request_line_objs, fields=("status",)
    )

    for payment_request_obj in payment_request_objs:
        payment_request_obj.status = payment_status

    PaymentRequest.objects.bulk_update(payment_request_objs, fields=("status",))

    # TODO: This can produce wrong results but for now this will only be called for a single payment request
    for (
        __,
        current_payment_request_line_objs,
    ) in itertools.groupby(
        payment_request_line_objs,
        lambda payment_request_line_obj: payment_request_line_obj.line
        and payment_request_line_obj.line.payment,
    ):
        if with_notify:
            current_payment_request_line_objs = list(current_payment_request_line_objs)
            payment_request_obj = current_payment_request_line_objs[0].request
            payment_line_obj = current_payment_request_line_objs[0].line

            if not payment_line_obj:
                continue

            transaction.on_commit(
                lambda: notify.tasks.send_payment_email.delay(
                    payment_id=payment_line_obj.payment_id,
                    email_type=EmailType.PAYMENT_PAID,
                    module=payment_request_obj.module,
                )
            )

    return True
