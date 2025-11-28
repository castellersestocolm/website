from uuid import UUID

from django import forms
from django.conf import settings
from django.contrib import admin
from django.db.models import JSONField
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.urls import path, reverse
from django.utils import translation
from django.utils.safestring import mark_safe
from jsoneditor.forms import JSONEditor
from django.contrib.admin.widgets import ForeignKeyRawIdWidget

from django.utils.translation import gettext_lazy as _

import notify.tasks

from comunicat.utils.admin import FIELD_LOCALE
from notify.api.template import get_email_render
from notify.consts import TEMPLATE_BY_MODULE, SETTINGS_BY_MODULE
from notify.enums import EmailStatus, NotificationType, EmailType
from notify.models import Email, EmailTemplate, ContactMessage
from payment.models import Entity


class EmailForm(forms.ModelForm):
    entity = forms.ModelChoiceField(
        Entity.objects.all(),
        widget=ForeignKeyRawIdWidget(
            Email._meta.get_field("entity").remote_field, admin.site
        ),
    )
    template = forms.ModelChoiceField(
        EmailTemplate.objects.all(),
    )
    locale = FIELD_LOCALE()
    body = forms.CharField(required=False, widget=forms.Textarea)
    button_text = forms.CharField(required=False)
    button_url = forms.CharField(required=False)

    class Meta:
        model = Email
        fields = ["entity", "template", "locale"]
        raw_id_fields = ("entity",)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["body"].initial = self.instance.context.get("extra_body", "")

    def clean(self):
        cleaned_data = super().clean()
        email_template_obj = cleaned_data.get("template")
        template_body = email_template_obj.body.get(cleaned_data["locale"])
        button_text = cleaned_data.get(
            "button_text"
        ) or email_template_obj.button_text.get(cleaned_data["locale"])
        button_url = cleaned_data.get(
            "button_url"
        ) or email_template_obj.button_url.get(cleaned_data["locale"])
        email_body = cleaned_data.get("body")

        self.instance.subject = email_template_obj.subject[cleaned_data["locale"]]
        self.instance.module = email_template_obj.module
        self.instance.context = {
            **({"template_body": template_body} if template_body else {}),
            **({"extra_body": email_body} if email_body else {}),
            **self.instance.context,
            **(
                {"button_text": button_text, "button_url": button_url}
                if button_text and button_url
                else {}
            ),
        }


@admin.action(description=_("Send email"))
def send_email(modeladmin, request, queryset):
    for email_obj in queryset:
        notify.tasks.send_generic_email.delay(
            email_id=email_obj.id,
        )


@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    search_fields = ("id", "entity", "subject")
    list_display = ("entity", "type", "status", "subject", "created_at")
    list_filter = ("type", "created_at")
    raw_id_fields = ("entity",)
    exclude = ("context",)
    ordering = ("-created_at",)
    actions = (send_email,)

    def get_readonly_fields(self, request, obj=None):
        readonly_fields = []

        if obj is None:
            return []

        readonly_fields.append("preview")

        return readonly_fields

    def get_form(self, request, obj=None, **kwargs):
        if not obj or obj.status < EmailStatus.SENT:
            return EmailForm
        return super().get_form(request=request, obj=obj, **kwargs)

    def get_urls(self):
        urls = super().get_urls()

        return [
            path(
                "<path:object_id>/preview/",
                self.preview_view,
                name="notify_email_preview",
            )
        ] + urls

    def has_change_permission(self, request, obj=None):
        return not obj or obj.status < EmailStatus.SENT

    def has_delete_permission(self, request, obj=None):
        return not obj or obj.status < EmailStatus.SENT

    def preview(self, obj):
        preview_html = f"<iframe style='border: 1px solid var(--hairline-color);width: 100%;min-width: 750px;min-height: 500px' src='{reverse(
                "admin:notify_email_preview", args=(obj.id,)
            )}'></iframe>"
        return mark_safe(preview_html)

    def preview_view(self, request, object_id: UUID):
        email_render = get_email_render(email_id=object_id)

        if not email_render:
            return HttpResponse()

        return HttpResponse(email_render.body)

    preview.short_description = _("preview")


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    search_fields = ("id", "subject")
    list_display = ("subject_locale", "module", "created_at")
    list_filter = ("module",)
    readonly_fields = ("preview",)
    ordering = ("-created_at",)

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def get_queryset(self, request):
        return super().get_queryset(request).with_subject()

    def get_urls(self):
        urls = super().get_urls()

        return [
            path(
                "<path:object_id>/preview/",
                self.preview_view,
                name="notify_emailtemplate_preview",
            )
        ] + urls

    def subject_locale(self, obj):
        return obj.subject_locale

    def preview(self, obj):
        preview_html = f"<iframe style='border: 1px solid var(--hairline-color);width: 100%;min-width: 750px;min-height: 500px' src='{reverse(
                "admin:notify_emailtemplate_preview", args=(obj.id,)
            )}'></iframe>"
        return mark_safe(preview_html)

    def preview_view(self, request, object_id: UUID):
        email_template_obj = EmailTemplate.objects.get(id=object_id)

        locale = translation.get_language()
        if locale not in [code for code, __ in settings.LANGUAGES]:
            locale = "ca"

        context = {
            **SETTINGS_BY_MODULE[email_template_obj.module],
            **{
                "template_body": email_template_obj.body[locale],
                "button_text": email_template_obj.button_text[locale],
                "button_url": email_template_obj.button_url[locale],
            },
        }
        template = TEMPLATE_BY_MODULE[email_template_obj.module][
            NotificationType.EMAIL
        ][EmailType.GENERAL]
        body = render_to_string(template["html"], context)

        return HttpResponse(body)

    subject_locale.short_description = _("subject")
    preview.short_description = _("preview")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    search_fields = (
        "id",
        "entity__firstname",
        "entity__lastname",
        "entity__email",
        "message",
    )
    list_display = ("entity", "type", "status", "module", "created_at")
    list_filter = ("module",)
    raw_id_fields = ("entity",)
    ordering = ("-created_at",)

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def get_readonly_fields(self, request, obj=None):
        readonly_fields = []

        if obj is None:
            return []

        readonly_fields += ["entity", "type", "module", "message", "context"]

        return readonly_fields
