import datetime
import random
import unicodedata
from uuid import UUID

from django.contrib.auth import (
    authenticate,
    login as django_login,
    logout as django_logout,
)
from django.core import signing
from django.db import IntegrityError, transaction
from django.db.models import Prefetch, Exists, OuterRef
from django.http import HttpRequest
from django.utils import translation, timezone
from rest_framework.exceptions import AuthenticationFailed

import membership.api
import user.api.family_member_request
from comunicat.enums import Module
from legal.enums import TeamType
from legal.models import Member
from notify.enums import EmailType
from notify.tasks import send_user_email
from user.enums import FamilyMemberStatus, FamilyMemberRole
from user.models import User, TowersUser, FamilyMember, Family
from user.utils import get_default_consent_pictures


def get(user_id: UUID) -> User:
    return (
        User.objects.filter(id=user_id)
        .select_related("towers", "family_member", "family_member__family")
        .prefetch_related(
            Prefetch(
                "family_member__family__members",
                FamilyMember.objects.filter(
                    status__in=(FamilyMemberStatus.REQUESTED, FamilyMemberStatus.ACTIVE)
                ).order_by("-role", "user__firstname", "user__lastname"),
            )
        )
        .with_permission_level()
        .first()
    )


def get_list(
    user_ids: list[UUID] | None = None,
    exclude_team_types: list[TeamType] | None = None,
    modules: list[Module] | None = None,
) -> list[User]:
    user_qs = (
        User.objects.select_related("towers", "family_member", "family_member__family")
        .prefetch_related(
            Prefetch(
                "family_member__family__members",
                FamilyMember.objects.filter(
                    status__in=(FamilyMemberStatus.REQUESTED, FamilyMemberStatus.ACTIVE)
                ).order_by("-role", "user__firstname", "user__lastname"),
            )
        )
        .with_permission_level()
        .order_by("firstname", "lastname", "created_at")
    )

    if user_ids:
        user_qs = user_qs.filter(id__in=user_ids)

    if modules:
        user_qs = user_qs.with_has_active_membership(modules=modules).filter(
            has_active_membership=True
        )

    if exclude_team_types:
        user_qs = user_qs.with_has_active_role(
            team_types=exclude_team_types, modules=modules
        ).filter(has_active_role=False)

    return list(user_qs)


def login(email: str, password: str, request: HttpRequest, module: Module) -> User:
    user_obj = authenticate(request, username=email, password=password)

    if user_obj is None or not user_obj.email_verified:
        raise AuthenticationFailed()

    if user_obj.preferred_language:
        translation.activate(user_obj.preferred_language)

    # TODO: Use module + membership to determine if a user can login through a certain module

    django_login(
        request=request,
        user=user_obj,
        backend="django.contrib.auth.backends.ModelBackend",
    )

    return user_obj


def logout(request: HttpRequest) -> None:
    return django_logout(request)


def generate_alias(firstname: str, lastname: str) -> str:
    existing_aliases = TowersUser.objects.values_list("alias", flat=True)

    firstname = unicodedata.normalize("NFKD", firstname).replace(" ", "")

    if firstname not in existing_aliases:
        return firstname

    lastname = unicodedata.normalize("NFKD", firstname).replace(" ", "")

    alias = base_alias = firstname + lastname

    while alias in existing_aliases:
        alias = base_alias + str(random.randint(0, 10000))

    return alias


def create(
    firstname: str,
    lastname: str,
    email: str,
    phone: str | None,
    password: str | None,
    birthday: datetime.date,
    consent_pictures: bool,
    module: Module,
    towers: dict | None,
    organisation: dict | None,
    preferred_language: str | None = None,
    with_family: bool = True,
) -> User:
    consent_pictures |= get_default_consent_pictures(birthday=birthday)
    user_obj = User.objects.create_user(
        firstname=firstname,
        lastname=lastname,
        email=email,
        password=password,
        phone=phone,
        birthday=birthday,
        origin_module=module,
        email_verified=False,
        consent_pictures=consent_pictures,
        preferred_language=preferred_language,
    )

    if towers:
        TowersUser.objects.create(
            user=user_obj,
            alias=generate_alias(firstname=firstname, lastname=lastname),
            height_shoulders=towers.get("height_shoulders"),
            height_arms=towers.get("height_arms"),
        )

    if with_family:
        family_obj = Family.objects.create()
        FamilyMember.objects.create(
            user=user_obj,
            family=family_obj,
            role=FamilyMemberRole.MANAGER,
            status=FamilyMemberStatus.ACTIVE,
        )

    # Link existing requests to the newly created user
    user.api.family_member_request.link(email=email)

    return user_obj


def register(
    firstname: str,
    lastname: str,
    email: str,
    phone: str | None,
    password: str,
    birthday: datetime.date,
    consent_pictures: bool,
    preferred_language: str,
    module: Module,
    towers: dict | None,
    organisation: dict | None,
) -> User | None:
    try:
        user_obj = create(
            firstname=firstname,
            lastname=lastname,
            email=email,
            phone=phone,
            password=password,
            birthday=birthday,
            consent_pictures=consent_pictures,
            preferred_language=preferred_language,
            module=module,
            towers=towers,
            organisation=organisation,
        )

        request_verify(email=user_obj.email, with_key=True, module=module)

        membership.api.create_or_update(user_id=user_obj.id, modules=[module])

        return user_obj
    except IntegrityError:
        # TODO: Maybe send an email here
        return None


def update(
    id: UUID,
    firstname: str,
    lastname: str,
    phone: str | None,
    birthday: datetime.date,
    consent_pictures: bool,
    preferred_language: str,
    module: Module,
    towers: dict | None,
    organisation: dict | None,
) -> User:
    user_obj = User.objects.get(id=id)

    had_registration_finished = user_obj.registration_finished(module=module)

    user_obj.firstname = firstname
    user_obj.lastname = lastname
    user_obj.phone = phone
    user_obj.birthday = birthday
    user_obj.preferred_language = preferred_language

    user_obj.save(
        update_fields=(
            "firstname",
            "lastname",
            "phone",
            "birthday",
            "preferred_language",
        )
    )

    if towers:
        TowersUser.objects.update_or_create(
            user=user_obj,
            defaults={
                "alias": generate_alias(firstname=firstname, lastname=lastname),
                "height_shoulders": towers.get("height_shoulders"),
                "height_arms": towers.get("height_arms"),
            },
        )

    if not had_registration_finished and user_obj.registration_finished(module=module):
        locale = translation.get_language()

        send_user_email.delay(
            user_id=user_obj.id,
            email_type=EmailType.WELCOME,
            module=module,
            locale=locale,
        )

    return user_obj


@transaction.atomic
def request_password(email: str, module: Module, locale: str | None = None) -> None:
    user_obj = User.objects.filter(email=email).first()

    if not user_obj:
        return None

    token = signing.dumps(
        {"user_id": str(user_obj.id), "updated_at": user_obj.updated_at.isoformat()},
        salt="forgot-password",
    )

    locale = locale or translation.get_language()

    send_user_email.delay(
        user_id=user_obj.id,
        email_type=EmailType.PASSWORD,
        module=module,
        context={"token": token},
        locale=locale,
    )


@transaction.atomic
def set_password(
    token: str, password: str, module: Module, request: HttpRequest
) -> User | None:
    try:
        data: dict = signing.loads(
            token, salt="forgot-password", max_age=timezone.timedelta(days=1)
        )
    except Exception:
        return None

    user_obj = User.objects.filter(id=data["user_id"]).first()

    if not user_obj:
        return None

    user_obj.set_password(password)
    user_obj.save(update_fields=("password",))

    django_login(
        request=request,
        user=user_obj,
        backend="django.contrib.auth.backends.ModelBackend",
    )

    return user_obj


@transaction.atomic
def request_verify(email: str, module: Module, locale: str | None = None) -> None:
    user_obj = User.objects.filter(email=email).first()

    if not user_obj:
        return None

    token = signing.dumps(
        {"user_id": str(user_obj.id), "updated_at": user_obj.updated_at.isoformat()},
        salt="verify-email",
    )

    locale = locale or translation.get_language()

    send_user_email.delay(
        user_id=user_obj.id,
        email_type=EmailType.REGISTER,
        module=module,
        context={"token": token},
        locale=locale,
    )


@transaction.atomic
def set_verify(token: str, module: Module, request: HttpRequest) -> User | None:
    try:
        data: dict = signing.loads(
            token, salt="verify-email", max_age=timezone.timedelta(days=1)
        )
    except Exception:
        return None

    user_obj = User.objects.filter(id=data["user_id"]).first()

    if not user_obj:
        return None

    user_obj.email_verified = True
    user_obj.save(update_fields=("email_verified",))

    django_login(
        request=request,
        user=user_obj,
        backend="django.contrib.auth.backends.ModelBackend",
    )

    return user_obj
