from django.apps import apps
from django.contrib.postgres.aggregates import StringAgg
from django.db.models import (
    Case,
    CharField,
    F,
    IntegerField,
    OuterRef,
    Q,
    QuerySet,
    Subquery,
    Sum,
    Value,
    When,
)
from django.db.models.functions import Cast, Coalesce

from comunicat.utils.managers import MoneyOutput
from order.enums import OrderStatus
from user.enums import FamilyMemberRole, FamilyMemberStatus


class MembershipQuerySet(QuerySet):
    def with_amount(self):
        MembershipModule = apps.get_model("membership", "MembershipModule")

        return self.annotate(
            amount=Coalesce(
                Subquery(
                    MembershipModule.objects.filter(membership_id=OuterRef("id"))
                    .values("membership_id")
                    .annotate(amount=Sum("amount"))
                    .values("amount")[:1]
                ),
                Value(0),
                output_field=MoneyOutput(),
            )
        )


class MembershipModuleQuerySet(QuerySet):
    def with_amount_pending(self):
        OrderMembership = apps.get_model("order", "OrderMembership")

        return self.annotate(
            amount_paid=Coalesce(
                Subquery(
                    OrderMembership.objects.filter(
                        module_id=OuterRef("id"),
                        order__status__gte=OrderStatus.REQUESTED,
                        order__status__lte=OrderStatus.COMPLETED,
                    )
                    .values("order_id")
                    .annotate(amount=Sum("amount"))
                    .values("amount")[:1]
                ),
                Value(0),
                output_field=MoneyOutput(),
            ),
            amount_pending=Cast(
                F("amount") - F("amount_paid"), output_field=MoneyOutput()
            ),
        )


class MembershipUserQuerySet(QuerySet):
    def with_membership_amount(self):
        MembershipModule = apps.get_model("membership", "MembershipModule")

        return self.annotate(
            membership_amount=Coalesce(
                Subquery(
                    MembershipModule.objects.filter(
                        membership_id=OuterRef("membership_id")
                    )
                    .values("membership_id")
                    .annotate(amount=Sum("amount"))
                    .values("amount")[:1]
                ),
                Value(0),
                output_field=MoneyOutput(),
            )
        )

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

    def with_family_name(self):
        Family = apps.get_model("user", "Family")

        return self.annotate(
            family_name=Case(
                When(
                    family__isnull=False,
                    family__members__isnull=False,
                    then=Subquery(
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
                ),
                default=F("user__lastname"),
                output_field=CharField(),
            )
        )
