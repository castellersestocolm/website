from django.contrib import admin
from django.db.models import JSONField
from django.utils import timezone

import payment.api.entity

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
)

from jsoneditor.forms import JSONEditor

from django.utils.translation import gettext_lazy as _


class PaymentLineForPaymentInline(admin.TabularInline):
    model = PaymentLine
    ordering = ("-created_at",)
    readonly_fields = ("debit_line",)
    extra = 0


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


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    search_fields = ("id", "text")
    list_display = (
        # "id",
        "date_accounting",
        "type",
        "status",
        "text_short",
        "amount",
        "entity",
        "method",
        "balance",
        "created_at",
    )
    list_filter = ("type", "status", "method")
    readonly_fields = ("debit_payment",)
    raw_id_fields = (
        "entity",
        "transaction",
    )
    inlines = (PaymentLineForPaymentInline, PaymentLogInline)

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .with_balance()
            .with_amount()
            .select_related("transaction")
            .order_by("-date_accounting", "-date_interest", "-created_at")
        )

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


@admin.register(PaymentLine)
class PaymentLineAdmin(admin.ModelAdmin):
    search_fields = ("id", "text", "payment__text")
    list_display = (
        # "id",
        "date_accounting",
        "text_short",
        "text",
        "entity",
        "account",
        "amount",
        "vat",
        "balance",
        "created_at",
    )
    list_editable = ("account",)
    list_filter = ("vat",)
    list_per_page = 25

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .with_balance()
            .select_related("payment", "payment__entity", "payment__transaction")
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


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    search_fields = ("id", "name", "code")
    list_display = (
        "account_name",
        "code",
        "type",
        "category",
        "module",
        "yearly_amount",
        "allow_transactions",
        "parent",
        "created_at",
    )
    list_filter = ("allow_transactions", "type", "category", "module")
    ordering = ("code",)
    inlines = (
        AccountInline,
        AccountTagInline,
        PaymentLineForAccountInline,
    )

    def get_queryset(self, request):
        return super().get_queryset(request).with_amount()

    def yearly_amount(self, obj):
        return obj.amount

    def account_name(self, obj):
        return str(obj)

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


@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    search_fields = ("id", "name")
    list_display = ("name", "type")
    list_filter = ("type",)
    ordering = ("name",)


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
    readonly_fields = ("status",)
    ordering = ("-created_at",)
    inlines = (TransactionReadOnlyInline,)
