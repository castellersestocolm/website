from django.apps import apps
from django.conf import settings
from django.db.models import (
    BooleanField,
    Case,
    CharField,
    Count,
    DateField,
    Exists,
    ExpressionWrapper,
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
from membership.enums import MembershipStatus
from order.enums import OrderType
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
        Event = apps.get_model("event", "Event")
        Program = apps.get_model("activity", "Program")
        PaymentLine = apps.get_model("payment", "PaymentLine")

        return self.annotate(
            membership_year_str=Case(
                When(
                    order__type=OrderType.MEMBERSHIP,
                    then=Subquery(
                        Membership.objects.filter(
                            modules__order_memberships__order_id=OuterRef("order_id"),
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
            is_update=Case(
                When(
                    order__type=OrderType.MEMBERSHIP,
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
                    order__isnull=False,
                    order__type=OrderType.MEMBERSHIP,
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
                    order__isnull=False,
                    order__type=OrderType.REGISTRATION,
                    then=Subquery(
                        Event.objects.filter(
                            registrations__order_registrations__order_id=OuterRef(
                                "order_id"
                            ),
                        )
                        .with_title()
                        .values("title_locale")[:1]
                    ),
                ),
                When(
                    order__isnull=False,
                    order__type=OrderType.COURSE,
                    then=Subquery(
                        Program.objects.filter(
                            courses__registrations__order_courses__order_id=OuterRef(
                                "order_id"
                            ),
                        )
                        .with_name()
                        .values("name_locale")[:1]
                    ),
                ),
                When(
                    order__isnull=False,
                    order__type=OrderType.REQUEST,
                    then=Concat(
                        Value(str(_("Payment request"))),
                        Value(" #"),
                        F("order__reference"),
                    ),
                ),
                When(
                    order__isnull=False,
                    then=Concat(
                        Value(str(_("Order"))),
                        Value(" #"),
                        F("order__reference"),
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

    def with_is_delivery(self):
        return self.annotate(
            is_delivery=Case(
                When(
                    Q(
                        item_type__app_label="order",
                        item_type__model="orderdelivery",
                    ),
                    then=Value(True),
                ),
                default=Value(False),
                output_field=BooleanField(),
            )
        )

    def with_description(self):
        ProductSize = apps.get_model("product", "ProductSize")
        Registration = apps.get_model("event", "Registration")
        MembershipModule = apps.get_model("membership", "MembershipModule")
        ProgramCourseRegistration = apps.get_model(
            "activity", "ProgramCourseRegistration"
        )
        PaymentRequestLine = apps.get_model("payment", "PaymentRequestLine")
        OrderDelivery = apps.get_model("order", "OrderDelivery")

        locale = translation.get_language()

        return self.annotate(
            item_uuid=Cast(F("item_id"), output_field=UUIDField()),
            description_base=Case(
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
                When(
                    item_type__app_label="order",
                    item_type__model="orderproduct",
                    then=Subquery(
                        ProductSize.objects.filter(
                            order_products__line_id=OuterRef("id")
                        )
                        .with_product_name()
                        .annotate(
                            product_name=Concat(
                                Cast(
                                    F("product_name_locale"), output_field=CharField()
                                ),
                                Value(" — "),
                                F("size"),
                            )
                        )
                        .values("product_name")[:1]
                    ),
                ),
                When(
                    item_type__app_label="order",
                    item_type__model="orderregistration",
                    then=Subquery(
                        Registration.objects.filter(
                            order_registrations__line_id=OuterRef("id")
                        )
                        .with_event_title()
                        .annotate(
                            registration_name=Concat(
                                Cast(F("event_title_locale"), output_field=CharField()),
                                Value(" — "),
                                F("entity__firstname"),
                                Value(" "),
                                F("entity__lastname"),
                            )
                        )
                        .values("registration_name")[:1]
                    ),
                ),
                When(
                    item_type__app_label="order",
                    item_type__model="ordermembership",
                    then=Subquery(
                        MembershipModule.objects.filter(
                            order_memberships__line_id=OuterRef("id")
                        )
                        .annotate(
                            membership_description_locale=Case(
                                When(
                                    module=Module.ORG,
                                    then=Value(
                                        f"{str(_('Membership'))} {settings.MODULE_ORG_SHORT_NAME}"
                                    ),
                                ),
                                When(
                                    module=Module.TOWERS,
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
                When(
                    item_type__app_label="order",
                    item_type__model="ordercourse",
                    then=Subquery(
                        ProgramCourseRegistration.objects.filter(
                            order_courses__line_id=OuterRef("id")
                        )
                        .with_course_program_name()
                        .annotate(
                            registration_name=Concat(
                                Cast(
                                    F("course_program_name_locale"),
                                    output_field=CharField(),
                                ),
                                Value(" — "),
                                F("entity__firstname"),
                                Value(" "),
                                F("entity__lastname"),
                            )
                        )
                        .values("registration_name")[:1]
                    ),
                ),
                When(
                    item_type__app_label="order",
                    item_type__model="orderrequest",
                    then=Subquery(
                        PaymentRequestLine.objects.filter(
                            order_requests__line_id=OuterRef("id")
                        ).values("text")[:1]
                    ),
                ),
                When(Q(receipt__isnull=False), then=F("receipt__description")),
                When(Q(text__isnull=False), then=F("text")),
                When(Q(payment__text__isnull=False), then=F("payment__text")),
                default=Value(None),
                output_field=CharField(),
            ),
            description=Case(
                When(
                    ~Q(description_base=None) & Q(description_base__isnull=False),
                    then=F("description_base"),
                ),
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
            name_locale=KeyTextTransform(locale, "name"),
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

    def with_has_active_membership(
        self,
        modules: list[Module] | None = None,
    ):
        MembershipModule = apps.get_model("membership", "MembershipModule")

        module_filter = Q()
        if modules is not None:
            module_filter = Q(module__in=modules)

        date_today = timezone.localdate()

        return self.annotate(
            membership_id=Subquery(
                MembershipModule.objects.filter(
                    module_filter,
                    Q(membership__date_end__isnull=True)
                    | Q(membership__date_end__gte=date_today),
                    status=MembershipStatus.ACTIVE,
                    membership__status=MembershipStatus.ACTIVE,
                    membership__date_from__lte=date_today,
                    membership__date_to__gte=date_today,
                    membership__membership_users__user_id=OuterRef("user_id"),
                )
                .order_by("-membership__date_to")
                .values_list("membership_id", flat=True)[:1]
            ),
            has_active_membership=ExpressionWrapper(
                Q(membership_id__isnull=False), output_field=BooleanField()
            ),
            **{
                f"has_active_membership_{module.name.lower()}": Exists(
                    MembershipModule.objects.filter(
                        Q(membership__date_end__isnull=True)
                        | Q(membership__date_end__gte=date_today),
                        module=module,
                        status=MembershipStatus.ACTIVE,
                        membership__status=MembershipStatus.ACTIVE,
                        membership__date_from__lte=date_today,
                        membership__date_to__gte=date_today,
                        membership__membership_users__user_id=OuterRef("user_id"),
                    )
                )
                for module in Module
                if not modules or module in modules
            },
        )


class PaymentRequestQuerySet(QuerySet):
    def with_amount(self):
        PaymentRequestLine = apps.get_model("payment", "PaymentRequestLine")

        return self.annotate(
            amount=Coalesce(
                Subquery(
                    PaymentRequestLine.objects.filter(request_id=OuterRef("id"))
                    .values("request")
                    .annotate(sum=Sum("amount"))
                    .values_list("sum", flat=True)[:1],
                ),
                Value(0),
                output_field=MoneyOutput(),
            ),
        )
