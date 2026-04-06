from django import forms
from django.contrib import admin
from django.db.models import Exists, OuterRef

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

    def __init__(self, *args, parent_obj: GrantArea, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["account"].queryset = (
            Account.objects.annotate(
                is_already_granted=Exists(
                    GrantAreaAccount.objects.filter(
                        area__grant_id=parent_obj.grant_id, account_id=OuterRef("id")
                    ).exclude(area_id=parent_obj.id)
                )
            )
            .filter(
                is_already_granted=False,
                type=PaymentType.CREDIT,
                allow_transactions=True,
            )
            .order_by("code")
        )


class GrantAreaAccountInline(admin.TabularInline):
    model = GrantAreaAccount
    ordering = ("account__code",)
    extra = 0

    form = GrantAreaAccountForm

    def get_formset(self, request, obj=None, **kwargs):
        BaseFormSet = kwargs.pop("formset", self.formset)

        # Now make a custom subclass with an overridden “get_form_kwargs()”
        class WithParentFormSet(BaseFormSet):
            def get_form_kwargs(self, index):
                kwargs = super().get_form_kwargs(index)
                kwargs["parent_obj"] = obj
                return kwargs

        kwargs["formset"] = WithParentFormSet
        return super().get_formset(request, obj, **kwargs)


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
