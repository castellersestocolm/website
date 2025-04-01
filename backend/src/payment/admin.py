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
        "id",
        "date",
        "type",
        "status",
        "text_short",
        "amount",
        "entity",
        "method",
        "created_at",
    )
    list_filter = ("type", "status", "method")
    readonly_fields = ("debit_payment",)
    ordering = ("-created_at",)
    raw_id_fields = (
        "entity",
        "transaction",
    )
    inlines = (PaymentLineForPaymentInline, PaymentLogInline)

    def get_queryset(self, request):
        return super().get_queryset(request).with_amount().select_related("transaction")

    def amount(self, obj):
        return obj.amount

    def date(self, obj):
        return (
            obj.transaction.date_accounting
            if obj.transaction
            else timezone.localdate(obj.created_at)
        )

    def text_short(self, obj):
        return obj.text[:50] if obj.text else "-"

    text_short.short_description = _("text")


@admin.register(PaymentLine)
class PaymentLineAdmin(admin.ModelAdmin):
    search_fields = ("id", "text", "payment__text")
    list_display = (
        "id",
        "text_short",
        "text",
        "account",
        "amount",
        "vat",
        "created_at",
    )
    list_editable = ("account",)
    list_filter = ("vat",)
    ordering = ("-created_at",)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("payment")

    def text_short(self, obj):
        return obj.payment.text[:50] if obj.payment.text else "-"

    text_short.short_description = _("text")


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
    ordering = ("lastname", "firstname", "email", "created_at")
    inlines = (PaymentInline,)
    actions = (merge_entities,)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    search_fields = ("id", "text", "sender", "reference")
    list_display = (
        "id",
        "source",
        "method",
        "amount",
        "text",
        "sender",
        "reference",
        "date_accounting",
        "date_interest",
        "created_at",
    )
    list_filter = ("source", "method")
    ordering = ("-date_accounting", "-created_at")
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


@admin.register(TransactionImport)
class TransactionImportAdmin(admin.ModelAdmin):
    search_fields = ("id",)
    list_display = ("id", "source", "date_from", "date_to", "status", "created_at")
    readonly_fields = ("status",)
    ordering = ("-created_at",)
