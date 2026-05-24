from django.contrib import admin

from consent.models import EntityConsent


@admin.register(EntityConsent)
class EntityConsentAdmin(admin.ModelAdmin):
    search_fields = (
        "id",
        "entity__firstname",
        "entity__lastname",
        "entity__email",
    )
    list_display = ("entity", "type", "created_at")
    list_filter = ("type",)
    raw_id_fields = ("entity",)
    readonly_fields = ("google_group_user",)
    ordering = ("-created_at",)
