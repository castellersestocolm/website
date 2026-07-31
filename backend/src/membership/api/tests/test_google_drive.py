from unittest import mock

import pytest
from django.test import TestCase
from django.utils import timezone
from djmoney.money import Money

from comunicat.enums import Module
from comunicat.utils.test.mocks import MockGoogleApiClientExecute
from conftest import NumOperationsMixin
from integration.tests.factories import GoogleIntegrationFactory
from membership.api.google_drive import sync_memberships
from membership.enums import MembershipStatus
from membership.tests.factories import (
    MembershipFactory,
    MembershipModuleFactory,
    MembershipUserFactory,
)
from user.enums import FamilyMemberRole, FamilyMemberStatus
from user.tests.factories import FamilyFactory, FamilyMemberFactory, UserFactory


@pytest.mark.django_db
class TestSyncMemberships(NumOperationsMixin, TestCase):
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

        cls.google_integration_obj = GoogleIntegrationFactory(module=Module.ORG)

    def test_sync_memberships__no_integration(self, *args, **kwargs):
        with self.assertNumOperations(num=0, num_selects=1):
            synced_memberships = sync_memberships(module=Module.TOWERS)

        self.assertFalse(synced_memberships)

    @mock.patch("user.api.google_group.Credentials.before_request", return_value=None)
    @mock.patch("user.api.google_group.Credentials.refresh", return_value=None)
    def test_sync_memberships__succeeded(self, *args, **kwargs):
        with mock.patch(
            "googleapiclient.http.HttpRequest.execute",
            side_effect=MockGoogleApiClientExecute(
                {"files": []},
                {
                    "name": "Members.xlsx",
                    "id": "members-1",
                },
            ),
        ):
            with self.assertNumOperations(num=0, num_selects=1):
                synced_memberships = sync_memberships(module=Module.ORG)

        self.assertTrue(synced_memberships)

        with mock.patch(
            "googleapiclient.http.HttpRequest.execute",
            side_effect=MockGoogleApiClientExecute(
                {
                    "files": [
                        {
                            "name": "Members.xlsx",
                            "id": "members-1",
                        },
                    ]
                },
                {
                    "name": "Members.xlsx",
                    "id": "members-1",
                },
            ),
        ):
            with self.assertNumOperations(num=0, num_selects=1):
                synced_memberships = sync_memberships(module=Module.ORG)

        self.assertTrue(synced_memberships)
