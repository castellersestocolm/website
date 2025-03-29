from django.contrib import admin

from integration.models import (
    GoogleIntegration,
)


@admin.register(GoogleIntegration)
class GoogleIntegrationAdmin(admin.ModelAdmin):
    search_fields = ("id",)
    list_display = ("id", "module")
    list_filter = ("module",)
    ordering = ("module",)
