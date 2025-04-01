from typing import List
from uuid import UUID

from django.db.models import Prefetch, Q, Exists, OuterRef, Case, When, F, DateField

from comunicat.enums import Module
from payment.enums import PaymentStatus
from payment.models import Payment, PaymentLine, PaymentLog
from user.enums import FamilyMemberStatus
from user.models import FamilyMember

from django.conf import settings


def get_list(user_id: UUID, module: Module) -> List[Payment]:
    return list(
        Payment.objects.annotate(
            is_user_related=(
                Exists(
                    FamilyMember.objects.filter(
                        status=FamilyMemberStatus.ACTIVE,
                        user_id=user_id,
                        family__members__user_id=OuterRef("entity__user_id"),
                    )
                )
                if settings.MODULE_ALL_FAMILY_SHARE_PAYMENTS
                else Exists(
                    FamilyMember.objects.filter(
                        status=FamilyMemberStatus.ACTIVE,
                        user_id=user_id,
                        family__membership_users__membership__modules__payment_lines__payment_id=OuterRef(
                            "id"
                        ),
                    )
                )
            )
        )
        .filter(Q(entity__user_id=user_id) | Q(is_user_related=True))
        .exclude(status=PaymentStatus.CANCELED)
        .annotate(
            date=Case(
                When(transaction__isnull=False, then=F("transaction__date_accounting")),
                output_field=DateField(),
                # Warning: Potentially incorrect depending on the timezone
                default=F("created_at__date"),
            )
        )
        .select_related("entity", "transaction")
        .prefetch_related(
            Prefetch(
                "lines", PaymentLine.objects.with_description().order_by("amount")
            ),
            Prefetch("logs", PaymentLog.objects.all().order_by("-created_at")),
        )
        .with_amount()
        .with_description()
        .order_by("-date", "-created_at")
    )
