from django.contrib import admin
from django.urls import reverse
from django.utils.safestring import mark_safe

from comunicat.consts import SHORT_NAME_BY_MODULE
from membership.models import Membership, MembershipModule, MembershipUser

from django.utils.translation import gettext_lazy as _


class MembershipModuleInline(admin.TabularInline):
    model = MembershipModule
    extra = 0


class MembershipUserInline(admin.TabularInline):
    model = MembershipUser
    extra = 0


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    search_fields = ("id",)
    list_display = (
        "id",
        "user_list",
        "family",
        "date_from",
        "date_to",
        "date_end",
        "status",
        "module_list",
    )
    list_filter = ("date_from", "date_to", "status")
    ordering = ("-created_at",)
    inlines = (MembershipModuleInline, MembershipUserInline)

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .prefetch_related("membership_users", "membership_users__user", "modules")
        )

    def user_list(self, obj):
        return (
            mark_safe(
                "<br/>".join(
                    [
                        f'<a href="{
        reverse(
                'admin:user_user_change', args=(member_user_obj.user_id,)
            )
        
        }">{str(member_user_obj.user)}</a>'
                        for member_user_obj in obj.membership_users.order_by(
                            "user__firstname", "user__lastname"
                        )
                    ]
                )
            )
            or "-"
        )

    def family(self, obj):
        family_obj = (
            [
                memberhip_user_obj.family
                for memberhip_user_obj in obj.membership_users.all()
            ]
            + [None]
        )[0]

        if family_obj:
            return mark_safe(
                f'<a href="{reverse(
                "admin:user_family_change", args=(family_obj.id,)
            )}">{str(family_obj)}</a>'
            )

        return "-"

    def module_list(self, obj):
        return (
            mark_safe(
                "<br/>".join(
                    [
                        SHORT_NAME_BY_MODULE[membership_module_obj.module]
                        for membership_module_obj in obj.modules.order_by("module")
                    ]
                )
            )
            or "-"
        )

    user_list.short_description = _("users")
    family.short_description = _("family")
    module_list.short_description = _("modules")
