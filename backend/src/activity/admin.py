from django import forms
from django.contrib import admin
from django.db.models import JSONField
from jsoneditor.forms import JSONEditor

from activity.models import (
    Program,
    ProgramCourse,
    ProgramCoursePrice,
    ProgramCourseRegistration,
)

from django.utils.translation import gettext_lazy as _

from comunicat import settings
from event.enums import EventType
from event.models import Event


class ProgramCourseInline(admin.TabularInline):
    model = ProgramCourse
    ordering = ("-date_from", "-date_to")
    extra = 0


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    search_fields = ("id", "name")
    list_display = (
        "name_locale",
        "module",
        "type",
    )
    list_filter = ("type", "module")
    ordering = ("module", "name")
    inlines = (ProgramCourseInline,)

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def get_queryset(self, request):
        return super().get_queryset(request).with_name()

    def name_locale(self, obj):
        return obj.name_locale

    name_locale.short_description = _("name")


class ProgramCoursePriceInline(admin.TabularInline):
    model = ProgramCoursePrice
    ordering = ("amount",)
    extra = 0

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }


class ProgramCourseRegistrationInline(admin.TabularInline):
    model = ProgramCourseRegistration
    ordering = ("entity__firstname", "entity__lastname")
    readonly_fields = ("created_at",)
    raw_id_fields = ("entity",)
    extra = 0


class EventInlineForm(forms.ModelForm):
    title = forms.CharField(required=False)

    class Meta:
        model = Event
        fields = "__all__"

    def clean(self):
        cleaned_data = super().clean()
        event_title = cleaned_data.get("title")
        if not event_title:
            self.instance.title = cleaned_data["course"].program.name.get(
                settings.LANGUAGE_CODE
            )
        self.instance.type = EventType.COURSE
        self.instance.module = cleaned_data["course"].program.module


class EventInline(admin.TabularInline):
    model = Event
    ordering = ("time_from", "time_to")
    fields = (
        "title",
        "time_from",
        "time_to",
        # "description",
        "location",
        "status",
    )
    form = EventInlineForm
    extra = 0

    # formfield_overrides = {
    #     JSONField: {"widget": JSONEditor},
    # }


@admin.register(ProgramCourse)
class ProgramCourseAdmin(admin.ModelAdmin):
    search_fields = ("id", "program__name")
    list_display = (
        "program_name_locale",
        "date_from",
        "date_to",
    )
    list_filter = ("program", "date_from", "date_to")
    ordering = ("-date_from", "-date_to")
    inlines = (
        ProgramCoursePriceInline,
        EventInline,
        ProgramCourseRegistrationInline,
    )

    def get_queryset(self, request):
        return super().get_queryset(request).with_program_name()

    def program_name_locale(self, obj):
        return obj.program_name_locale

    program_name_locale.short_description = _("name")
