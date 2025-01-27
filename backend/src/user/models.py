import hashlib
import os

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.utils.functional import cached_property
from django.utils.translation import gettext as _

from comunicat.db.mixins import Timestamps, StandardModel
from user.managers import UserManager


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

    email_verified = models.BooleanField(default=False)
    verify_key = models.CharField(max_length=127, blank=True, null=True)
    verify_expiration = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = ("firstname", "lastname")

    def __str__(self) -> str:
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

    def disable_verify(self):
        self.email_verified = False
        self.save()

    def update_verify(self):
        chars = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)"
        secret_key = get_random_string(32, chars)
        self.verify_key = hashlib.sha256(
            (secret_key + self.email).encode("utf-8")
        ).hexdigest()
        self.verify_expiration = timezone.now() + timezone.timedelta(days=1)
        self.save(update_fields=("verify_key", "verify_expiration"))

    def delete_verify_key(self):
        self.verify_key = None
        self.save(update_fields=("verify_key",))

    def verify(self, verify_key):
        if timezone.now() <= self.verify_expiration and self.verify_key == verify_key:
            self.email_verified = True
            self.delete_verify_key()
            self.save(update_fields=("email_verified",))


class GoogleUser(User):
    class Meta:
        proxy = True

    def save(self, *args, **kwargs):
        self.clean()
        self.email_verified = True
        return super().save(*args, **kwargs)
