import datetime
from uuid import UUID

from django.apps import apps

from django.contrib.auth.base_user import BaseUserManager
from django.contrib.postgres.aggregates import StringAgg
from django.db import IntegrityError
from django.db.models import (
    Exists,
    Subquery,
    Q,
    OuterRef,
    QuerySet,
    Case,
    IntegerField,
    Value,
    When,
    ExpressionWrapper,
    BooleanField,
    F,
    UUIDField,
)
from django.utils import timezone

from comunicat.enums import Module

from django.conf import settings

from legal.enums import TeamType, PermissionLevel
from membership.enums import MembershipStatus
from user.enums import FamilyMemberStatus, FamilyMemberRole
from user.utils import is_over_minimum_age


class UserQuerySet(QuerySet):
    def with_family_name(self):
        Family = apps.get_model("user", "Family")

        return self.annotate(
            family_name=Subquery(
                Family.objects.filter(id=OuterRef("family_member__family_id"))
                .annotate(
                    family_name=StringAgg(
                        "members__user__lastname",
                        filter=Q(
                            members__status=FamilyMemberStatus.ACTIVE,
                            members__role=FamilyMemberRole.MANAGER,
                        ),
                        delimiter="-",
                        order_by="members__user__lastname",
                    )
                )
                .values("family_name")[:1]
            ),
        )

    def with_has_active_membership(
        self,
        with_pending: bool = False,
        with_expired: bool = False,
        date: datetime.date | None = None,
        modules: list[Module] | None = None,
    ):
        Membership = apps.get_model("membership", "Membership")
        MembershipModule = apps.get_model("membership", "MembershipModule")

        module_filter = Q()
        if modules is not None:
            module_filter = Q(module__in=modules)

        status = (
            [
                MembershipStatus.REQUESTED,
                MembershipStatus.PROCESSING,
                MembershipStatus.ACTIVE,
            ]
            if with_pending
            else [MembershipStatus.ACTIVE]
        )

        date = date or timezone.localdate()

        if with_expired:
            annotate_dict = {
                "membership_current_id": Subquery(
                    MembershipModule.objects.filter(
                        module_filter,
                        Q(membership__date_end__isnull=True)
                        | Q(membership__date_end__gte=date),
                        status__in=status,
                        membership__status__in=status,
                        membership__date_from__lte=date,
                        membership__date_to__gte=date,
                        membership__membership_users__user_id=OuterRef("id"),
                    )
                    .order_by("-membership__date_to")
                    .values_list("membership_id", flat=True)[:1]
                ),
                "membership_id": Case(
                    When(
                        membership_current_id__isnull=True,
                        then=Subquery(
                            MembershipModule.objects.filter(
                                module_filter,
                                # Doesn't have date end set
                                membership__date_end__isnull=True,
                                membership__date_to__lt=date,
                                status__in=status,
                                membership__status__in=status,
                                membership__membership_users__user_id=OuterRef("id"),
                            )
                            .order_by("-membership__date_to")
                            .values_list("membership_id", flat=True)[:1]
                        ),
                    ),
                    default=Value(None),
                    output_field=UUIDField(),
                ),
            }
        else:
            annotate_dict = {
                "membership_id": Subquery(
                    MembershipModule.objects.filter(
                        module_filter,
                        Q(membership__date_end__isnull=True)
                        | Q(membership__date_end__gte=date),
                        status__in=status,
                        membership__status__in=status,
                        membership__date_from__lte=date,
                        membership__date_to__gte=date,
                        membership__membership_users__user_id=OuterRef("id"),
                    )
                    .order_by("-membership__date_to")
                    .values_list("membership_id", flat=True)[:1]
                ),
            }

        return self.annotate(
            **annotate_dict,
            membership_status=Subquery(
                Membership.objects.filter(
                    id=OuterRef("membership_id"),
                ).values_list(
                    "status", flat=True
                )[:1]
            ),
            membership_date_to=Subquery(
                Membership.objects.filter(
                    id=OuterRef("membership_id"),
                ).values_list(
                    "date_to", flat=True
                )[:1]
            ),
            has_active_membership=ExpressionWrapper(
                Q(membership_id__isnull=False), output_field=BooleanField()
            ),
            **{
                f"membership_{module}": Exists(
                    MembershipModule.objects.filter(
                        Q(membership__date_end__isnull=True)
                        | Q(membership__date_end__gte=date),
                        module=module,
                        status__in=status,
                        membership__status__in=status,
                        membership__date_from__lte=date,
                        membership__date_to__gte=date,
                        membership__membership_users__user_id=OuterRef("id"),
                    )
                    .order_by("-membership__date_to")
                    .values_list("membership_id", flat=True)[:1]
                )
                for module in Module
            },
        )

    def with_has_active_role(
        self,
        date: datetime.date | None = None,
        team_types: list[TeamType] = settings.MODULE_ALL_ADMIN_TEAM_TYPES,
        modules: list[Module] | None = None,
    ):
        Member = apps.get_model("legal", "Member")

        date = date or timezone.localdate()

        member_filter = (
            Q(team__date_from__lte=date)
            & (Q(team__date_to__isnull=True) | Q(team__date_to__gte=date))
            & Q(team__type__in=team_types)
        )

        if modules is not None:
            member_filter &= Q(team__module__in=modules)

        return self.annotate(
            has_active_role=Exists(
                Member.objects.filter(
                    member_filter,
                    user_id=OuterRef("id"),
                )
            ),
        )

    def with_has_active_team(
        self,
        date: datetime.date | None = None,
        team_ids: list[UUID] | None = None,
        modules: list[Module] | None = None,
    ):
        Member = apps.get_model("legal", "Member")

        date = date or timezone.localdate()

        member_filter = (
            Q(team__date_from__lte=date)
            & (Q(team__date_to__isnull=True) | Q(team__date_to__gte=date))
            & Q(team_id__in=team_ids)
        )

        if modules is not None:
            member_filter &= Q(team__module__in=modules)

        return self.annotate(
            has_active_team=Exists(
                Member.objects.filter(
                    member_filter,
                    user_id=OuterRef("id"),
                )
            ),
        )

    def with_permission_level(
        self,
        date: datetime.date | None = None,
        team_types: list[TeamType] = settings.MODULE_ALL_ADMIN_TEAM_TYPES,
        modules: list[Module] | None = None,
    ):
        return (
            self.with_has_active_membership(modules=modules)
            .with_has_active_role(date=date, team_types=team_types, modules=modules)
            .annotate(
                permission_level=Case(
                    When(
                        Q(is_superuser=True),
                        then=Value(PermissionLevel.SUPERADMIN),
                    ),
                    When(
                        Q(has_active_role=True),
                        then=Value(PermissionLevel.ADMIN),
                    ),
                    default=Value(PermissionLevel.USER),
                    output_field=IntegerField(),
                ),
            )
        )

    def with_is_adult(self):
        date_today = timezone.localdate()
        return self.annotate(
            is_adult=Case(
                When(birthday__isnull=True, then=Value(True)),
                When(
                    birthday__lte=datetime.date(
                        date_today.year - settings.MODULE_ALL_USER_MINIMUM_AGE,
                        date_today.month,
                        date_today.day,
                    ),
                    then=Value(True),
                ),
                default=Value(False),
                output_field=BooleanField(),
            ),
        )

    def filter_by_email(self, email: str):
        UserEmail = apps.get_model("user", "UserEmail")

        return self.annotate(
            secondary_email_matches=Exists(
                UserEmail.objects.filter(
                    user_id=OuterRef("id"),
                    email__iexact=email,
                    email_verified=True,
                )
            ),
        ).filter(Q(email__iexact=email) | Q(secondary_email_matches=True))


class UserManager(BaseUserManager):
    def get_queryset(self):
        return UserQuerySet(model=self.model, using=self._db, hints=self._hints)

    def with_family_name(self):
        return self.get_queryset().with_family_name()

    def with_has_active_membership(
        self,
        with_pending: bool = False,
        with_expired: bool = False,
        date: datetime.date | None = None,
        modules: list[Module] | None = None,
    ):
        return self.get_queryset().with_has_active_membership(
            with_pending=with_pending,
            with_expired=with_expired,
            date=date,
            modules=modules,
        )

    def with_has_active_role(
        self,
        date: datetime.date | None = None,
        team_types: list[TeamType] = settings.MODULE_ALL_ADMIN_TEAM_TYPES,
        modules: list[Module] | None = None,
    ):
        return self.get_queryset().with_has_active_role(
            date=date, team_types=team_types, modules=modules
        )

    def with_has_active_team(
        self,
        date: datetime.date | None = None,
        team_ids: list[UUID] | None = None,
        modules: list[Module] | None = None,
    ):
        return self.get_queryset().with_has_active_team(
            date=date, team_ids=team_ids, modules=modules
        )

    def with_permission_level(
        self,
        date: datetime.date | None = None,
        team_types: list[TeamType] = settings.MODULE_ALL_ADMIN_TEAM_TYPES,
        modules: list[Module] | None = None,
    ):
        return self.get_queryset().with_permission_level(
            date=date, team_types=team_types, modules=modules
        )

    def with_is_adult(self):
        return self.get_queryset().with_is_adult()

    def filter_by_email(self, email: str):
        return self.get_queryset().filter_by_email(email=email)

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


class FamilyQuerySet(QuerySet):
    def with_name(self):
        return self.annotate(
            name=StringAgg(
                "members__user__lastname",
                delimiter="-",
                filter=Q(
                    members__status=FamilyMemberStatus.ACTIVE,
                    members__role=FamilyMemberRole.MANAGER,
                ),
                order_by="members__user__lastname",
            )
        )


class FamilyMemberQuerySet(QuerySet):
    def with_family_name(self):
        Family = apps.get_model("user", "Family")

        return self.annotate(
            family_name=Subquery(
                Family.objects.filter(id=OuterRef("family_id"))
                .annotate(
                    family_name=StringAgg(
                        "members__user__lastname",
                        filter=Q(
                            members__status=FamilyMemberStatus.ACTIVE,
                            members__role=FamilyMemberRole.MANAGER,
                        ),
                        delimiter="-",
                        order_by="members__user__lastname",
                    )
                )
                .values("family_name")[:1]
            ),
        )
