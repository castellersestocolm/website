import pytest
from django.test import TestCase
from django.utils import timezone
from djmoney.money import Money

from comunicat.enums import Module
from conftest import NumOperationsMixin
from membership.api.renew import get_options
from membership.enums import MembershipStatus
from membership.tests.factories import (
    MembershipFactory,
    MembershipModuleFactory,
    MembershipUserFactory,
)
from user.enums import FamilyMemberRole, FamilyMemberStatus
from user.tests.factories import FamilyFactory, FamilyMemberFactory, UserFactory


@pytest.mark.django_db
class TestGetOptions(NumOperationsMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.user_member_1_obj = UserFactory(email="user-member-1@domain-test.org")
        cls.user_member_2_obj = UserFactory(email="user-member-2@domain-test.org")
        cls.user_member_3_obj = UserFactory(email="user-member-3@domain-test.org")
        cls.user_member_4_obj = UserFactory(email="user-member-4@domain-test.org")

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

        cls.membership_module_1_user_1_obj = MembershipModuleFactory(
            membership=cls.membership_1_user_1_obj,
            status=MembershipStatus.ACTIVE,
            amount=Money(150, "SEK"),
            module=Module.ORG,
        )
        cls.membership_module_2_user_2_obj = MembershipModuleFactory(
            membership=cls.membership_2_user_1_obj,
            status=MembershipStatus.PROCESSING,
            amount=Money(150, "SEK"),
            module=Module.ORG,
        )
        cls.membership_module_3_user_3_obj = MembershipModuleFactory(
            membership=cls.membership_3_user_2_obj,
            status=MembershipStatus.ACTIVE,
            amount=Money(250, "SEK"),
            module=Module.ORG,
        )
        cls.membership_module_4_user_3_obj = MembershipModuleFactory(
            membership=cls.membership_3_user_2_obj,
            status=MembershipStatus.ACTIVE,
            amount=Money(450, "SEK"),
            module=Module.TOWERS,
        )

        cls.family_1_obj = FamilyFactory()

        cls.family_1_user_2_obj = FamilyMemberFactory(
            user=cls.user_member_2_obj,
            family=cls.family_1_obj,
            role=FamilyMemberRole.MANAGER,
            status=FamilyMemberStatus.ACTIVE,
        )
        cls.family_1_user_3_obj = FamilyMemberFactory(
            user=cls.user_member_3_obj,
            family=cls.family_1_obj,
            role=FamilyMemberRole.MANAGER,
            status=FamilyMemberStatus.ACTIVE,
        )
        cls.family_1_user_4_obj = FamilyMemberFactory(
            user=cls.user_member_4_obj,
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
            family=cls.family_1_obj,
        )
        cls.membership_user_4_user_3_obj = MembershipUserFactory(
            user=cls.user_member_3_obj,
            membership=cls.membership_3_user_2_obj,
            family=cls.family_1_obj,
        )
        cls.membership_user_5_user_4_obj = MembershipUserFactory(
            user=cls.user_member_4_obj,
            membership=cls.membership_3_user_2_obj,
            family=cls.family_1_obj,
        )

    def test_get_options__active_and_processing(self, *args, **kwargs):
        with self.assertNumOperations(num=0, num_selects=1):
            membership_renew_options = get_options(
                user_id=self.user_member_1_obj.id,
            )

        self.assertIsNotNone(membership_renew_options)
        self.assertEqual(len(membership_renew_options), 2)

        membership_renew_option_org = [
            membership_renew_option
            for membership_renew_option in membership_renew_options
            if Module.TOWERS
            not in [
                membership_renew_module["module"]
                for membership_renew_module in membership_renew_option["modules"]
            ]
        ][0]
        membership_renew_option_towers = [
            membership_renew_option
            for membership_renew_option in membership_renew_options
            if Module.TOWERS
            in [
                membership_renew_module["module"]
                for membership_renew_module in membership_renew_option["modules"]
            ]
        ][0]

        membership_renew_option_org_modules = sorted(
            membership_renew_option_org["modules"], key=lambda mroo: mroo["module"]
        )
        membership_renew_option_towers_modules = sorted(
            membership_renew_option_towers["modules"], key=lambda mrot: mrot["module"]
        )

        self.assertEqual(len(membership_renew_option_org_modules), 1)
        self.assertEqual(len(membership_renew_option_towers_modules), 2)

        self.assertEqual(membership_renew_option_org_modules[0]["module"], Module.ORG)
        self.assertEqual(
            membership_renew_option_org_modules[0]["amount"], Money(150, "SEK")
        )
        self.assertEqual(membership_renew_option_org["amount"], Money(150, "SEK"))
        self.assertGreaterEqual(
            membership_renew_option_org["date_to"], timezone.localdate()
        )

        self.assertEqual(
            membership_renew_option_towers_modules[0]["module"], Module.ORG
        )
        self.assertEqual(
            membership_renew_option_towers_modules[0]["amount"], Money(150, "SEK")
        )
        self.assertEqual(
            membership_renew_option_towers_modules[1]["module"], Module.TOWERS
        )
        self.assertEqual(
            membership_renew_option_towers_modules[1]["amount"], Money(250, "SEK")
        )
        self.assertEqual(membership_renew_option_towers["amount"], Money(400, "SEK"))
        self.assertGreaterEqual(
            membership_renew_option_towers["date_to"], timezone.localdate()
        )

    def test_get_options__active_family(self, *args, **kwargs):
        with self.assertNumOperations(num=0, num_selects=2):
            membership_renew_options = get_options(
                user_id=self.user_member_3_obj.id,
            )

        self.assertIsNotNone(membership_renew_options)
        self.assertEqual(len(membership_renew_options), 2)

        membership_renew_option_org = [
            membership_renew_option
            for membership_renew_option in membership_renew_options
            if Module.TOWERS
            not in [
                membership_renew_module["module"]
                for membership_renew_module in membership_renew_option["modules"]
            ]
        ][0]
        membership_renew_option_towers = [
            membership_renew_option
            for membership_renew_option in membership_renew_options
            if Module.TOWERS
            in [
                membership_renew_module["module"]
                for membership_renew_module in membership_renew_option["modules"]
            ]
        ][0]

        membership_renew_option_org_modules = sorted(
            membership_renew_option_org["modules"], key=lambda mroo: mroo["module"]
        )
        membership_renew_option_towers_modules = sorted(
            membership_renew_option_towers["modules"], key=lambda mrot: mrot["module"]
        )

        self.assertEqual(len(membership_renew_option_org_modules), 1)
        self.assertEqual(len(membership_renew_option_towers_modules), 2)

        self.assertEqual(membership_renew_option_org_modules[0]["module"], Module.ORG)
        self.assertEqual(
            membership_renew_option_org_modules[0]["amount"], Money(250, "SEK")
        )
        self.assertEqual(membership_renew_option_org["amount"], Money(250, "SEK"))
        self.assertGreaterEqual(
            membership_renew_option_org["date_to"], timezone.localdate()
        )

        self.assertEqual(
            membership_renew_option_towers_modules[0]["module"], Module.ORG
        )
        self.assertEqual(
            membership_renew_option_towers_modules[0]["amount"], Money(250, "SEK")
        )
        self.assertEqual(
            membership_renew_option_towers_modules[1]["module"], Module.TOWERS
        )
        self.assertEqual(
            membership_renew_option_towers_modules[1]["amount"], Money(450, "SEK")
        )
        self.assertEqual(membership_renew_option_towers["amount"], Money(700, "SEK"))
        self.assertGreaterEqual(
            membership_renew_option_towers["date_to"], timezone.localdate()
        )
