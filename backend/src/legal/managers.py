from uuid import UUID

from django.apps import apps
from django.db.models import (
    QuerySet,
    IntegerField,
    Value,
    Subquery,
    OuterRef,
    Count,
)
from django.db.models.functions import Coalesce


class RoleQuerySet(QuerySet):
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
