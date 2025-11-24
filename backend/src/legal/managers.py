from uuid import UUID

from django.apps import apps
from django.db.models import (
    QuerySet,
    IntegerField,
    Value,
    Subquery,
    OuterRef,
    Count,
    F,
)
from django.db.models.functions import Coalesce
from django.utils import translation


class TeamQuerySet(QuerySet):
    def with_name(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            name_locale=F(f"name__{locale}"),
        )


class RoleQuerySet(QuerySet):
    def with_name(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            name_locale=F(f"name__{locale}"),
        )

    def with_member_amount(self, team_id: UUID):
        Member = apps.get_model("legal", "Member")

        return self.annotate(
            member_amount=Coalesce(
                Subquery(
                    Member.objects.filter(
                        role_id=OuterRef("id"),
                        team_id=team_id,
                    )
                    .values("role_id")
                    .annotate(count=Count("id"))
                    .values("count")[:1]
                ),
                Value(0),
                output_field=IntegerField(),
            ),
        )


class MemberQuerySet(QuerySet):
    def with_amount(self):
        Member = apps.get_model("legal", "Member")

        return self.annotate(
            amount=Coalesce(
                Subquery(
                    Member.objects.filter(
                        role_id=OuterRef("role_id"),
                        team_id=OuterRef("team_id"),
                    )
                    .values("role_id")
                    .annotate(count=Count("id"))
                    .values("count")[:1]
                ),
                Value(0),
                output_field=IntegerField(),
            ),
        )
