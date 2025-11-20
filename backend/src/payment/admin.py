import itertools

from django import forms
from django.conf import settings
from django.contrib import admin, messages
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db.models import JSONField, Q
from django.forms import BaseInlineFormSet, Widget
from django.utils import timezone, translation
from djmoney.money import Money

import payment.api.entity
import payment.tasks
from comunicat.enums import Module
from comunicat.utils.admin import DynamicColumn
from event.models import Registration
from notify.enums import EmailType
from order.models import Order
from payment.consts import PAYMENT_LINE_CONTENT_TYPES
from payment.enums import PaymentType

import notify.tasks

from payment.models import (
    Payment,
    PaymentLine,
    PaymentLog,
    Account,
    Transaction,
    AccountTag,
    Source,
    Entity,
    TransactionImport,
    Receipt,
    Expense,
    ExpenseLog,
    Statement,
    PaymentProvider,
    PaymentOrder,
    PaymentOrderProviderLog,
)

from jsoneditor.forms import JSONEditor

from django.utils.translation import gettext_lazy as _


class PaymentLineForPaymentFormset(BaseInlineFormSet):
    def clean(self):
        super().clean()

        if self.instance.transaction:
            amount_left = abs(self.instance.transaction.amount)
            for form in self.forms:
                if "amount" not in form.cleaned_data:
                    continue

                current_amount = min(form.cleaned_data["amount"], amount_left)
                amount_left -= current_amount

                if current_amount != form.cleaned_data["amount"]:
                    if current_amount.amount > 0:
                        form.instance.amount = current_amount
                        form.instance.save(update_fields=("amount",))
                    else:
                        form.instance.delete()

            if amount_left:
                PaymentLine.objects.create(payment=self.instance, amount=amount_left)

        return self.instance

    def delete_existing(self, obj, commit=True):
        super().delete_existing(obj=obj, commit=commit)

        current_amount = sum(
            [
                payment_line_obj.amount
                for payment_line_obj in PaymentLine.objects.filter(
                    payment=self.instance
                )
            ]
        )
        print(current_amount, self.instance.transaction.amount)
        if current_amount < self.instance.transaction.amount:
            amount_left = self.instance.transaction.amount - current_amount
            PaymentLine.objects.create(payment=self.instance, amount=amount_left)


class PaymentLineForPaymentForm(forms.ModelForm):
    class Meta:
        model = PaymentLine
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        content_type_filter = Q()
        for app_label, model_name in PAYMENT_LINE_CONTENT_TYPES:
            content_type_filter |= Q(app_label=app_label, model=model_name)
        self.fields["item_type"].queryset = ContentType.objects.filter(
            content_type_filter
        )
        self.fields["account"].queryset = Account.objects.filter(
            (
                Q(type=self.instance.payment.type)
                if hasattr(self.instance, "payment")
                else Q()
            ),
            allow_transactions=True,
        ).order_by("code")

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get("item_type"):
            try:
                Model = cleaned_data["item_type"].model_class()
                Model.objects.get(id=cleaned_data["item_id"])
            except ObjectDoesNotExist:
                raise ValidationError({"item_id": _("This item does not exist.")})


class PaymentLineForPaymentInline(admin.TabularInline):
    model = PaymentLine
    ordering = ("created_at",)
    readonly_fields = ("debit_line",)
    raw_id_fields = ("receipt",)
    extra = 0

    form = PaymentLineForPaymentForm
    formset = PaymentLineForPaymentFormset


class PaymentLogInline(admin.TabularInline):
    model = PaymentLog
    readonly_fields = ("status", "created_at")
    ordering = ("-created_at",)
    extra = 0

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.action(description=_("Send paid email"))
def send_paid_email(modeladmin, request, queryset):
    for payment_obj in queryset:
        paymeny_line_objs = list(payment_obj.lines.all())

        registration_objs = list(
            Registration.objects.filter(line__in=paymeny_line_objs).select_related(
                "event"
            )
        )
        if registration_objs:
            for event_obj, event_registration_objs in itertools.groupby(
                registration_objs, lambda registration_obj: registration_obj.event
            ):
                notify.tasks.send_registration_email.delay(
                    registration_ids=[
                        registration_obj.id
                        for registration_obj in event_registration_objs
                    ],
                    email_type=EmailType.REGISTRATION_PAID,
                    module=event_obj.module,
                )

        order_objs = list(Order.objects.filter(products__line__in=paymeny_line_objs))
        for order_obj in order_objs:
            notify.tasks.send_order_email.delay(
                order_id=order_obj.id,
                email_type=EmailType.ORDER_PAID,
                module=order_obj.origin_module,
            )
    messages.success(request, _("Action succeeded."))


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    search_fields = (
        "id",
        "text",
        "entity__firstname",
        "entity__lastname",
        "entity__email",
    )
    list_filter = ("type", "status", "method")
    raw_id_fields = (
        "entity",
        "transaction",
    )
    inlines = (PaymentLineForPaymentInline, PaymentLogInline)
    actions = (send_paid_email,)

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .with_balance()
            .with_amount()
            .select_related("transaction")
            .prefetch_related("lines")
            .order_by("-date_accounting", "-date_interest", "-created_at")
        )

    def get_list_display(self, request):
        list_display = [
            # "id",
            "date_accounting",
            "type",
            "status",
            "text_short",
            "amount",
            "entity",
            "method",
            "balance",
        ]

        source_objs = list(Source.objects.all().order_by("name"))

        for source_obj in source_objs:
            list_display.append(DynamicColumn(field=f"balance_{source_obj.code}"))

        return list_display

    def get_readonly_fields(self, request, obj=None):
        readonly_fields = ["debit_payment", "transaction"]

        if obj is None:
            return []

        if obj.transaction:
            readonly_fields += [
                "type",
                "method",
            ]

        return readonly_fields

    @admin.display(ordering="amount")
    def amount(self, obj):
        return obj.amount

    @admin.display(ordering="date_accounting")
    def date_accounting(self, obj):
        return obj.date_accounting

    @admin.display(ordering="text")
    def text_short(self, obj):
        return obj.text[:50] if obj.text else "-"

    def balance(self, obj):
        return obj.balance

    text_short.short_description = _("text")
    date_accounting.short_description = _("date")
    balance.short_description = _("balance")


class PaymentLineForm(forms.ModelForm):
    class Meta:
        model = PaymentLine
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        content_type_filter = Q()
        for app_label, model_name in PAYMENT_LINE_CONTENT_TYPES:
            content_type_filter |= Q(app_label=app_label, model=model_name)
        self.fields["item_type"].queryset = ContentType.objects.filter(
            content_type_filter
        )
        self.fields["account"].queryset = Account.objects.filter(
            (
                Q(type=self.instance.payment.type)
                if hasattr(self.instance, "payment")
                else Q()
            ),
            allow_transactions=True,
        ).order_by("code")

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get("item_type"):
            try:
                Model = cleaned_data["item_type"].model_class()
                Model.objects.get(id=cleaned_data["item_id"])
            except ObjectDoesNotExist:
                raise ValidationError({"item_id": _("This item does not exist.")})


@admin.register(PaymentLine)
class PaymentLineAdmin(admin.ModelAdmin):
    search_fields = (
        "id",
        "text",
        "payment__text",
        "payment__entity__firstname",
        "payment__entity__lastname",
        "payment__entity__email",
    )
    # TODO: Unused, if used limit to "allow_transactions"
    # list_editable = ("account",)
    list_filter = ("vat",)
    list_per_page = 25
    form = PaymentLineForm

    def get_list_display(self, request):
        list_display = [
            # "id",
            "date_accounting",
            "text_short",
            "text",
            "entity",
            "account",
            "amount",
            "vat",
            "balance",
        ]

        source_objs = list(Source.objects.all().order_by("name"))

        for source_obj in source_objs:
            list_display.append(DynamicColumn(field=f"balance_{source_obj.code}"))

        return list_display

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .with_balance()
            .select_related("payment", "payment__entity", "payment__transaction")
            .prefetch_related("payment__lines")
            .order_by("-date_accounting", "-date_interest", "-created_at")
        )

    @admin.display(ordering="payment__text")
    def text_short(self, obj):
        return obj.payment.text[:50] if obj.payment.text else "-"

    @admin.display(ordering="payment__entity")
    def entity(self, obj):
        return obj.payment.entity if hasattr(obj.payment, "entity") else "-"

    @admin.display(ordering="date_accounting")
    def date_accounting(self, obj):
        return obj.date_accounting

    def balance(self, obj):
        return obj.balance

    text_short.short_description = _("text")
    entity.short_description = _("entity")
    date_accounting.short_description = _("date")
    balance.short_description = _("balance")


class PaymentInline(admin.TabularInline):
    model = Payment
    ordering = ("-created_at",)
    extra = 0


class AccountInline(admin.TabularInline):
    model = Account
    ordering = ("code",)
    extra = 0


class AccountTagInline(admin.TabularInline):
    model = AccountTag
    ordering = ("name",)
    extra = 0


class PaymentLineForAccountInline(admin.TabularInline):
    model = PaymentLine
    ordering = ("-created_at",)
    readonly_fields = ("payment", "debit_line")
    extra = 0

    def has_add_permission(self, request, obj=None):
        return False


class AccountForm(forms.ModelForm):
    class Meta:
        model = Account
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["parent"].queryset = Account.objects.filter(
            allow_transactions=False,
        ).order_by("code")


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    search_fields = ("id", "name", "code")
    list_display = (
        "account_name",
        "code",
        "type",
        "category",
        "module",
        "allow_transactions",
        "balance",
        "balance_y1",
        "balance_y2",
    )
    list_filter = ("allow_transactions", "type", "category", "module")
    ordering = ("code",)
    inlines = (
        AccountInline,
        AccountTagInline,
        PaymentLineForAccountInline,
    )
    form = AccountForm

    def get_queryset(self, request):
        year = timezone.localdate().year
        return (
            super()
            .get_queryset(request)
            .with_amount(year=year, with_parent=True)
            .with_amount(year=year - 1, with_parent=True)
            .with_amount(year=year - 2, with_parent=True)
        )

    def changelist_view(self, request, extra_context=None):
        year = timezone.localdate().year

        account_summary = {
            PaymentType.DEBIT: {
                module: Money("0", settings.MODULE_ALL_CURRENCY) for module in Module
            },
            PaymentType.CREDIT: {
                module: Money("0", settings.MODULE_ALL_CURRENCY) for module in Module
            },
            None: {
                module: Money("0", settings.MODULE_ALL_CURRENCY) for module in Module
            },
        }
        for account_obj in Account.objects.with_amount(year=year):
            if not account_obj.module:
                continue

            account_amount = getattr(account_obj, f"amount_{timezone.localdate().year}")
            account_summary[account_obj.type][account_obj.module] += account_amount
            account_summary[None][account_obj.module] += account_amount

        extra_context = {"account_summary": account_summary, "modules": list(Module)}

        return super().changelist_view(request, extra_context=extra_context)

    def balance(self, obj):
        return getattr(obj, f"amount_{timezone.localdate().year}")

    def balance_y1(self, obj):
        return getattr(obj, f"amount_{timezone.localdate().year - 1}")

    def balance_y2(self, obj):
        return getattr(obj, f"amount_{timezone.localdate().year - 2}")

    def account_name(self, obj):
        return str(obj)

    balance.short_description = _("balance")
    balance_y1.short_description = _("balance %s") % (timezone.localdate().year - 1,)
    balance_y2.short_description = _("balance %s") % (timezone.localdate().year - 2,)
    account_name.short_description = _("name")


@admin.action(description="Merge entities")
def merge_entities(modeladmin, request, queryset):
    payment.api.entity.merge(entity_ids=queryset.values_list("id", flat=True))


@admin.register(Entity)
class EntityAdmin(admin.ModelAdmin):
    search_fields = ("id", "firstname", "lastname", "email", "phone")
    list_display = (
        "id",
        "firstname",
        "lastname",
        "email",
        "phone",
        "user",
        "created_at",
    )
    ordering = ("firstname", "lastname", "email", "created_at")
    raw_id_fields = ("user",)
    inlines = (PaymentInline,)
    actions = (merge_entities,)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    search_fields = ("id", "text", "sender", "reference")
    list_display = (
        # "id",
        "date_accounting",
        "source",
        "method",
        "amount",
        "text",
        "sender",
        "reference",
        "date_interest",
        "created_at",
    )
    list_filter = ("source", "method")
    ordering = ("-date_accounting", "-date_interest", "-created_at")
    inlines = (PaymentInline,)

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    search_fields = ("id", "name")
    list_display = (
        "name",
        "type",
        "last_import_date",
        "balance",
        "balance_y1",
        "balance_y2",
    )
    list_filter = ("type",)
    ordering = ("name",)

    def get_queryset(self, request):
        year = timezone.localdate().year
        return (
            super()
            .get_queryset(request)
            .with_last_import_date()
            .with_amount(year=year)
            .with_amount(year=year - 1)
            .with_amount(year=year - 2)
        )

    def last_import_date(self, obj):
        return obj.last_import_date

    def balance(self, obj):
        return getattr(obj, f"amount_{timezone.localdate().year}")

    def balance_y1(self, obj):
        return getattr(obj, f"amount_{timezone.localdate().year - 1}")

    def balance_y2(self, obj):
        return getattr(obj, f"amount_{timezone.localdate().year - 2}")

    last_import_date.short_description = _("last imported")
    balance.short_description = _("balance")
    balance_y1.short_description = _("balance %s") % (timezone.localdate().year - 1,)
    balance_y2.short_description = _("balance %s") % (timezone.localdate().year - 2,)


class TransactionInline(admin.TabularInline):
    model = Transaction
    exclude = ("extra",)
    ordering = ("-date_accounting", "-date_interest", "-created_at")
    extra = 0


class TransactionReadOnlyInline(TransactionInline):
    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(TransactionImport)
class TransactionImportAdmin(admin.ModelAdmin):
    search_fields = ("id",)
    list_display = ("id", "source", "date_from", "date_to", "status", "created_at")
    list_filter = ("date_from", "date_to", "status")
    readonly_fields = ("status", "created_at")
    ordering = ("-created_at",)
    inlines = (TransactionReadOnlyInline,)


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    search_fields = ("id", "description", "file")
    list_display = (
        "description",
        "date",
        "entity",
        "file",
        "type",
        "status",
        "created_at",
    )
    list_filter = ("date", "type", "status")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)
    raw_id_fields = (
        "entity",
        "expense",
    )

    def file_name(self, obj):
        return obj.file.name

    file_name.short_description = _("file")


class ReceiptInline(admin.TabularInline):
    model = Receipt
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)
    extra = 0
    raw_id_fields = (
        "entity",
        "expense",
    )


class ExpenseLogInline(admin.TabularInline):
    model = ExpenseLog
    readonly_fields = ("status", "created_at")
    ordering = ("-created_at",)
    extra = 0

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    search_fields = ("id", "entity__firstname", "entity__lastname", "entity__email")
    list_display = ("id", "entity", "status", "created_at")
    list_filter = ("status",)
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)
    raw_id_fields = ("entity",)
    inlines = (ReceiptInline, ExpenseLogInline)


@admin.action(description="Sync statements to Google Drive")
def sync_statements_google_drive(modeladmin, request, queryset):
    for statement_obj in queryset:
        payment.tasks.sync_statement.delay(
            statement_id=statement_obj.id,
        )


@admin.register(Statement)
class StatementAdmin(admin.ModelAdmin):
    search_fields = ("id",)
    list_display = (
        "id",
        "date_from",
        "date_to",
        "amount_start",
        "amount_end",
        "created_at",
    )
    list_filter = ("date_from", "date_to")
    readonly_fields = ("created_at",)
    ordering = ("-date_from", "-date_to")
    actions = (sync_statements_google_drive,)


@admin.register(PaymentProvider)
class PaymentProviderAdmin(admin.ModelAdmin):
    search_fields = ("id", "name", "code")
    list_display = (
        "id",
        "name_locale",
        "code",
        "method",
        "order",
        "is_enabled",
    )
    list_filter = ("is_enabled", "method")
    readonly_fields = ("created_at",)
    ordering = ("order", "code")
    actions = (sync_statements_google_drive,)

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def name_locale(self, obj):
        return obj.name.get(translation.get_language()) or list(obj.name.values())[0]

    name_locale.short_description = _("name")


class PaymentOrderProviderLogInline(admin.TabularInline):
    model = PaymentOrderProviderLog
    readonly_fields = ("provider", "created_at")
    ordering = ("-created_at",)
    extra = 0

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(PaymentOrder)
class PaymentOrderAdmin(admin.ModelAdmin):
    search_fields = (
        "id",
        "external_id",
        "order__id",
        "order__entity__email",
        "order__entity__firstname",
        "order__entity__lastname",
    )
    list_display = (
        "id",
        "provider",
        "status",
        "external_id",
    )
    list_filter = ("provider", "status")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)
    inlines = (PaymentOrderProviderLogInline,)
