from django.contrib import admin

from membership.models import Membership, MembershipModule, MembershipUser


class MembershipModuleInline(admin.TabularInline):
    model = MembershipModule
    extra = 0


class MembershipUserInline(admin.TabularInline):
    model = MembershipUser
    extra = 0


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    search_fields = ("id",)
    list_display = ("id", "date_from", "date_to", "status")
    list_filter = ("date_from", "date_to", "status")
    ordering = ("-created_at",)
    inlines = (MembershipModuleInline, MembershipUserInline)
