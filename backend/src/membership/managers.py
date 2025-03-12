from django.apps import apps
from django.db.models import (
    QuerySet,
    Sum,
    IntegerField,
    Value,
    Subquery,
    OuterRef,
)
from django.db.models.functions import Coalesce

from user.enums import FamilyMemberRole


class MembershipQuerySet(QuerySet):
    def with_amount(self):
        return self.annotate(
            amount=Coalesce(
                Sum("modules__amount"), Value(0), output_field=IntegerField()
            )
        )


class MembershipUserQuerySet(QuerySet):
    def with_family_role(self):
        FamilyMember = apps.get_model("user", "FamilyMember")

        return self.annotate(
            family_role=Coalesce(
                Subquery(
                    FamilyMember.objects.filter(
                        user_id=OuterRef("user_id"),
                        family_id=OuterRef("family_id"),
                    ).values("role")[:1]
                ),
                Value(FamilyMemberRole.MEMBER),
                output_field=IntegerField(),
            )
        )
