import os

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models, transaction
from django.utils.functional import cached_property
from django.utils.translation import gettext_lazy as _

from comunicat.db.mixins import Timestamps, StandardModel
from comunicat.enums import Module
from user.enums import FamilyMemberRole, FamilyMemberStatus, FamilyMemberRequestStatus
from user.managers import UserManager
from user.utils import is_over_minimum_age


def user_picture_filename(instance, filename):
    ext = os.path.splitext(filename)[1]
    return f"user/picture/{instance.id}{ext}"


class User(AbstractBaseUser, StandardModel, Timestamps, PermissionsMixin):
    email = models.EmailField(unique=True)
    firstname = models.CharField(max_length=255, null=True, blank=True)
    lastname = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=255, null=True, blank=True)
    birthday = models.DateField(null=True, blank=True)
    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
    )
    is_active = models.BooleanField(
        _("active"),
        default=True,
    )

    consent_pictures = models.BooleanField(default=False)

    preferred_language = models.CharField(max_length=255, null=True, blank=True)

    # Tracks where the user was created
    origin_module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )

    email_verified = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = ("firstname", "lastname")

    def __str__(self) -> str:
        if self.firstname:
            if self.lastname:
                return f"{self.firstname} {self.lastname} <{self.email}>"
            return f"{self.firstname} <{self.email}>"
        return self.email

    def get_fullname_or_email(self) -> str:
        return (
            f"{self.firstname} {self.lastname}"
            if (self.firstname and self.lastname)
            else self.email
        )

    def get_full_name(self) -> str:
        return self.email

    def get_short_name(self) -> str:
        return self.email

    @cached_property
    def name(self) -> str:
        if self.lastname:
            return f"{self.firstname} {self.lastname}"
        return self.firstname

    @cached_property
    def is_adult(self) -> bool:
        return self.birthday is not None and is_over_minimum_age(date=self.birthday)

    @cached_property
    def can_manage(self) -> bool:
        return self.is_adult

    def registration_finished(self, module: Module) -> bool:
        if not self.birthday:
            return False

        if module == Module.TOWERS:
            if (
                not hasattr(self, "towers")
                or not self.towers.height_shoulders
                or not self.towers.height_arms
            ):
                return False

        return True

    def disable_verify(self):
        self.email_verified = False
        self.save()

    def save(self, *args, **kwargs):
        import pinyator.tasks

        transaction.on_commit(
            lambda: pinyator.tasks.update_or_create_user.delay(user_id=self.id)
        )

        super().save(*args, **kwargs)


class TowersUser(StandardModel, Timestamps):
    user = models.OneToOneField("User", related_name="towers", on_delete=models.CASCADE)

    alias = models.CharField(unique=True)
    height_shoulders = models.PositiveIntegerField(null=True, blank=True)
    height_arms = models.PositiveIntegerField(null=True, blank=True)


class Family(StandardModel, Timestamps):
    def __str__(self) -> str:
        member_objs = self.members.filter(
            status=FamilyMemberStatus.ACTIVE, role=FamilyMemberRole.MANAGER
        ).order_by("user__lastname")
        if member_objs:
            return "-".join([member_obj.user.lastname for member_obj in member_objs])
        return str(self.id)

    class Meta:
        verbose_name = "family"
        verbose_name_plural = "families"


class FamilyMember(StandardModel, Timestamps):
    user = models.OneToOneField(
        User, related_name="family_member", on_delete=models.CASCADE
    )
    family = models.ForeignKey(Family, related_name="members", on_delete=models.CASCADE)
    role = models.PositiveSmallIntegerField(
        choices=((fmr.value, fmr.name) for fmr in FamilyMemberRole),
        default=FamilyMemberRole.MEMBER,
    )
    status = models.PositiveSmallIntegerField(
        choices=((fms.value, fms.name) for fms in FamilyMemberStatus),
        default=FamilyMemberStatus.REQUESTED,
    )

    def __str__(self) -> str:
        return str(self.user)

    class Meta:
        unique_together = ("user", "family")


class FamilyMemberRequest(StandardModel, Timestamps):
    user_sender = models.ForeignKey(
        User, related_name="family_member_sent_requests", on_delete=models.CASCADE
    )
    email_receiver = models.EmailField()
    user_receiver = models.ForeignKey(
        User,
        null=True,
        related_name="family_member_received_requests",
        on_delete=models.CASCADE,
    )
    family = models.ForeignKey(
        Family, related_name="member_requests", on_delete=models.CASCADE
    )
    status = models.PositiveSmallIntegerField(
        choices=((fmrs.value, fmrs.name) for fmrs in FamilyMemberRequestStatus),
        default=FamilyMemberRequestStatus.REQUESTED,
    )

    def save(self, *args, **kwargs):
        self.clean()
        self.user = User.objects.filter(email=self.email_receiver).first()
        return super().save(*args, **kwargs)


class GoogleUser(User):
    class Meta:
        proxy = True

    def save(self, *args, **kwargs):
        self.clean()
        self.email_verified = True
        return super().save(*args, **kwargs)
