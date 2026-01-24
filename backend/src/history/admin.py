from django.contrib import admin
from django.db.models import JSONField
from jsoneditor.forms import JSONEditor

from history.models import HistoryEvent

from django.utils.translation import gettext_lazy as _


@admin.register(HistoryEvent)
class HistoryEventAdmin(admin.ModelAdmin):
    search_fields = ("id", "title")
    list_display = (
        "title_locale",
        "module",
        "date",
        "created_at",
    )
    list_filter = ("module", "date", "created_at")
    ordering = ("-date",)

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def get_queryset(self, request):
        return super().get_queryset(request).with_title()

    def title_locale(self, obj):
        return obj.title_locale

    title_locale.short_description = _("title")
