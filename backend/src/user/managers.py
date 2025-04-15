import datetime
from typing import List

from django.apps import apps

from django.contrib.auth.base_user import BaseUserManager
from django.db import IntegrityError
from django.db.models import Exists, Subquery, Q, OuterRef, QuerySet

from comunicat.enums import Module

from django.conf import settings

from membership.enums import MembershipStatus


class UserQuerySet(QuerySet):
    def with_has_active_membership(self, modules: List[Module] | None = None):
        MembershipModule = apps.get_model("membership", "MembershipModule")

        module_filter = Q()
        if modules is not None:
            module_filter = Q(module__in=modules)

        return self.annotate(
            has_active_membership=Exists(
                Subquery(
                    MembershipModule.objects.filter(
                        module_filter,
                        status=MembershipStatus.ACTIVE,
                        membership__status=MembershipStatus.ACTIVE,
                        membership__membership_users__user_id=OuterRef("id"),
                    )
                )
            )
        )


class UserManager(BaseUserManager):
    def get_queryset(self):
        return UserQuerySet(model=self.model, using=self._db, hints=self._hints)

    def with_has_active_membership(self, modules: List[Module] | None = None):
        return self.get_queryset().with_has_active_membership(modules=modules)

    def create_user(
        self,
        email: str,
        firstname: str | None = None,
        lastname: str | None = None,
        password: str | None = None,
        phone: str | None = None,
        birthday: datetime.date | None = None,
        origin_module: Module = settings.MODULE_DEFAULT,
        is_staff: bool = False,
        is_superuser: bool = False,
        email_verified: bool = False,
        consent_pictures: bool = False,
        preferred_language: str | None = None,
    ):
        if not firstname or not lastname:
            firstname = email.split("@")[0].capitalize()
            split_char = None
            if "." in firstname:
                split_char = "."
            elif "_" in firstname:
                split_char = "_"
            elif "-" in firstname:
                split_char = "-"
            if split_char:
                firstname = firstname.split(split_char)[0]
                lastname = "".join(firstname.split(split_char)[1:])

        try:
            user = self.model(
                email=email.lower(),
                firstname=firstname,
                lastname=lastname,
                phone=phone,
                birthday=birthday,
                consent_pictures=consent_pictures,
                preferred_language=preferred_language,
                email_verified=email_verified,
                origin_module=origin_module,
                is_staff=is_staff,
                is_superuser=is_superuser,
            )

            user.set_password(password)
            user.save(using=self._db)
        except IntegrityError:
            user = self.model.objects.filter(email=email.lower()).first()

        return user

    def create_superuser(
        self, email: str, firstname: str, lastname: str, password: str
    ):
        user = self.create_user(
            email=email,
            firstname=firstname,
            lastname=lastname,
            password=password,
            origin_module=settings.MODULE_DEFAULT,
            is_staff=True,
            is_superuser=True,
            email_verified=True,
            consent_pictures=True,
        )
        user.save(using=self._db)
        return user
