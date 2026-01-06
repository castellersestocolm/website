from django import forms
from django.contrib import admin, messages
from django.db.models import JSONField, Q
from jsoneditor.forms import JSONEditor
import nested_admin

import inline_actions.admin

import notify.tasks

from django.utils.translation import gettext_lazy as _

from activity.models import ProgramCourse
from event.models import (
    Location,
    Event,
    Registration,
    EventModule,
    EventRequirement,
    RegistrationLog,
    AgendaItem,
    GoogleCalendar,
    GoogleCalendarDefault,
    GoogleEvent,
    Connection,
    GoogleAlbum,
    EventModulePrice,
)
from notify.enums import EmailType


class ConnectionInline(admin.TabularInline):
    model = Connection
    ordering = ("name",)
    extra = 0


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    search_fields = ("id", "name", "address")
    list_display = ("name", "address")
    ordering = ("name",)
    inlines = (ConnectionInline,)

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }


# class RegistrationInlineFormAdmin(forms.ModelForm):
#     class Meta:
#         model = Registration
#         fields = ["user", "status", "line"]
#
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         self.fields["line"].queryset = PaymentLine.objects.filter(payment__entity__user_id=self.instance.user_id).order_by("-created_at") if self.instance else PaymentLine.objects.none()


class RegistrationInline(
    inline_actions.admin.InlineActionsMixin, nested_admin.NestedTabularInline
):
    model = Registration
    ordering = (
        "entity__firstname",
        "entity__lastname",
        "-created_at",
    )
    raw_id_fields = ("entity", "line")
    # form = RegistrationInlineFormAdmin
    extra = 0

    inline_actions = []

    def get_inline_actions(self, request, obj=None):
        actions = super().get_inline_actions(request, obj=None)
        if obj.line and self.has_change_permission(request, obj):
            actions.append("action_send_paid_email")
        return actions

    def action_send_paid_email(self, request, obj, parent_obj=None):
        notify.tasks.send_registration_email.delay(
            registration_ids=[obj.id],
            email_type=EmailType.REGISTRATION_PAID,
            module=obj.event.module,
        )
        messages.success(request, _("Action succeeded."))

    action_send_paid_email.short_description = _("Send paid email")


class EventModulePriceInline(nested_admin.NestedTabularInline):
    model = EventModulePrice
    ordering = ("-created_at",)
    extra = 0


class EventModuleInline(nested_admin.NestedTabularInline):
    model = EventModule
    ordering = ("module",)
    inlines = (EventModulePriceInline,)
    extra = 0


class EventRequirementInline(nested_admin.NestedTabularInline):
    model = EventRequirement
    ordering = ("name",)
    sortable_field_name = "name"
    extra = 0


class AgendaItemInline(nested_admin.NestedTabularInline):
    model = AgendaItem
    ordering = ("time_from",)
    extra = 0

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }


class EventForm(forms.ModelForm):
    class Meta:
        model = Event
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        program_course_filter = Q()
        if self.instance.module:
            program_course_filter &= Q(program__module=self.instance.module)
        self.fields["course"].queryset = ProgramCourse.objects.filter(
            program_course_filter
        ).order_by("-date_from", "-date_to")


@admin.register(Event)
class EventAdmin(
    inline_actions.admin.InlineActionsModelAdminMixin, nested_admin.NestedModelAdmin
):
    search_fields = ("id", "title")
    list_display = (
        "title",
        "time_from",
        "time_to",
        "type",
        "status",
        "module",
        "location",
        "max_registrations",
    )
    list_filter = ("type", "status", "module")
    ordering = ("-time_from",)
    inlines = (
        EventModuleInline,
        EventRequirementInline,
        AgendaItemInline,
        RegistrationInline,
    )
    readonly_fields = ("google_event", "google_album")
    raw_id_fields = ("course",)
    form = EventForm

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }


class RegistrationLogInline(admin.TabularInline):
    model = RegistrationLog
    readonly_fields = ("status", "created_at")
    ordering = ("-created_at",)
    extra = 0

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    search_fields = ("id",)
    list_display = ("id", "event", "entity", "status")
    list_filter = ("status",)
    ordering = ("-created_at",)
    inlines = (RegistrationLogInline,)


class GoogleCalendarDefaultInline(admin.TabularInline):
    model = GoogleCalendarDefault
    ordering = ("type",)
    extra = 0


@admin.register(GoogleCalendar)
class GoogleCalendarAdmin(admin.ModelAdmin):
    search_fields = ("id", "name", "external_id")
    list_display = ("name", "external_id", "is_primary", "google_integration")
    list_filter = ("is_primary", "google_integration")
    ordering = ("google_integration__module", "name")
    inlines = (GoogleCalendarDefaultInline,)


@admin.register(GoogleEvent)
class GoogleEventAdmin(admin.ModelAdmin):
    search_fields = ("id", "external_id")
    list_display = ("event", "google_calendar", "external_id")
    ordering = ("-event__time_from",)
    raw_id_fields = ("event",)


@admin.register(GoogleAlbum)
class GoogleEventAdmin(admin.ModelAdmin):
    search_fields = ("id", "external_id")
    list_display = ("event", "google_integration", "external_id")
    ordering = ("-event__time_from",)
    raw_id_fields = ("event",)
