from django.contrib import admin
from django.db.models import JSONField
from jsoneditor.forms import JSONEditor

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
    GoogleIntegration,
    Connection,
)


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


class RegistrationInline(admin.TabularInline):
    model = Registration
    ordering = ("-created_at",)
    extra = 0


class EventModuleInline(admin.TabularInline):
    model = EventModule
    ordering = ("module",)
    extra = 0


class EventRequirementInline(admin.TabularInline):
    model = EventRequirement
    ordering = ("name",)
    extra = 0


class AgendaItemInline(admin.TabularInline):
    model = AgendaItem
    ordering = ("time_from",)
    extra = 0


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    search_fields = ("id", "title")
    list_display = (
        "title",
        "time_from",
        "time_to",
        "type",
        "module",
        "location",
        "max_registrations",
    )
    list_filter = ("type", "module")
    ordering = ("-time_from",)
    inlines = (
        EventModuleInline,
        EventRequirementInline,
        AgendaItemInline,
        RegistrationInline,
    )


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
    list_display = ("id", "event", "user", "status")
    list_filter = ("status",)
    ordering = ("-created_at",)
    inlines = (RegistrationLogInline,)


class GoogleCalendarDefaultInline(admin.TabularInline):
    model = GoogleCalendarDefault
    ordering = ("type",)
    extra = 0


@admin.register(GoogleIntegration)
class GoogleIntegrationAdmin(admin.ModelAdmin):
    search_fields = ("id",)
    list_display = ("id", "module")
    list_filter = ("module",)
    ordering = ("module",)


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
