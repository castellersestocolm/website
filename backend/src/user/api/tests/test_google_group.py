from unittest import mock

import pytest
from django.conf import settings
from django.test import TestCase
from django.utils import timezone

import user.api.google_group
from comunicat.enums import Module
from comunicat.utils.test.mocks import MockGoogleApiClientExecute
from conftest import NumOperationsMixin
from consent.enums import ConsentType
from consent.tests.factories import EntityConsentFactory
from integration.tests.factories import GoogleIntegrationFactory
from legal.enums import TeamType
from legal.tests.factories import GroupFactory, MemberFactory, RoleFactory, TeamFactory
from membership.enums import MembershipStatus
from membership.tests.factories import (
    MembershipFactory,
    MembershipModuleFactory,
    MembershipUserFactory,
)
from notify.enums import NewsletterType
from notify.tests.factories import NewsletterFactory
from payment.tests.factories import EntityFactory
from user.enums import GoogleGroupUserRole
from user.models import GoogleGroupUser
from user.tests.factories import (
    GoogleGroupFactory,
    GoogleGroupModuleFactory,
    GoogleGroupUserFactory,
    UserEmailFactory,
    UserFactory,
)


@pytest.mark.django_db
@mock.patch("user.api.google_group.Credentials.before_request", return_value=None)
@mock.patch("user.api.google_group.Credentials.refresh", return_value=None)
class TestGoogleGroupSyncUsers(NumOperationsMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.user_board_1_obj = UserFactory(email="user-board-1@domain-test.org")
        cls.user_board_2_obj = UserFactory(email="user-board-2@domain-test.org")
        cls.user_board_3_obj = UserFactory(email="user-board-3@domain-test.org")
        cls.user_board_4_obj = UserFactory(email="user-board-4@domain-test.org")
        cls.user_member_1_obj = UserFactory(email="user-member-1@domain-test.org")
        cls.user_member_2_obj = UserFactory(email="user-member-2@domain-test.org")

        cls.user_objs = (
            cls.user_board_1_obj,
            cls.user_board_2_obj,
            cls.user_board_3_obj,
            cls.user_board_4_obj,
            cls.user_member_1_obj,
            cls.user_member_2_obj,
        )

        cls.user_with_membership_obj = (
            cls.user_board_1_obj,
            cls.user_board_2_obj,
            cls.user_board_3_obj,
            cls.user_board_4_obj,
            cls.user_member_1_obj,
        )

        cls.entity_board_1_obj = EntityFactory(user=cls.user_board_1_obj)
        cls.entity_board_2_obj = EntityFactory(user=cls.user_board_2_obj)
        cls.entity_board_3_obj = EntityFactory(user=cls.user_board_3_obj)
        cls.entity_board_4_obj = EntityFactory(user=cls.user_board_4_obj)
        cls.entity_member_1_obj = EntityFactory(user=cls.user_member_1_obj)
        cls.entity_member_2_obj = EntityFactory(user=cls.user_member_2_obj)

        cls.user_email_board_1_obj = UserEmailFactory(
            user=cls.user_board_1_obj,
            email=f"user-board-1@{settings.MODULE_ORG_DOMAIN}",
        )
        cls.user_email_board_2_obj = UserEmailFactory(
            user=cls.user_board_2_obj,
            email=f"user-board-2@{settings.MODULE_TOWERS_DOMAIN}",
        )
        cls.user_email_board_3_obj = UserEmailFactory(
            user=cls.user_board_3_obj,
            email=f"user-board-3@{settings.MODULE_ORG_DOMAIN}",
        )
        cls.user_email_board_4_obj = UserEmailFactory(
            user=cls.user_board_4_obj,
            email=f"user-board-4@{settings.MODULE_ORG_DOMAIN}",
        )

        cls.user_email_objs = (
            cls.user_email_board_1_obj,
            cls.user_email_board_2_obj,
            cls.user_email_board_3_obj,
            cls.user_email_board_4_obj,
        )

        for user_obj in cls.user_objs:
            if user_obj in cls.user_with_membership_obj:
                membership_obj = MembershipFactory(status=MembershipStatus.ACTIVE)
            else:
                membership_obj = MembershipFactory(
                    status=MembershipStatus.ACTIVE,
                    date_from=timezone.localdate() - timezone.timedelta(days=366),
                    date_to=timezone.localdate() - timezone.timedelta(days=1),
                )
            for module in Module:
                MembershipModuleFactory(
                    membership=membership_obj,
                    module=module,
                    status=MembershipStatus.ACTIVE,
                )
            MembershipUserFactory(membership=membership_obj, user=user_obj)

        cls.entity_external_1_obj = EntityFactory()
        cls.entity_external_2_obj = EntityFactory()

        cls.google_integration_obj = GoogleIntegrationFactory(module=Module.ORG)

        cls.google_group_board_obj = GoogleGroupFactory(
            google_integration=cls.google_integration_obj
        )
        cls.google_group_board_team_obj = GoogleGroupFactory(
            google_integration=cls.google_integration_obj
        )
        cls.google_group_board_team_role_obj = GoogleGroupFactory(
            google_integration=cls.google_integration_obj
        )
        cls.google_group_members_obj = GoogleGroupFactory(
            google_integration=cls.google_integration_obj
        )
        cls.google_group_members_old_obj = GoogleGroupFactory(
            google_integration=cls.google_integration_obj
        )
        cls.google_group_newsletter_obj = GoogleGroupFactory(
            google_integration=cls.google_integration_obj
        )

        cls.group_1_obj = GroupFactory(module=Module.ORG)
        cls.team_1_obj = TeamFactory(group=cls.group_1_obj, type=TeamType.BOARD)
        cls.role_1_obj = RoleFactory()
        cls.role_2_obj = RoleFactory()
        cls.member_user_board_1_obj = MemberFactory(
            user=cls.user_board_1_obj, team=cls.team_1_obj, role=cls.role_1_obj
        )
        cls.member_user_board_4_obj = MemberFactory(
            user=cls.user_board_4_obj, team=cls.team_1_obj, role=cls.role_2_obj
        )

        GoogleGroupModuleFactory(
            group=cls.google_group_board_obj,
            module=Module.ORG,
            team=None,
            role=None,
            require_module_domain=True,
        )
        GoogleGroupModuleFactory(
            group=cls.google_group_board_team_obj,
            module=Module.ORG,
            team=cls.team_1_obj,
            role=None,
            require_module_domain=True,
        )
        GoogleGroupModuleFactory(
            group=cls.google_group_board_team_role_obj,
            module=Module.ORG,
            team=cls.team_1_obj,
            role=cls.role_1_obj,
            require_module_domain=True,
        )
        GoogleGroupModuleFactory(
            group=cls.google_group_members_obj,
            module=Module.ORG,
            team=None,
            role=None,
            require_membership=True,
        )
        GoogleGroupModuleFactory(
            group=cls.google_group_members_obj,
            module=Module.ORG,
            team=cls.team_1_obj,
            role=None,
            require_module_domain=True,
        )
        GoogleGroupModuleFactory(
            group=cls.google_group_members_old_obj,
            module=Module.ORG,
            team=None,
            role=None,
            require_membership=True,
            exclude_active=True,
        )

        cls.google_group_board_user_board_1_obj = GoogleGroupUserFactory(
            group=cls.google_group_board_obj, user=cls.user_board_3_obj
        )
        cls.google_group_board_user_member_1_obj = GoogleGroupUserFactory(
            group=cls.google_group_board_obj, user=cls.user_member_1_obj
        )

        cls.newsletter_obj = NewsletterFactory(
            module=Module.ORG,
            type=NewsletterType.GOOGLE,
            google_group=cls.google_group_newsletter_obj,
        )

        cls.entity_consent_member_2_obj = EntityConsentFactory(
            newsletter=cls.newsletter_obj,
            entity=cls.entity_member_2_obj,
            type=ConsentType.NEWSLETTER,
            google_group_user=None,
        )
        cls.entity_consent_entity_2_obj = EntityConsentFactory(
            newsletter=cls.newsletter_obj,
            entity=cls.entity_external_2_obj,
            type=ConsentType.NEWSLETTER,
            google_group_user=None,
        )

    def test_sync_users__board(self, *args, **kwargs):
        with mock.patch(
            "googleapiclient.http.HttpRequest.execute",
            side_effect=MockGoogleApiClientExecute(
                {
                    "members": [
                        {
                            "email": self.user_board_3_obj.email,
                            "role": GoogleGroupUserRole.MEMBER.name,
                        },
                        {
                            "email": self.user_email_board_3_obj.email,
                            "role": GoogleGroupUserRole.MEMBER.name,
                        },
                        {
                            "email": self.user_member_1_obj.email,
                            "role": GoogleGroupUserRole.MEMBER.name,
                        },
                    ]
                },
                {},
            ),
        ):
            with self.assertNumOperations(
                num=0,
                num_selects=12,
                num_inserts=3,
                num_deletes=4,
            ):
                user.api.google_group.sync_users(
                    group_id=self.google_group_board_obj.id
                )

        google_group_board_user_by_email = {
            google_group_user_obj.email: google_group_user_obj
            for google_group_user_obj in GoogleGroupUser.objects.filter(
                group=self.google_group_board_obj
            )
        }

        self.assertEqual(len(google_group_board_user_by_email), 3)

        for user_obj in self.user_objs:
            self.assertNotIn(user_obj.email, google_group_board_user_by_email)

        self.assertIn(
            self.user_email_board_1_obj.email, google_group_board_user_by_email
        )
        self.assertIn(
            self.user_email_board_3_obj.email, google_group_board_user_by_email
        )
        self.assertIn(
            self.user_email_board_4_obj.email, google_group_board_user_by_email
        )

        self.assertEqual(
            google_group_board_user_by_email[self.user_email_board_1_obj.email].role,
            GoogleGroupUserRole.MANAGER,
        )
        self.assertEqual(
            google_group_board_user_by_email[self.user_email_board_3_obj.email].role,
            GoogleGroupUserRole.MANAGER,
        )
        self.assertEqual(
            google_group_board_user_by_email[self.user_email_board_4_obj.email].role,
            GoogleGroupUserRole.MANAGER,
        )

    def test_sync_users__board_team(self, *args, **kwargs):
        with mock.patch(
            "googleapiclient.http.HttpRequest.execute",
            side_effect=MockGoogleApiClientExecute(
                {
                    "members": [
                        {
                            "email": self.user_board_3_obj.email,
                            "role": GoogleGroupUserRole.MEMBER.name,
                        },
                        {
                            "email": self.user_email_board_3_obj.email,
                            "role": GoogleGroupUserRole.MEMBER.name,
                        },
                    ]
                },
                {},
            ),
        ):
            with self.assertNumOperations(
                num=0,
                num_selects=12,
                num_inserts=2,
            ):
                user.api.google_group.sync_users(
                    group_id=self.google_group_board_team_obj.id
                )

        google_group_board_team_user_by_email = {
            google_group_user_obj.email: google_group_user_obj
            for google_group_user_obj in GoogleGroupUser.objects.filter(
                group=self.google_group_board_team_obj
            )
        }

        self.assertEqual(len(google_group_board_team_user_by_email), 2)

        for user_obj in self.user_objs:
            self.assertNotIn(user_obj.email, google_group_board_team_user_by_email)

        self.assertIn(
            self.user_email_board_1_obj.email, google_group_board_team_user_by_email
        )
        self.assertIn(
            self.user_email_board_4_obj.email, google_group_board_team_user_by_email
        )

        self.assertEqual(
            google_group_board_team_user_by_email[
                self.user_email_board_1_obj.email
            ].role,
            GoogleGroupUserRole.MANAGER,
        )
        self.assertEqual(
            google_group_board_team_user_by_email[
                self.user_email_board_4_obj.email
            ].role,
            GoogleGroupUserRole.MANAGER,
        )

    def test_sync_users__board_team_role(self, *args, **kwargs):
        with mock.patch(
            "googleapiclient.http.HttpRequest.execute",
            side_effect=MockGoogleApiClientExecute(
                {
                    "members": [
                        {
                            "email": self.user_board_1_obj.email,
                            "role": GoogleGroupUserRole.MEMBER.name,
                        }
                    ]
                },
                {},
            ),
        ):
            with self.assertNumOperations(
                num=0,
                num_selects=11,
                num_inserts=1,
            ):
                user.api.google_group.sync_users(
                    group_id=self.google_group_board_team_role_obj.id
                )

        google_group_board_team_role_user_by_email = {
            google_group_user_obj.email: google_group_user_obj
            for google_group_user_obj in GoogleGroupUser.objects.filter(
                group=self.google_group_board_team_role_obj
            )
        }

        self.assertEqual(len(google_group_board_team_role_user_by_email), 1)

        for user_obj in self.user_objs:
            self.assertNotIn(user_obj.email, google_group_board_team_role_user_by_email)

        self.assertIn(
            self.user_email_board_1_obj.email,
            google_group_board_team_role_user_by_email,
        )

        self.assertEqual(
            google_group_board_team_role_user_by_email[
                self.user_email_board_1_obj.email
            ].role,
            GoogleGroupUserRole.MANAGER,
        )

    def test_sync_users__members(self, *args, **kwargs):
        with mock.patch(
            "googleapiclient.http.HttpRequest.execute",
            side_effect=MockGoogleApiClientExecute({"members": []}, {}),
        ):
            with self.assertNumOperations(
                num=0,
                num_selects=19,
                num_inserts=9,
            ):
                user.api.google_group.sync_users(
                    group_id=self.google_group_members_obj.id
                )

        google_group_members_user_by_email = {
            google_group_user_obj.email: google_group_user_obj
            for google_group_user_obj in GoogleGroupUser.objects.filter(
                group=self.google_group_members_obj
            )
        }

        self.assertEqual(len(google_group_members_user_by_email), 9)

        for user_obj in self.user_objs:
            if user_obj in self.user_with_membership_obj:
                self.assertIn(user_obj.email, google_group_members_user_by_email)
                self.assertEqual(
                    google_group_members_user_by_email[user_obj.email].role,
                    GoogleGroupUserRole.MEMBER,
                )
            else:
                self.assertNotIn(user_obj.email, google_group_members_user_by_email)

        for user_email_obj in self.user_email_objs:
            self.assertIn(user_email_obj.email, google_group_members_user_by_email)

        self.assertEqual(
            google_group_members_user_by_email[self.user_email_board_1_obj.email].role,
            GoogleGroupUserRole.MANAGER,
        )
        self.assertEqual(
            google_group_members_user_by_email[self.user_email_board_2_obj.email].role,
            GoogleGroupUserRole.MEMBER,
        )
        self.assertEqual(
            google_group_members_user_by_email[self.user_email_board_3_obj.email].role,
            GoogleGroupUserRole.MEMBER,
        )

    def test_sync_users__members_old(self, *args, **kwargs):
        with mock.patch(
            "googleapiclient.http.HttpRequest.execute",
            side_effect=MockGoogleApiClientExecute({"members": []}, {}),
        ):
            with self.assertNumOperations(
                num=0,
                num_selects=8,
                num_inserts=1,
            ):
                user.api.google_group.sync_users(
                    group_id=self.google_group_members_old_obj.id
                )

        google_group_members_old_user_by_email = {
            google_group_user_obj.email: google_group_user_obj
            for google_group_user_obj in GoogleGroupUser.objects.filter(
                group=self.google_group_members_old_obj
            )
        }

        self.assertEqual(len(google_group_members_old_user_by_email), 1)

        for user_obj in self.user_objs:
            if user_obj in self.user_with_membership_obj:
                self.assertNotIn(user_obj.email, google_group_members_old_user_by_email)
            else:
                self.assertIn(user_obj.email, google_group_members_old_user_by_email)
                self.assertEqual(
                    google_group_members_old_user_by_email[user_obj.email].role,
                    GoogleGroupUserRole.MEMBER,
                )

        for user_email_obj in self.user_email_objs:
            self.assertNotIn(
                user_email_obj.email, google_group_members_old_user_by_email
            )

    def test_sync_users__newsletter(self, *args, **kwargs):
        with mock.patch(
            "googleapiclient.http.HttpRequest.execute",
            side_effect=MockGoogleApiClientExecute({"members": []}, {}),
        ):
            with self.assertNumOperations(
                num=0,
                num_selects=10,
                num_inserts=2,
            ):
                user.api.google_group.sync_users(
                    group_id=self.google_group_newsletter_obj.id
                )

        google_group_newsletter_user_by_email = {
            google_group_user_obj.email: google_group_user_obj
            for google_group_user_obj in GoogleGroupUser.objects.filter(
                group=self.google_group_newsletter_obj
            )
        }

        self.assertEqual(len(google_group_newsletter_user_by_email), 2)

        self.assertIn(
            self.entity_member_2_obj.email, google_group_newsletter_user_by_email
        )
        self.assertIn(
            self.entity_external_2_obj.email, google_group_newsletter_user_by_email
        )
