from django import forms
from django.contrib import admin

from grant.models import Grant, GrantArea, GrantAreaAccount
from payment.enums import PaymentType
from payment.models import Account


class GrantAreaInline(admin.TabularInline):
    model = GrantArea
    ordering = (
        "number",
        "name",
    )
    extra = 0


@admin.register(Grant)
class GrantAdmin(admin.ModelAdmin):
    search_fields = (
        "id",
        "name",
    )
    list_display = ("name", "date_from", "date_to", "created_at")
    list_filter = ("date_from", "date_to")
    readonly_fields = ("created_at",)
    ordering = ("-date_from", "-date_to")
    inlines = (GrantAreaInline,)


class GrantAreaAccountForm(forms.ModelForm):
    class Meta:
        model = GrantAreaAccount
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["account"].queryset = Account.objects.filter(
            type=PaymentType.CREDIT,
            allow_transactions=True,
        ).order_by("code")


class GrantAreaAccountInline(admin.TabularInline):
    model = GrantAreaAccount
    ordering = ("account__code",)
    extra = 0

    form = GrantAreaAccountForm


@admin.register(GrantArea)
class GrantAreaAdmin(admin.ModelAdmin):
    search_fields = (
        "id",
        "name",
    )
    list_display = ("name", "number", "grant", "percentage", "created_at")
    list_filter = ("grant", "percentage")
    readonly_fields = ("created_at",)
    ordering = ("grant__date_from", "grant__date_to", "number", "name")
    inlines = (GrantAreaAccountInline,)
