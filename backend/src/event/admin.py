import tempfile
from uuid import UUID

from django import forms
from django.contrib import admin, messages
from django.db.models import JSONField, Q, Prefetch
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.urls import path
from django.utils.safestring import mark_safe
from jsoneditor.forms import JSONEditor

import inline_actions.admin
from weasyprint import HTML

import notify.tasks

from django.utils.translation import gettext_lazy as _

from activity.models import ProgramCourse
from comunicat.consts import TEMPLATE_PDF_BY_MODULE
from comunicat.enums import PDFType
from comunicat.utils.admin import beautify_dict
from event.enums import EventStatus
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
    GooglePhotosAlbum,
    GoogleDriveAlbum,
    EventPrice,
    EventQuestion,
    EventSignup,
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


class RegistrationInlineForm(forms.ModelForm):
    class Meta:
        model = EventPrice
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["price"].queryset = EventPrice.objects.filter(
            (Q(event=self.instance.event) if hasattr(self.instance, "event") else Q()),
        ).order_by("module", "amount")


class RegistrationInline(inline_actions.admin.InlineActionsMixin, admin.TabularInline):
    model = Registration
    ordering = (
        "entity__firstname",
        "entity__lastname",
        "-created_at",
    )
    readonly_fields = ("data_nice",)
    raw_id_fields = ("entity", "line")
    exclude = ("data",)
    form = RegistrationInlineForm
    extra = 0

    inline_actions = []

    def get_queryset(self, request):
        return super().get_queryset(request=request).select_related("entity", "event")

    def data_nice(self, obj):
        if not obj.data:
            return "-"

        return mark_safe(beautify_dict(data=obj.data))

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

    data_nice.short_description = _("Data")
    action_send_paid_email.short_description = _("Send paid email")


class EventModuleInline(admin.TabularInline):
    model = EventModule
    ordering = ("module",)
    extra = 0

    def get_queryset(self, request):
        return super().get_queryset(request=request).select_related("event")


class EventPriceInline(admin.TabularInline):
    model = EventPrice
    ordering = (
        "module",
        "-amount",
        "min_registrations",
        "age_from",
        "age_to",
    )
    extra = 0

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def get_queryset(self, request):
        return super().get_queryset(request=request).select_related("event")


class EventSignupInline(admin.TabularInline):
    model = EventSignup
    ordering = ("module",)
    extra = 0

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def get_queryset(self, request):
        return super().get_queryset(request=request).select_related("event")


class EventQuestionInline(admin.StackedInline):
    model = EventQuestion
    ordering = ("order",)
    extra = 0

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def get_queryset(self, request):
        return super().get_queryset(request=request).select_related("event")


class EventRequirementInline(admin.TabularInline):
    model = EventRequirement
    ordering = ("name",)
    sortable_field_name = "name"
    extra = 0

    def get_queryset(self, request):
        return super().get_queryset(request=request).select_related("event")


class AgendaItemInline(admin.TabularInline):
    model = AgendaItem
    ordering = ("time_from",)
    extra = 0

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def get_queryset(self, request):
        return super().get_queryset(request=request).select_related("event")


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


@admin.action(description=_("Publish selected events"))
def publish_events(modeladmin, request, queryset):
    for event_obj in queryset:
        event_obj.status = EventStatus.PUBLISHED
        event_obj.save(update_fields=("status",))


@admin.register(Event)
class EventAdmin(inline_actions.admin.InlineActionsModelAdminMixin, admin.ModelAdmin):
    search_fields = ("id", "title")
    list_display = (
        "title_locale",
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
        EventSignupInline,
        EventPriceInline,
        EventRequirementInline,
        EventQuestionInline,
        AgendaItemInline,
        RegistrationInline,
    )
    actions = (publish_events,)
    readonly_fields = ("google_event", "google_album")
    raw_id_fields = ("course",)
    form = EventForm

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def get_queryset(self, request):
        return super().get_queryset(request).with_title()

    def title_locale(self, obj):
        return obj.title_locale

    def get_urls(self):
        urls = super().get_urls()

        return [
            path(
                "<path:object_id>/print/",
                self.print,
                name="event_event_print",
            )
        ] + urls

    def print(self, request, object_id: UUID):
        response = HttpResponse(content_type="aplication/pdf")
        response["Content-Disposition"] = f"attachment; filename=Event_{object_id}.pdf"
        response["Content-Transfer-Encoding"] = "binary"

        event_obj = (
            Event.objects.filter(id=object_id)
            .prefetch_related(
                Prefetch(
                    "registrations",
                    Registration.objects.select_related("entity", "entity__user")
                    .with_amount()
                    .order_by(
                        "status", "entity__lastname", "entity__firstname", "-created_at"
                    ),
                    to_attr="all_registrations",
                ),
            )
            .with_title()
            .first()
        )

        context = {"event_obj": event_obj}
        html_string = render_to_string(
            template_name=TEMPLATE_PDF_BY_MODULE[event_obj.module][
                PDFType.REGISTRATION
            ]["pdf"],
            context=context,
        )
        html = HTML(string=html_string)
        result = html.write_pdf()

        with tempfile.NamedTemporaryFile(delete=True) as output:
            output.write(result)
            output.flush()

            output = open(output.name, "rb")
            response.write(output.read())

        return response

    title_locale.short_description = _("title")


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


class GooglePhotosAlbumInline(admin.TabularInline):
    model = GooglePhotosAlbum
    extra = 0


class GoogleDriveAlbumInline(admin.TabularInline):
    model = GoogleDriveAlbum
    extra = 0


@admin.register(GoogleAlbum)
class GoogleEventAdmin(admin.ModelAdmin):
    search_fields = ("id", "external_id")
    list_display = (
        "event",
        "time_from",
        "google_integration",
        "external_id",
    )
    ordering = ("-event__time_from",)
    raw_id_fields = ("event",)
    inlines = (GooglePhotosAlbumInline, GoogleDriveAlbumInline)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("event")

    def time_from(self, obj):
        return obj.event.time_from

    time_from.short_description = _("time from")
