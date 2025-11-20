from django import forms
from django.contrib import admin
from django.db.models import JSONField
from django.utils import translation
from jsoneditor.forms import JSONEditor
from django.contrib.admin.widgets import ForeignKeyRawIdWidget

from django.utils.translation import gettext_lazy as _

import notify.tasks

from comunicat.utils.admin import FIELD_LOCALE
from notify.enums import EmailStatus
from notify.models import Email, EmailTemplate
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
    locale = FIELD_LOCALE
    body = forms.CharField(required=False, widget=forms.Textarea)

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
        template_button_text = email_template_obj.button_text.get(
            cleaned_data["locale"]
        )
        template_button_url = email_template_obj.button_url.get(cleaned_data["locale"])
        email_body = cleaned_data.get("body")

        self.instance.subject = email_template_obj.subject[cleaned_data["locale"]]
        self.instance.module = email_template_obj.module
        self.instance.context = {
            **({"template_body": template_body} if template_body else {}),
            **({"extra_body": email_body} if email_body else {}),
            **self.instance.context,
            **(
                {"button_text": template_button_text, "button_url": template_button_url}
                if template_button_text and template_button_url
                else {}
            ),
        }


@admin.action(description=_("Send email"))
def send_email(modeladmin, request, queryset):
    for email_obj in queryset:
        notify.tasks.send_generic_email(
            email_id=email_obj.id,
        )


@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    search_fields = ("id", "entity", "subject")
    list_display = ("entity", "type", "status", "subject", "created_at")
    list_filter = ("type", "created_at")
    raw_id_fields = ("entity",)
    ordering = ("-created_at",)
    actions = (send_email,)

    def get_form(self, request, obj=None, **kwargs):
        if not obj or obj.status < EmailStatus.SENT:
            return EmailForm
        return super().get_form(request=request, obj=obj, **kwargs)

    def has_change_permission(self, request, obj=None):
        return not obj or obj.status < EmailStatus.SENT


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    search_fields = ("id", "subject")
    list_display = ("subject_locale", "module", "created_at")
    list_filter = ("module",)
    ordering = ("-created_at",)

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def get_queryset(self, request):
        return super().get_queryset(request).with_subject()

    def subject_locale(self, obj):
        return obj.subject_locale

    subject_locale.short_description = _("subject")
