from django.apps import apps
from django.conf import settings
from django.db.models import (
    BooleanField,
    Case,
    CharField,
    Count,
    DateField,
    Exists,
    F,
    Func,
    IntegerField,
    OuterRef,
    Q,
    QuerySet,
    Subquery,
    Sum,
    UUIDField,
    Value,
    When,
)
from django.db.models.fields.json import KeyTextTransform
from django.db.models.functions import Cast, Coalesce, Concat, Substr
from django.utils import timezone, translation
from django.utils.translation import gettext_lazy as _

from comunicat.enums import Module
from comunicat.utils.managers import MoneyOutput
from consent.enums import ConsentType
from payment.enums import PaymentStatus, PaymentType, SourceType


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

    def with_balance(self, for_payment: bool = True):
        PaymentLine = apps.get_model("payment", "PaymentLine")
        Source = apps.get_model("payment", "Source")

        source_objs = list(
            Source.objects.filter_type_bank() if for_payment else Source.objects.all()
        )
        balance_sum = F("balance_")
        for source_obj in source_objs:
            balance_sum += F(f"balance_{source_obj.code}")

        return self.with_dates().annotate(
            **{
                f"balance_{source_obj.code if source_obj else ''}": Coalesce(
                    Subquery(
                        PaymentLine.objects.with_dates()
                        .filter(
                            (
                                (
                                    Q(
                                        Q(payment__transaction__source_id=source_obj.id)
                                        | Q(
                                            payment__transaction__source__source_bank_id=source_obj.id
                                        )
                                    )
                                    if for_payment
                                    else Q(
                                        payment__transaction__source_id=source_obj.id
                                    )
                                )
                                if source_obj
                                else Q(payment__transaction__isnull=True)
                            ),
                            payment__status=PaymentStatus.COMPLETED,
                            date_accounting__lte=OuterRef("date_accounting"),
                        )
                        .with_actual_amount()
                        .annotate(
                            balance=Func("actual_amount", function="Sum"),
                        )
                        .values("balance")[:1]
                    ),
                    Value(0),
                    output_field=MoneyOutput(),
                )
                for source_obj in source_objs + [None]
            },
            balance=Coalesce(balance_sum, Value(0), output_field=MoneyOutput()),
        )

    def with_amount(self):
        PaymentLine = apps.get_model("payment", "PaymentLine")

        return self.annotate(
            amount=Coalesce(
                Subquery(
                    PaymentLine.objects.filter(payment_id=OuterRef("id"))
                    .with_actual_amount()
                    .values("payment")
                    .annotate(sum=Sum("actual_amount"))
                    .values_list("sum", flat=True)[:1],
                ),
                Value(0),
                output_field=MoneyOutput(),
            ),
        )

    def with_description(self):
        Membership = apps.get_model("membership", "Membership")
        Order = apps.get_model("order", "Order")
        PaymentLine = apps.get_model("payment", "PaymentLine")

        return self.annotate(
            type_membership=Case(
                When(
                    Q(
                        lines__item_type__app_label="membership",
                        lines__item_type__model="membershipmodule",
                    ),
                    then=Value(True),
                ),
                output_field=BooleanField(),
                default=Value(False),
            ),
            type_order=Case(
                When(
                    Q(
                        lines__item_type__app_label="order",
                    ),
                    then=Value(True),
                ),
                output_field=BooleanField(),
                default=Value(False),
            ),
            membership_year_str=Case(
                When(
                    type_membership=True,
                    then=Subquery(
                        Membership.objects.filter(
                            modules__payment_lines__payment_id=OuterRef("id"),
                        )
                        .annotate(
                            membership_year_str=Substr(
                                Cast("date_from", CharField()), 1, 4
                            )
                        )
                        .values("membership_year_str")[:1]
                    ),
                ),
                output_field=CharField(),
                default=Value(None),
            ),
            order_reference=Case(
                When(
                    type_order=True,
                    then=Subquery(
                        Order.objects.filter(
                            Q(products__line__payment_id=OuterRef("id"))
                            | Q(registrations__line__payment_id=OuterRef("id"))
                            | Q(delivery__line__payment_id=OuterRef("id"))
                        ).values("reference")[:1]
                    ),
                ),
                output_field=CharField(),
                default=Value(None),
            ),
            is_update=Case(
                When(
                    type_membership=True,
                    then=Exists(
                        PaymentLine.objects.filter(
                            item_id=OuterRef("lines__item_id"),
                            created_at__lt=OuterRef("created_at"),
                        ).exclude(
                            id__in=OuterRef("lines__id"),
                        )
                    ),
                ),
                output_field=BooleanField(),
                default=Value(False),
            ),
            description=Case(
                When(
                    type_membership=True,
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
                When(
                    type_order=True,
                    then=Case(
                        When(
                            order_reference__isnull=False,
                            then=Concat(
                                Value(str(_("Order"))),
                                Value(" #"),
                                F("order_reference"),
                            ),
                        ),
                        default=Value(str(_("Order"))),
                        output_field=CharField(),
                    ),
                ),
                When(Q(text__isnull=False), then=F("text")),
                default=Value(str(_("Payment"))),
                output_field=CharField(),
            ),
        )


class AccountQuerySet(QuerySet):
    def with_amount(self, year: int | None = None, with_parent: bool = False):
        PaymentLine = apps.get_model("payment", "PaymentLine")

        if year is None:
            year = timezone.localdate().year

        annotate_dict = {f"amount_{year}": F("amount")}

        return self.annotate(
            amount_account=Coalesce(
                Subquery(
                    PaymentLine.objects.filter(account_id=OuterRef("id"))
                    .with_dates()
                    .filter(date_accounting__year=year)
                    .annotate(
                        amount_multiplier=Case(
                            When(
                                Q(payment__type=PaymentType.CREDIT),
                                then=Value(-1),
                            ),
                            default=Value(1),
                            output_field=IntegerField(),
                        ),
                        amount_signed=F("amount_multiplier") * F("amount"),
                    )
                    .values("account_id")
                    .annotate(
                        amount=Sum("amount_signed"),
                    )
                    .values("amount")[:1]
                ),
                Value(0),
                output_field=MoneyOutput(),
            ),
            **(
                {
                    "amount_parent_account": Coalesce(
                        Subquery(
                            PaymentLine.objects.filter(
                                account__parent_id=OuterRef("id")
                            )
                            .with_dates()
                            .filter(date_accounting__year=year)
                            .annotate(
                                amount_multiplier=Case(
                                    When(
                                        Q(payment__type=PaymentType.CREDIT),
                                        then=Value(-1),
                                    ),
                                    default=Value(1),
                                    output_field=IntegerField(),
                                ),
                                amount_signed=F("amount_multiplier") * F("amount"),
                            )
                            .values("account__parent_id")
                            .annotate(
                                amount=Sum("amount_signed"),
                            )
                            .values("amount")[:1]
                        ),
                        Value(0),
                        output_field=MoneyOutput(),
                    ),
                    "amount": Cast(
                        F("amount_parent_account") + F("amount_account"),
                        output_field=MoneyOutput(),
                    ),
                }
                if with_parent
                else {"amount": F("amount_account")}
            ),
            **annotate_dict,
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

    def with_actual_amount(self):
        return self.annotate(
            actual_amount=Case(
                When(
                    payment__type=PaymentType.CREDIT,
                    then=-F("amount"),
                ),
                default=F("amount"),
                output_field=MoneyOutput(),
            ),
        )

    def with_balance(self, for_payment: bool = True):
        PaymentLine = apps.get_model("payment", "PaymentLine")
        Source = apps.get_model("payment", "Source")

        source_objs = list(
            Source.objects.filter_type_bank() if for_payment else Source.objects.all()
        )
        balance_sum = F("balance_")
        for source_obj in source_objs:
            balance_sum += F(f"balance_{source_obj.code}")

        return self.with_dates().annotate(
            **{
                f"balance_{source_obj.code if source_obj else ''}": Coalesce(
                    Subquery(
                        PaymentLine.objects.with_dates()
                        .filter(
                            (
                                (
                                    Q(
                                        Q(payment__transaction__source_id=source_obj.id)
                                        | Q(
                                            payment__transaction__source__source_bank_id=source_obj.id
                                        )
                                    )
                                    if for_payment
                                    else Q(
                                        payment__transaction__source_id=source_obj.id
                                    )
                                )
                                if source_obj
                                else Q(payment__transaction__isnull=True)
                            ),
                            payment__status=PaymentStatus.COMPLETED,
                            date_accounting__lte=OuterRef("date_accounting"),
                        )
                        .with_actual_amount()
                        .annotate(
                            balance=Func("actual_amount", function="Sum"),
                        )
                        .values("balance")[:1]
                    ),
                    Value(0),
                    output_field=MoneyOutput(),
                )
                for source_obj in source_objs + [None]
            },
            balance=Coalesce(balance_sum, Value(0), output_field=MoneyOutput()),
        )

    def with_description(self):
        PaymentLine = apps.get_model("payment", "PaymentLine")
        Registration = apps.get_model("event", "Registration")
        ProgramCourseRegistration = apps.get_model(
            "activity", "ProgramCourseRegistration"
        )
        OrderProduct = apps.get_model("order", "OrderProduct")
        OrderRegistration = apps.get_model("order", "OrderRegistration")
        OrderMembership = apps.get_model("order", "OrderMembership")
        OrderDelivery = apps.get_model("order", "OrderDelivery")

        locale = translation.get_language()

        entity_name_annotation = Case(
            When(
                Q(
                    entity__user__isnull=False,
                    entity__user__firstname__isnull=False,
                    entity__user__lastname__isnull=False,
                ),
                then=Concat(
                    F("entity__user__firstname"),
                    Value(" "),
                    F("entity__user__lastname"),
                ),
            ),
            When(
                Q(
                    entity__user__isnull=False,
                    entity__user__firstname__isnull=False,
                ),
                then=F("entity__user__firstname"),
            ),
            When(
                Q(
                    entity__firstname__isnull=False,
                    entity__lastname__isnull=False,
                ),
                then=Concat(
                    F("entity__firstname"),
                    Value(" "),
                    F("entity__lastname"),
                ),
            ),
            When(
                Q(
                    entity__firstname__isnull=False,
                ),
                then=F("entity__firstname"),
            ),
            default=Value(None),
            output_field=CharField(),
        )

        return self.annotate(
            is_update=Exists(
                PaymentLine.objects.filter(
                    item_id=OuterRef("item_id"),
                    created_at__lt=OuterRef("created_at"),
                ).exclude(
                    id=OuterRef("id"),
                )
            ),
            item_uuid=Cast(F("item_id"), output_field=UUIDField()),
            entity_name=Case(
                When(
                    Q(
                        item_type__app_label="event",
                        item_type__model="registration",
                    ),
                    then=Subquery(
                        Registration.objects.filter(id=OuterRef("item_uuid"))
                        .annotate(entity_name=entity_name_annotation)
                        .values_list("entity_name", flat=True)[:1]
                    ),
                ),
                When(
                    Q(
                        item_type__app_label="activity",
                        item_type__model="programcourseregistration",
                    ),
                    then=Subquery(
                        ProgramCourseRegistration.objects.filter(
                            id=OuterRef("item_uuid")
                        )
                        .annotate(entity_name=entity_name_annotation)
                        .values_list("entity_name", flat=True)[:1]
                    ),
                ),
                default=Value(None),
                output_field=CharField(),
            ),
            event_title_locale=Case(
                When(
                    Q(
                        item_type__app_label="event",
                        item_type__model="registration",
                    ),
                    then=Subquery(
                        Registration.objects.filter(id=OuterRef("item_uuid"))
                        .annotate(
                            event_title_locale=Cast(
                                KeyTextTransform(locale, "event__title"),
                                output_field=CharField(),
                            )
                        )
                        .values_list("event_title_locale", flat=True)[:1]
                    ),
                ),
                When(
                    Q(
                        item_type__app_label="order",
                        item_type__model="orderregistration",
                    ),
                    then=Subquery(
                        OrderRegistration.objects.filter(id=OuterRef("item_uuid"))
                        .annotate(
                            event_title_locale=Cast(
                                KeyTextTransform(locale, "registration__event__title"),
                                output_field=CharField(),
                            )
                        )
                        .values_list("event_title_locale", flat=True)[:1]
                    ),
                ),
                default=Value(None),
                output_field=CharField(),
            ),
            membership_description_locale=Case(
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
                When(
                    Q(
                        item_type__app_label="order",
                        item_type__model="ordermembership",
                    ),
                    then=Subquery(
                        OrderMembership.objects.filter(id=OuterRef("item_uuid"))
                        .annotate(
                            membership_description_locale=Case(
                                When(
                                    module__module=Module.ORG,
                                    then=Value(
                                        f"{str(_('Membership'))} {settings.MODULE_ORG_SHORT_NAME}"
                                    ),
                                ),
                                When(
                                    module__module=Module.TOWERS,
                                    then=Value(
                                        f"{str(_('Membership'))} {settings.MODULE_TOWERS_SHORT_NAME}"
                                    ),
                                ),
                                default=Value(str(_("Membership"))),
                                output_field=CharField(),
                            )
                        )
                        .values_list("membership_description_locale", flat=True)[:1]
                    ),
                ),
                default=Value(None),
                output_field=CharField(),
            ),
            program_name_locale=Case(
                When(
                    Q(
                        item_type__app_label="activity",
                        item_type__model="programcourseregistration",
                    ),
                    then=Subquery(
                        ProgramCourseRegistration.objects.filter(
                            id=OuterRef("item_uuid")
                        )
                        .annotate(
                            program_name_locale=Cast(
                                KeyTextTransform(locale, "course__program__name"),
                                output_field=CharField(),
                            )
                        )
                        .values_list("program_name_locale", flat=True)[:1]
                    ),
                ),
                default=Value(None),
                output_field=CharField(),
            ),
            product_name_locale=Case(
                When(
                    Q(
                        item_type__app_label="order",
                        item_type__model="orderproduct",
                    ),
                    then=Subquery(
                        OrderProduct.objects.filter(id=OuterRef("item_uuid"))
                        .annotate(
                            product_name_locale=Cast(
                                KeyTextTransform(locale, "size__product__name"),
                                output_field=CharField(),
                            )
                        )
                        .values_list("product_name_locale", flat=True)[:1]
                    ),
                ),
                default=Value(None),
                output_field=CharField(),
            ),
            description=Case(
                When(
                    Q(
                        item_type__app_label="membership",
                        item_type__model="membershipmodule",
                    ),
                    then=F("membership_description_locale"),
                ),
                When(
                    Q(
                        item_type__app_label="event",
                        item_type__model="registration",
                    ),
                    then=Case(
                        When(
                            entity_name__isnull=False,
                            then=Concat(
                                F("event_title_locale"), Value(" — "), F("entity_name")
                            ),
                        ),
                        default=F("event_title_locale"),
                        output_field=CharField(),
                    ),
                ),
                When(
                    Q(
                        item_type__app_label="activity",
                        item_type__model="programcourseregistration",
                    ),
                    then=Case(
                        When(
                            entity_name__isnull=False,
                            then=Concat(
                                F("program_name_locale"), Value(" — "), F("entity_name")
                            ),
                        ),
                        default=F("program_name_locale"),
                        output_field=CharField(),
                    ),
                ),
                When(
                    Q(
                        item_type__app_label="order",
                        item_type__model="orderproduct",
                    ),
                    then=Subquery(
                        OrderProduct.objects.filter(id=OuterRef("item_uuid"))
                        .annotate(
                            name_locale=Concat(
                                Cast(F("quantity"), output_field=CharField()),
                                Value(" x "),
                                OuterRef("product_name_locale"),
                                Value(" — "),
                                F("size__size"),
                            )
                        )
                        .values_list("name_locale", flat=True)[:1]
                    ),
                ),
                When(
                    Q(
                        item_type__app_label="order",
                        item_type__model="orderregistration",
                    ),
                    then=Case(
                        When(
                            entity_name__isnull=False,
                            then=Concat(
                                F("event_title_locale"), Value(" — "), F("entity_name")
                            ),
                        ),
                        default=F("program_name_locale"),
                        output_field=CharField(),
                    ),
                ),
                When(
                    Q(
                        item_type__app_label="order",
                        item_type__model="ordermembership",
                    ),
                    then=F("membership_description_locale"),
                ),
                When(
                    Q(
                        item_type__app_label="order",
                        item_type__model="orderdelivery",
                    ),
                    then=Subquery(
                        OrderDelivery.objects.filter(id=OuterRef("item_uuid"))
                        .annotate(
                            name_locale=Concat(
                                Value(str(_("Delivery"))),
                                Value(" — "),
                                Cast(
                                    KeyTextTransform(locale, "provider__name"),
                                    output_field=CharField(),
                                ),
                            )
                        )
                        .values_list("name_locale", flat=True)[:1]
                    ),
                ),
                When(Q(receipt__isnull=False), then=F("receipt__description")),
                When(Q(text__isnull=False), then=F("text")),
                When(Q(payment__text__isnull=False), then=F("payment__text")),
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


class SourceQuerySet(QuerySet):
    def filter_type_bank(self):
        return self.filter(type=SourceType.BANK)

    def with_amount(self, year: int | None = None):
        PaymentLine = apps.get_model("payment", "PaymentLine")

        if year is None:
            year = timezone.localdate().year

        annotate_dict = {f"amount_{year}": F("amount")}

        return self.annotate(
            amount=Coalesce(
                Subquery(
                    PaymentLine.objects.filter(
                        payment__transaction__source_id=OuterRef("id")
                    )
                    .with_dates()
                    .filter(date_accounting__year=year)
                    .values("account_id")
                    .annotate(amount=Sum("amount"))
                    .values("amount")[:1]
                ),
                Value(0),
                output_field=MoneyOutput(),
            ),
            **annotate_dict,
        )

    def with_last_import_date(self):
        TransactionImport = apps.get_model("payment", "TransactionImport")

        return self.annotate(
            last_import_date=Coalesce(
                Subquery(
                    TransactionImport.objects.filter(source_id=OuterRef("id"))
                    .order_by("-date_to")
                    .values("date_to")[:1]
                ),
                Value(None),
                output_field=DateField(),
            ),
        )


class PaymentProviderQuerySet(QuerySet):
    def with_name(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            name_locale=F(f"name__{locale}"),
        )


class EntityQuerySet(QuerySet):
    def with_consent(self):
        EntityConsent = apps.get_model("consent", "EntityConsent")

        return self.annotate(
            **{
                f"consent_{consent_type.name.lower()}_given_at": Subquery(
                    EntityConsent.objects.filter(
                        entity_id=OuterRef("id"),
                        type=consent_type,
                        deleted_at__isnull=True,
                    ).values_list("created_at", flat=True)[:1]
                )
                for consent_type in ConsentType
            }
        )
