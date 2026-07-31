import pytest
from django.test import TestCase
from django.utils import timezone
from djmoney.money import Money

from comunicat.enums import Module
from conftest import NumOperationsMixin
from membership.api import create_or_update
from membership.enums import MembershipStatus
from membership.models import MembershipModule, MembershipUser
from membership.tests.factories import (
    MembershipFactory,
    MembershipModuleFactory,
    MembershipUserFactory,
)
from user.enums import FamilyMemberRole, FamilyMemberStatus
from user.tests.factories import FamilyFactory, FamilyMemberFactory, UserFactory


@pytest.mark.django_db
class TestCreateOrUpdate(NumOperationsMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.user_member_1_obj = UserFactory(email="user-member-1@domain-test.org")
        cls.user_member_2_obj = UserFactory(email="user-member-2@domain-test.org")
        cls.user_member_3_obj = UserFactory(email="user-member-3@domain-test.org")
        cls.user_member_4_obj = UserFactory(email="user-member-4@domain-test.org")
        cls.user_member_5_obj = UserFactory(email="user-member-5@domain-test.org")
        cls.user_member_6_obj = UserFactory(email="user-member-6@domain-test.org")
        cls.user_member_7_obj = UserFactory(email="user-member-7@domain-test.org")

        cls.membership_1_user_1_obj = MembershipFactory(
            status=MembershipStatus.ACTIVE,
            date_from=timezone.localdate() - timezone.timedelta(days=365),
            date_to=timezone.localdate() - timezone.timedelta(days=1),
        )
        cls.membership_2_user_1_obj = MembershipFactory(
            status=MembershipStatus.PROCESSING,
            date_from=timezone.localdate(),
            date_to=timezone.localdate() + timezone.timedelta(days=365 - 1),
        )
        cls.membership_3_user_2_obj = MembershipFactory(
            status=MembershipStatus.ACTIVE,
            date_from=timezone.localdate(),
            date_to=timezone.localdate() + timezone.timedelta(days=365 - 1),
        )
        cls.membership_4_user_3_obj = MembershipFactory(
            status=MembershipStatus.ACTIVE,
            date_from=timezone.localdate(),
            date_to=timezone.localdate() + timezone.timedelta(days=365 - 1),
        )
        cls.membership_5_user_6_obj = MembershipFactory(
            status=MembershipStatus.ACTIVE,
            date_from=timezone.localdate() - timezone.timedelta(days=100),
            date_to=timezone.localdate() + timezone.timedelta(days=265 - 1),
            date_end=timezone.localdate() - timezone.timedelta(days=1),
        )

        cls.membership_module_1_user_1_obj = MembershipModuleFactory(
            membership=cls.membership_1_user_1_obj,
            status=MembershipStatus.ACTIVE,
            amount=Money(150, "SEK"),
            module=Module.ORG,
        )
        cls.membership_module_2_user_1_obj = MembershipModuleFactory(
            membership=cls.membership_2_user_1_obj,
            status=MembershipStatus.PROCESSING,
            amount=Money(150, "SEK"),
            module=Module.ORG,
        )
        cls.membership_module_3_user_2_obj = MembershipModuleFactory(
            membership=cls.membership_3_user_2_obj,
            status=MembershipStatus.ACTIVE,
            amount=Money(150, "SEK"),
            module=Module.ORG,
        )
        cls.membership_module_4_user_3_obj = MembershipModuleFactory(
            membership=cls.membership_4_user_3_obj,
            status=MembershipStatus.ACTIVE,
            amount=Money(150, "SEK"),
            module=Module.ORG,
        )
        cls.membership_module_5_user_6_obj = MembershipModuleFactory(
            membership=cls.membership_5_user_6_obj,
            status=MembershipStatus.ACTIVE,
            amount=Money(150, "SEK"),
            module=Module.ORG,
        )

        cls.family_1_obj = FamilyFactory()

        cls.family_1_user_3_obj = FamilyMemberFactory(
            user=cls.user_member_3_obj,
            family=cls.family_1_obj,
            role=FamilyMemberRole.MANAGER,
            status=FamilyMemberStatus.ACTIVE,
        )
        cls.family_1_user_4_obj = FamilyMemberFactory(
            user=cls.user_member_4_obj,
            family=cls.family_1_obj,
            role=FamilyMemberRole.MANAGER,
            status=FamilyMemberStatus.ACTIVE,
        )
        cls.family_1_user_5_obj = FamilyMemberFactory(
            user=cls.user_member_5_obj,
            family=cls.family_1_obj,
            role=FamilyMemberRole.MEMBER,
            status=FamilyMemberStatus.ACTIVE,
        )

        cls.membership_user_1_user_1_obj = MembershipUserFactory(
            user=cls.user_member_1_obj,
            membership=cls.membership_1_user_1_obj,
            family=None,
        )
        cls.membership_user_2_user_1_obj = MembershipUserFactory(
            user=cls.user_member_1_obj,
            membership=cls.membership_2_user_1_obj,
            family=None,
        )
        cls.membership_user_3_user_2_obj = MembershipUserFactory(
            user=cls.user_member_2_obj,
            membership=cls.membership_3_user_2_obj,
            family=None,
        )
        cls.membership_user_4_user_3_obj = MembershipUserFactory(
            user=cls.user_member_3_obj,
            membership=cls.membership_4_user_3_obj,
            family=cls.family_1_obj,
        )
        cls.membership_user_5_user_6_obj = MembershipUserFactory(
            user=cls.user_member_6_obj,
            membership=cls.membership_5_user_6_obj,
            family=None,
        )

    def test_create_or_update__status_processing(self, *args, **kwargs):
        with self.assertNumOperations(num=0, num_selects=7):
            membership_obj = create_or_update(
                user_id=self.user_member_1_obj.id,
                modules=[Module.ORG],
            )

        self.assertIsNotNone(membership_obj)
        self.assertEqual(membership_obj, self.membership_2_user_1_obj)
        self.assertEqual(membership_obj.status, MembershipStatus.PROCESSING)

        with self.assertNumOperations(num=0, num_selects=8, num_inserts=1):
            membership_obj = create_or_update(
                user_id=self.user_member_1_obj.id,
                modules=[Module.TOWERS],
            )

        self.assertIsNotNone(membership_obj)
        self.assertEqual(membership_obj, self.membership_2_user_1_obj)
        self.assertEqual(membership_obj.status, MembershipStatus.PROCESSING)

        membership_module_objs = list(
            MembershipModule.objects.filter(membership=membership_obj)
        )

        self.assertEqual(len(membership_module_objs), 2)

        membership_module_org_obj = [
            membership_module_obj
            for membership_module_obj in membership_module_objs
            if membership_module_obj.module == Module.ORG
        ][0]
        membership_module_towers_obj = [
            membership_module_obj
            for membership_module_obj in membership_module_objs
            if membership_module_obj.module == Module.TOWERS
        ][0]

        self.assertEqual(membership_module_org_obj.status, MembershipStatus.PROCESSING)
        self.assertEqual(membership_module_org_obj.amount, Money(150, "SEK"))

        self.assertEqual(
            membership_module_towers_obj.status, MembershipStatus.REQUESTED
        )
        self.assertEqual(membership_module_towers_obj.amount, Money(250, "SEK"))

    def test_create_or_update__status_active(self, *args, **kwargs):
        with self.assertNumOperations(num=0, num_selects=7):
            membership_obj = create_or_update(
                user_id=self.user_member_2_obj.id,
                modules=[Module.ORG],
            )

        self.assertIsNotNone(membership_obj)
        self.assertEqual(membership_obj, self.membership_3_user_2_obj)
        self.assertEqual(membership_obj.status, MembershipStatus.ACTIVE)

        with self.assertNumOperations(num=0, num_selects=8, num_inserts=1):
            membership_obj = create_or_update(
                user_id=self.user_member_2_obj.id,
                modules=[Module.TOWERS],
            )

        self.assertIsNotNone(membership_obj)
        self.assertEqual(membership_obj, self.membership_3_user_2_obj)
        self.assertEqual(membership_obj.status, MembershipStatus.ACTIVE)

        membership_module_objs = list(
            MembershipModule.objects.filter(membership=membership_obj)
        )

        self.assertEqual(len(membership_module_objs), 2)

        membership_module_org_obj = [
            membership_module_obj
            for membership_module_obj in membership_module_objs
            if membership_module_obj.module == Module.ORG
        ][0]
        membership_module_towers_obj = [
            membership_module_obj
            for membership_module_obj in membership_module_objs
            if membership_module_obj.module == Module.TOWERS
        ][0]

        self.assertEqual(membership_module_org_obj.status, MembershipStatus.ACTIVE)
        self.assertEqual(membership_module_org_obj.amount, Money(150, "SEK"))

        self.assertEqual(
            membership_module_towers_obj.status, MembershipStatus.REQUESTED
        )
        self.assertEqual(membership_module_towers_obj.amount, Money(250, "SEK"))

    def test_create_or_update__status_active_family(self, *args, **kwargs):
        with self.assertNumOperations(
            num=0, num_selects=11, num_inserts=2, num_updates=3
        ):
            membership_obj = create_or_update(
                user_id=self.user_member_3_obj.id,
                modules=[Module.ORG],
            )

        self.assertIsNotNone(membership_obj)
        self.assertEqual(membership_obj, self.membership_4_user_3_obj)

        membership_user_objs = list(
            MembershipUser.objects.filter(membership=membership_obj)
        )

        self.assertEqual(len(membership_user_objs), 3)

        user_have_membership_objs = {
            membership_user_obj.user for membership_user_obj in membership_user_objs
        }
        user_should_have_membership_objs = {
            self.user_member_3_obj,
            self.user_member_4_obj,
            self.user_member_5_obj,
        }

        self.assertEqual(user_have_membership_objs, user_should_have_membership_objs)

        with self.assertNumOperations(num=0, num_selects=11, num_inserts=1):
            membership_obj = create_or_update(
                user_id=self.user_member_4_obj.id,
                modules=[Module.TOWERS],
            )

        self.assertIsNotNone(membership_obj)
        self.assertEqual(membership_obj, self.membership_4_user_3_obj)

        membership_module_objs = list(
            MembershipModule.objects.filter(membership=membership_obj)
        )

        self.assertEqual(len(membership_module_objs), 2)

        membership_module_org_obj = [
            membership_module_obj
            for membership_module_obj in membership_module_objs
            if membership_module_obj.module == Module.ORG
        ][0]
        membership_module_towers_obj = [
            membership_module_obj
            for membership_module_obj in membership_module_objs
            if membership_module_obj.module == Module.TOWERS
        ][0]

        self.assertEqual(membership_module_org_obj.status, MembershipStatus.REQUESTED)
        self.assertEqual(membership_module_org_obj.amount, Money(250, "SEK"))

        self.assertEqual(
            membership_module_towers_obj.status, MembershipStatus.REQUESTED
        )
        self.assertEqual(membership_module_towers_obj.amount, Money(450, "SEK"))

    def test_create_or_update__status_active_but_ended(self, *args, **kwargs):
        with self.assertNumOperations(num=0, num_selects=7, num_inserts=3):
            membership_obj = create_or_update(
                user_id=self.user_member_6_obj.id,
                modules=[Module.ORG],
            )

        self.assertIsNotNone(membership_obj)
        self.assertIsNot(membership_obj, self.membership_5_user_6_obj)
        self.assertEqual(membership_obj.status, MembershipStatus.REQUESTED)

        membership_module_objs = list(
            MembershipModule.objects.filter(membership=membership_obj)
        )

        self.assertEqual(len(membership_module_objs), 1)

        membership_module_org_obj = [
            membership_module_obj
            for membership_module_obj in membership_module_objs
            if membership_module_obj.module == Module.ORG
        ][0]

        self.assertEqual(membership_module_org_obj.status, MembershipStatus.REQUESTED)
        self.assertEqual(membership_module_org_obj.amount, Money(150, "SEK"))

    def test_create_or_update__no_active(self, *args, **kwargs):
        with self.assertNumOperations(num=0, num_selects=7, num_inserts=3):
            membership_obj = create_or_update(
                user_id=self.user_member_7_obj.id,
                modules=[Module.ORG],
            )

        self.assertIsNotNone(membership_obj)
        self.assertEqual(membership_obj.status, MembershipStatus.REQUESTED)

        with self.assertNumOperations(num=0, num_selects=8, num_inserts=1):
            membership_obj = create_or_update(
                user_id=self.user_member_7_obj.id,
                modules=[Module.ORG, Module.TOWERS],
            )

        self.assertIsNotNone(membership_obj)
        self.assertEqual(membership_obj.status, MembershipStatus.REQUESTED)

        membership_module_objs = list(
            MembershipModule.objects.filter(membership=membership_obj)
        )

        self.assertEqual(len(membership_module_objs), 2)

        membership_module_org_obj = [
            membership_module_obj
            for membership_module_obj in membership_module_objs
            if membership_module_obj.module == Module.ORG
        ][0]
        membership_module_towers_obj = [
            membership_module_obj
            for membership_module_obj in membership_module_objs
            if membership_module_obj.module == Module.TOWERS
        ][0]

        self.assertEqual(membership_module_org_obj.status, MembershipStatus.REQUESTED)
        self.assertEqual(membership_module_org_obj.amount, Money(150, "SEK"))

        self.assertEqual(
            membership_module_towers_obj.status, MembershipStatus.REQUESTED
        )
        self.assertEqual(membership_module_towers_obj.amount, Money(250, "SEK"))
