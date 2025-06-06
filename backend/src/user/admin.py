from django import forms
from django.contrib import admin
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.urls import reverse
from django.utils import translation
from django.utils.safestring import mark_safe

import event.tasks
from notify.enums import EmailType
from user.models import User, FamilyMember, Family, FamilyMemberRequest, TowersUser
from django.conf import settings

import user.api
import notify.tasks

from django.utils.translation import gettext_lazy as _


class FamilyMemberRequestSentInline(admin.TabularInline):
    model = FamilyMemberRequest
    fk_name = "user_sender"
    extra = 0


class FamilyMemberRequestReceivedInline(admin.TabularInline):
    model = FamilyMemberRequest
    fk_name = "user_receiver"
    extra = 0


@admin.action(description="Send event sign-up email")
def send_signup_email(modeladmin, request, queryset):
    event.tasks.send_events_signup.delay(
        user_ids=list(queryset.values_list("id", flat=True))
    )


@admin.action(description="Send verification email")
def send_verification_email(modeladmin, request, queryset):
    for user_obj in queryset:
        if not user_obj.email_verified:
            user.api.request_verify(email=user_obj.email, module=user_obj.origin_module)


@admin.action(description="Send welcome email")
def send_welcome_email(modeladmin, request, queryset):
    for user_obj in queryset:
        if user_obj.registration_finished(module=user_obj.origin_module):
            notify.tasks.send_user_email.delay(
                user_id=user_obj.id,
                email_type=EmailType.WELCOME,
                module=user_obj.origin_module,
                locale=user_obj.preferred_language or translation.get_language(),
            )


@admin.action(description="Send imported email")
def send_imported_email(modeladmin, request, queryset):
    for user_obj in queryset:
        notify.tasks.send_user_email.delay(
            user_id=user_obj.id,
            email_type=EmailType.IMPORTED,
            module=user_obj.origin_module,
            locale=user_obj.preferred_language or translation.get_language(),
        )


@admin.action(description="Send membership renew email")
def send_membership_renew_email(modeladmin, request, queryset):
    for user_obj in queryset.with_has_active_membership().filter(
        has_active_membership=True
    ):
        notify.tasks.send_user_email.delay(
            user_id=user_obj.id,
            email_type=EmailType.MEMBERSHIP_RENEW,
            module=user_obj.origin_module,
            locale=user_obj.preferred_language or translation.get_language(),
        )


@admin.action(description="Send membership expired email")
def send_membership_expired_email(modeladmin, request, queryset):
    for user_obj in queryset.with_has_active_membership().filter(
        has_active_membership=False
    ):
        notify.tasks.send_user_email.delay(
            user_id=user_obj.id,
            email_type=EmailType.MEMBERSHIP_EXPIRED,
            module=user_obj.origin_module,
            locale=user_obj.preferred_language or translation.get_language(),
        )


class UserAdminForm(forms.ModelForm):
    alias = forms.CharField()
    height_shoulders = forms.IntegerField(min_value=0, max_value=200, required=False)
    height_arms = forms.IntegerField(min_value=0, max_value=250, required=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if hasattr(self.instance, "towers"):
            self.fields["alias"].initial = self.instance.towers.alias
            self.fields["height_shoulders"].initial = (
                self.instance.towers.height_shoulders
            )
            self.fields["height_arms"].initial = self.instance.towers.height_arms

    def clean(self):
        super().clean()

        if (
            hasattr(self.instance, "towers")
            and TowersUser.objects.filter(alias=self.cleaned_data["alias"])
            .exclude(id=self.instance.towers.id)
            .exists()
        ):
            raise ValidationError(
                {"alias": _("Another user already has the same alias.")}
            )

    def save(self, commit=True):
        instance = super().save(commit=False)
        self.save_m2m()

        if hasattr(instance, "towers"):
            instance.towers.alias = self.cleaned_data["alias"]
            instance.towers.height_shoulders = self.cleaned_data["height_shoulders"]
            instance.towers.height_arms = self.cleaned_data["height_arms"]
            instance.towers.save(
                update_fields=("alias", "height_shoulders", "height_arms")
            )

        return instance

    class Meta:
        model = User
        fields = "__all__"


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    search_fields = ("id", "email", "firstname", "lastname", "phone")
    list_display = (
        "email",
        "firstname",
        "lastname",
        "phone",
        "email_verified",
        "is_active",
        "consent_pictures",
        "preferred_language",
        "origin_module",
    )
    list_filter = ("email_verified", "is_active", "consent_pictures")
    readonly_fields = (
        "groups",
        "last_login",
        "created_at",
        "family",
    )
    exclude = ("password", "user_permissions")
    ordering = ("-created_at",)
    filter_horizontal = ("groups", "user_permissions")
    inlines = (FamilyMemberRequestSentInline, FamilyMemberRequestReceivedInline)
    actions = (
        send_verification_email,
        send_welcome_email,
        send_imported_email,
        send_signup_email,
        send_membership_renew_email,
        send_membership_expired_email,
    )
    form = UserAdminForm

    fieldset_base = (
        (
            None,
            {
                "fields": (
                    "email",
                    "firstname",
                    "lastname",
                    "phone",
                    "birthday",
                    "family",
                    "preferred_language",
                    "email_verified",
                    "consent_pictures",
                    "origin_module",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "created_at",
                )
            },
        ),
    )

    fieldset_towers = (
        (
            (
                settings.MODULE_TOWERS_SHORT_NAME,
                {"fields": settings.MODULE_TOWERS_USER_FIELDS},
            )
            if settings.MODULE_TOWERS_USER_FIELDS
            else ()
        ),
    )

    # def has_add_permission(self, request, obj=None):
    #     return False
    #
    # def has_delete_permission(self, request, obj=None):
    #     return False

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("towers")

    def get_fieldsets(self, request, obj=None):
        if hasattr(obj, "towers") and settings.MODULE_TOWERS_USER_FIELDS:
            return self.fieldset_base + self.fieldset_towers

        return self.fieldset_base

    def height_shoulders(self, obj):
        if hasattr(obj, "towers"):
            return obj.towers.height_shoulders
        return "-"

    def height_arms(self, obj):
        if hasattr(obj, "towers"):
            return obj.towers.height_arms
        return "-"

    def alias(self, obj):
        if hasattr(obj, "towers"):
            return obj.towers.alias
        return "-"

    def family(self, obj):
        if hasattr(obj, "family_member"):
            family_link = reverse(
                "admin:user_family_change", args=(obj.family_member.family_id,)
            )
            return mark_safe(
                f'<a href="{family_link}">{str(obj.family_member.family)}</a>'
            )
        return "-"


class FamilyMemberInlineForFamily(admin.TabularInline):
    model = FamilyMember
    extra = 0


@admin.register(Family)
class FamilyAdmin(admin.ModelAdmin):
    search_fields = ("id",)
    inlines = (FamilyMemberInlineForFamily,)

    # def has_delete_permission(self, request, obj=None):
    #     return False


@admin.register(FamilyMember)
class FamilyMemberAdmin(admin.ModelAdmin):
    search_fields = ("id", "user", "family")

    # def has_delete_permission(self, request, obj=None):
    #     return False


@admin.register(FamilyMemberRequest)
class FamilyMemberRequestAdmin(admin.ModelAdmin):
    search_fields = ("id", "user_sender", "email_receiver", "user_receiver", "family")

    # def has_delete_permission(self, request, obj=None):
    #     return False
