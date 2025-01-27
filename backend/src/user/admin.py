from django.contrib import admin, messages

from user.models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    search_fields = ("id", "email", "firstname", "lastname", "phone")
    list_display = (
        "email",
        "firstname",
        "lastname",
        "phone",
        "email_verified",
        "is_active",
        "created_at",
    )
    list_filter = (
        "email_verified",
        "is_active",
    )
    readonly_fields = (
        "groups",
        "last_login",
        "created_at",
    )
    exclude = ("password", "user_permissions")
    ordering = ("-created_at",)
