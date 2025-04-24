from django.apps import apps
from django.db.models import (
    QuerySet,
    Sum,
    Value,
    Case,
    When,
    Q,
    CharField,
    F,
    Subquery,
    OuterRef,
    Count,
    Exists,
    DateField,
    Func,
)
from django.db.models.functions import Coalesce, Cast, Concat, Substr
from django.utils import timezone

from comunicat.enums import Module

from django.conf import settings
from django.utils.translation import gettext_lazy as _

from comunicat.utils.managers import MoneyOutput
from payment.enums import PaymentType, PaymentStatus


class PaymentQuerySet(QuerySet):
    def with_dates(self):
        return self.annotate(
            date_accounting=Case(
                When(
                    Q(transaction__isnull=False),
                    then=F("transaction__date_accounting"),
                ),
                default=F("created_at__date"),
                output_field=DateField(),
            ),
            date_interest=Case(
                When(
                    Q(transaction__isnull=False),
                    then=F("transaction__date_interest"),
                ),
                default=F("date_accounting"),
                output_field=DateField(),
            ),
        )

    def with_balance(self):
        PaymentLine = apps.get_model("payment", "PaymentLine")

        return self.with_dates().annotate(
            balance=Coalesce(
                Subquery(
                    PaymentLine.objects.with_dates()
                    .filter(
                        payment__status=PaymentStatus.COMPLETED,
                        date_accounting__lte=OuterRef("date_accounting"),
                    )
                    .annotate(
                        actual_amount=Case(
                            When(
                                payment__type=PaymentType.CREDIT,
                                then=-F("amount"),
                            ),
                            default=F("amount"),
                            output_field=MoneyOutput(),
                        ),
                        balance=Func("actual_amount", function="Sum"),
                    )
                    .values("balance")[:1]
                ),
                Value(0),
                output_field=MoneyOutput(),
            )
        )

    def with_amount(self):
        return self.annotate(
            amount=Coalesce(Sum("lines__amount"), Value(0), output_field=MoneyOutput())
        )

    def with_description(self):
        Membership = apps.get_model("membership", "Membership")
        PaymentLine = apps.get_model("payment", "PaymentLine")

        return self.annotate(
            membership_year=Subquery(
                Membership.objects.filter(
                    modules__payment_lines__payment_id=OuterRef("id"),
                ).values("date_from")[:1]
            ),
            membership_year_str=Substr(Cast("membership_year", CharField()), 1, 4),
            line_text=Subquery(
                PaymentLine.objects.filter(payment_id=OuterRef("id"))
                .with_description()
                .values("text")[:1]
            ),
            lines_count=Count("lines"),
            is_update=Exists(
                PaymentLine.objects.filter(
                    item_id=OuterRef("lines__item_id"),
                    created_at__lt=OuterRef("created_at"),
                ).exclude(
                    id__in=OuterRef("lines__id"),
                )
            ),
            description=Case(
                When(
                    Q(
                        lines__item_type__app_label="membership",
                        lines__item_type__model="membershipmodule",
                    ),
                    then=Case(
                        When(
                            is_update=True,
                            then=Concat(
                                Value(str(_("Membership update"))),
                                Value(" "),
                                F("membership_year_str"),
                            ),
                        ),
                        default=Concat(
                            Value(str(_("Membership"))),
                            Value(" "),
                            F("membership_year_str"),
                        ),
                        output_field=CharField(),
                    ),
                ),
                When(Q(text__isnull=False), then=F("text")),
                When(Q(lines_count=1, line_text__isnull=False), then=F("line_text")),
                default=Value(str(_("Payment"))),
                output_field=CharField(),
            ),
        )


class AccountQuerySet(QuerySet):
    def with_amount(self):
        PaymentLine = apps.get_model("payment", "PaymentLine")

        return self.annotate(
            amount=Coalesce(
                Subquery(
                    PaymentLine.objects.filter(account_id=OuterRef("id"))
                    .with_dates()
                    .filter(date_accounting__year=timezone.localdate().year)
                    .values("account_id")
                    .annotate(amount=Sum("amount"))
                    .values("amount")[:1]
                ),
                Value(0),
                output_field=MoneyOutput(),
            )
        )


class PaymentLineQuerySet(QuerySet):
    def with_dates(self):
        return self.annotate(
            date_accounting=Case(
                When(
                    Q(payment__transaction__isnull=False),
                    then=F("payment__transaction__date_accounting"),
                ),
                default=F("payment__created_at__date"),
                output_field=DateField(),
            ),
            date_interest=Case(
                When(
                    Q(payment__transaction__isnull=False),
                    then=F("payment__transaction__date_interest"),
                ),
                default=F("date_accounting"),
                output_field=DateField(),
            ),
        )

    def with_balance(self):
        PaymentLine = apps.get_model("payment", "PaymentLine")

        return self.with_dates().annotate(
            balance=Coalesce(
                Subquery(
                    PaymentLine.objects.with_dates()
                    .filter(
                        payment__status=PaymentStatus.COMPLETED,
                        date_accounting__lte=OuterRef("date_accounting"),
                    )
                    .annotate(
                        actual_amount=Case(
                            When(
                                payment__type=PaymentType.CREDIT,
                                then=-F("amount"),
                            ),
                            default=F("amount"),
                            output_field=MoneyOutput(),
                        ),
                        balance=Func("actual_amount", function="Sum"),
                    )
                    .values("balance")[:1]
                ),
                Value(0),
                output_field=MoneyOutput(),
            )
        )

    def with_description(self):
        PaymentLine = apps.get_model("payment", "PaymentLine")

        return self.annotate(
            is_update=Exists(
                PaymentLine.objects.filter(
                    item_id=OuterRef("item_id"),
                    created_at__lt=OuterRef("created_at"),
                ).exclude(
                    id=OuterRef("id"),
                )
            ),
            description=Case(
                When(
                    Q(
                        item_type__app_label="membership",
                        item_type__model="membershipmodule",
                    ),
                    then=Case(
                        When(
                            membership_module__module=Module.ORG,
                            then=Case(
                                When(
                                    is_update=True,
                                    then=Value(
                                        f"{str(_('Membership update'))} {settings.MODULE_ORG_SHORT_NAME}"
                                    ),
                                ),
                                default=Value(
                                    f"{str(_('Membership'))} {settings.MODULE_ORG_SHORT_NAME}"
                                ),
                                output_field=CharField(),
                            ),
                        ),
                        When(
                            membership_module__module=Module.TOWERS,
                            then=Case(
                                When(
                                    is_update=True,
                                    then=Value(
                                        f"{str(_('Membership update'))} {settings.MODULE_TOWERS_SHORT_NAME}"
                                    ),
                                ),
                                default=Value(
                                    f"{str(_('Membership'))} {settings.MODULE_TOWERS_SHORT_NAME}"
                                ),
                                output_field=CharField(),
                            ),
                        ),
                        When(
                            is_update=True,
                            then=Value(str(_("Membership update"))),
                        ),
                        default=Value(str(_("Membership"))),
                        output_field=CharField(),
                    ),
                ),
                When(Q(text__isnull=False), then=F("text")),
                When(Q(receipt__isnull=False), then=F("receipt__description")),
                default=Value(str(_("Unspecified"))),
                output_field=CharField(),
            ),
        )


class ExpenseQuerySet(QuerySet):
    def with_amount(self):
        return self.annotate(
            amount=Coalesce(
                Sum("receipts__amount"), Value(0), output_field=MoneyOutput()
            )
        )

    def with_description(self):
        Receipt = apps.get_model("payment", "Receipt")

        return self.annotate(
            receipt_text=Subquery(
                Receipt.objects.filter(expense_id=OuterRef("id"))
                .order_by("date")
                .values("description")[:1]
            ),
            receipts_count=Count("receipts"),
            description=Case(
                When(
                    Q(receipts_count=1, receipt_text__isnull=False),
                    then=F("receipt_text"),
                ),
                When(
                    Q(receipt_text__isnull=False),
                    then=Concat(
                        F("receipt_text"), Value(" "), Value(str(_("(and more)")))
                    ),
                ),
                default=Value(str(_("Expense"))),
                output_field=CharField(),
            ),
        )
