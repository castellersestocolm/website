from django.contrib import admin

from document.models import Document, EmailAttachment


class EmailAttachmentInline(admin.TabularInline):
    model = EmailAttachment
    extra = 0


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    search_fields = ("id", "name", "code")
    list_display = (
        "name",
        "code",
        "language",
        "version",
        "type",
        "status",
        "created_at",
    )
    list_filter = ("language", "type", "status", "created_at")
    ordering = ("-created_at",)
    inlines = (EmailAttachmentInline,)
