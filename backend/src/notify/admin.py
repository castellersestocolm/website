from django.contrib import admin

from notify.models import Email


@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    search_fields = ("id", "user", "subject")
    list_display = ("user", "type", "subject", "created_at")
    list_filter = ("type", "created_at")
    ordering = ("-created_at",)

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False
