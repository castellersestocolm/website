from django import forms
from django.contrib import admin

from comunicat.utils.admin import FIELD_LOCALE
from document.models import Document, EmailAttachment


class EmailAttachmentInline(admin.TabularInline):
    model = EmailAttachment
    extra = 0


class DocumentAdminForm(forms.ModelForm):
    language = FIELD_LOCALE(required=False)

    class Meta:
        model = Document
        fields = "__all__"


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    search_fields = ("id", "name", "code")
    list_display = (
        "name",
        "code",
        "language",
        "version",
        "module",
        "type",
        "status",
        "created_at",
    )
    list_filter = ("language", "type", "status", "module", "created_at")
    readonly_fields = ("preview",)
    ordering = ("-created_at",)
    form = DocumentAdminForm
    inlines = (EmailAttachmentInline,)
