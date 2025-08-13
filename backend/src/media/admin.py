from django.contrib import admin
from django.db.models import JSONField
from django.utils import translation
from jsoneditor.forms import JSONEditor

from django.utils.translation import gettext_lazy as _

from media.models import Release, ReleaseImage


class ReleaseImageInline(admin.TabularInline):
    model = ReleaseImage
    extra = 0


@admin.register(Release)
class ReleaseAdmin(admin.ModelAdmin):
    search_fields = ("id", "title", "subtitle")
    list_display = (
        "module",
        "title_locale",
        "date",
        "created_at",
    )
    list_filter = ("module", "date", "created_at")
    ordering = ("-date",)
    inlines = (ReleaseImageInline,)

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def title_locale(self, obj):
        return obj.title.get(translation.get_language()) or list(obj.title.values())[0]

    title_locale.short_description = _("title")
