import datetime
from functools import cached_property

from django.contrib.contenttypes.fields import GenericRelation
from django.utils import timezone
from djmoney.models.fields import MoneyField

from comunicat.db.mixins import StandardModel, Timestamps
from django.db import models, transaction

from comunicat.enums import Module
from membership.enums import MembershipStatus
from membership.managers import MembershipQuerySet, MembershipUserQuerySet


class Membership(StandardModel, Timestamps):
    users = models.ManyToManyField(
        "user.User", through="MembershipUser", related_name="memberships"
    )
    status = models.PositiveSmallIntegerField(
        choices=((ms.value, ms.name) for ms in MembershipStatus),
        default=MembershipStatus.REQUESTED,
    )
    date_from = models.DateField()
    date_to = models.DateField()

    objects = MembershipQuerySet.as_manager()

    @cached_property
    def is_active(self) -> bool:
        return self.date_from <= timezone.localdate() <= self.date_to

    @cached_property
    def date_renewal(self) -> datetime.date:
        return self.date_to.replace(day=1)

    @cached_property
    def can_renew(self) -> bool:
        return self.date_renewal <= timezone.localdate()

    __status = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__status = self.status

    def save(self, *args, **kwargs):
        # TODO: Update Google event calendar invitations for membership and membership module
        if self.pk and self.status != self.__status:
            self.modules.update(status=self.status)

        import pinyator.tasks

        for membership_user_obj in self.membership_users.all():
            transaction.on_commit(
                lambda: pinyator.tasks.update_or_create_user.delay(
                    user_id=membership_user_obj.user_id
                )
            )

        super().save(*args, **kwargs)


class MembershipModule(StandardModel, Timestamps):
    membership = models.ForeignKey(
        Membership, related_name="modules", on_delete=models.CASCADE
    )
    status = models.PositiveSmallIntegerField(
        choices=((ms.value, ms.name) for ms in MembershipStatus),
        default=MembershipStatus.REQUESTED,
    )
    amount = MoneyField(max_digits=7, decimal_places=2, default_currency="SEK")
    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )

    payment_lines = GenericRelation(
        "payment.PaymentLine",
        object_id_field="item_id",
        content_type_field="item_type",
        related_query_name="membership_module",
    )


class MembershipUser(StandardModel, Timestamps):
    user = models.ForeignKey(
        "user.User", related_name="membership_users", on_delete=models.CASCADE
    )
    family = models.ForeignKey(
        "user.Family",
        null=True,
        blank=True,
        related_name="membership_users",
        on_delete=models.CASCADE,
    )
    membership = models.ForeignKey(
        "Membership", related_name="membership_users", on_delete=models.CASCADE
    )

    objects = MembershipUserQuerySet.as_manager()
