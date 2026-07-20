import logging
from uuid import UUID

from django.db import transaction
from django.db.models import Prefetch, Q
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

import user.api
from comunicat.utils.email import get_module_emails_from_user
from consent.models import EntityConsent
from notify.enums import NewsletterType
from notify.models import Newsletter
from user.consts import GOOGLE_GROUP_SCOPES
from user.enums import GoogleGroupUserRole
from user.models import GoogleGroup, GoogleGroupUser, User

_log = logging.getLogger(__name__)


@transaction.atomic
def sync_from_consent(entity_consent_id: UUID) -> GoogleGroupUser | None:
    entity_consent_obj = (
        EntityConsent.objects.filter(
            id=entity_consent_id,
            entity__email__isnull=False,
            deleted_at__isnull=True,
            newsletter__isnull=False,
            newsletter__type=NewsletterType.GOOGLE,
            newsletter__google_group__isnull=False,
        )
        .select_related(
            "newsletter",
            "newsletter__google_group",
            "newsletter__google_group__google_integration",
        )
        .first()
    )

    if not entity_consent_obj:
        return None

    google_group_user_obj, __ = GoogleGroupUser.objects.get_or_create(
        group=entity_consent_obj.newsletter.google_group,
        email=entity_consent_obj.entity.email,
        defaults={"user": entity_consent_obj.entity.user},
    )

    creds = Credentials.from_authorized_user_info(
        info=entity_consent_obj.newsletter.google_group.google_integration.authorized_user_info,
        scopes=GOOGLE_GROUP_SCOPES,
    )
    service = build("admin", "directory_v1", credentials=creds)

    user_domain_emails = (
        get_module_emails_from_user(user_obj=entity_consent_obj.entity.user)
        if entity_consent_obj.entity.user
        else []
    )

    try:
        service.members().insert(
            groupKey=entity_consent_obj.newsletter.google_group.external_id,
            body={
                "email": entity_consent_obj.entity.email,
                "role": (
                    GoogleGroupUserRole.MANAGER.name
                    if entity_consent_obj.entity.email in user_domain_emails
                    else GoogleGroupUserRole.MEMBER.name
                ),
            },
        ).execute()
    except HttpError as e:
        _log.exception(e)

    entity_consent_obj.google_group_user = google_group_user_obj
    entity_consent_obj.save(sync=False)

    return google_group_user_obj


# TODO: Missing update with role and store in model
def sync_users(group_id: UUID | None = None) -> None:
    google_group_filter = Q()

    if group_id:
        google_group_filter &= Q(id=group_id)

    google_group_objs = list(
        GoogleGroup.objects.filter(google_group_filter)
        .select_related("google_integration")
        .prefetch_related(
            "modules",
            "users",
            "newsletters",
            Prefetch(
                "newsletters",
                Newsletter.objects.prefetch_related(
                    Prefetch(
                        "consents",
                        EntityConsent.objects.filter(
                            entity__email__isnull=False, deleted_at__isnull=True
                        ),
                        to_attr="all_consents",
                    )
                ),
                to_attr="all_newsletters",
            ),
        )
    )

    for google_group_obj in google_group_objs:
        creds = Credentials.from_authorized_user_info(
            info=google_group_obj.google_integration.authorized_user_info,
            scopes=GOOGLE_GROUP_SCOPES,
        )
        service = build("admin", "directory_v1", credentials=creds)

        existing_members = (
            service.members().list(groupKey=google_group_obj.external_id).execute()
        )
        existing_emails = {
            member.get("email"): GoogleGroupUserRole[
                member.get("role", GoogleGroupUserRole.MEMBER.name)
            ]
            for member in existing_members.get("members", [])
            if "email" in member
        }
        while "nextPageToken" in existing_members:
            existing_members = (
                service.members()
                .list(
                    groupKey=google_group_obj.external_id,
                    pageToken=existing_members["nextPageToken"],
                )
                .execute()
            )
            existing_emails = {
                **existing_members,
                **{
                    member.get("email"): GoogleGroupUserRole[
                        member.get("role", GoogleGroupUserRole.MEMBER.name)
                    ]
                    for member in existing_members.get("members", [])
                    if "email" in member
                },
            }

        google_group_user_by_email = {
            google_group_user_obj.email: google_group_user_obj
            for google_group_user_obj in google_group_obj.users.all()
        }

        permission_by_email: dict[str, GoogleGroupUserRole] = {}
        user_by_email: dict[str, User] = {}

        # Entities that should be present based on newsletters
        emails_due_newsletter = {
            entity_consent_obj.entity.email
            for newsletter_obj in google_group_obj.all_newsletters
            for entity_consent_obj in newsletter_obj.all_consents
        }

        # Entities that should be present based on group rules
        emails_due_module = set()
        for google_group_module_obj in google_group_obj.modules.all():
            team_ids = (
                [google_group_module_obj.team.id]
                if google_group_module_obj.team
                else []
            )
            user_objs = user.api.get_list(
                team_ids=team_ids,
                modules=[google_group_module_obj.module],
                with_membership=google_group_module_obj.require_membership,
                with_active_membership=google_group_module_obj.require_membership,
                with_pending_membership=not google_group_module_obj.require_membership,
                with_expired_membership=google_group_module_obj.exclude_active,
            )

            if google_group_module_obj.require_module_domain:
                user_module_by_email = {
                    email: user_obj
                    for user_obj in user_objs
                    if user_obj.can_manage
                    for email in get_module_emails_from_user(
                        user_obj=user_obj, module=google_group_module_obj.module
                    )
                }
                for email, user_obj in user_module_by_email.items():
                    # MANAGER is the highest role assigned due to group rules, default is MEMBER
                    # TODO: Possibly handle OWNERs as well via permissions
                    permission_by_email[email] = GoogleGroupUserRole.MANAGER
            else:
                user_module_by_email = {
                    **{
                        user_obj.email: user_obj
                        for user_obj in user_objs
                        if user_obj.can_manage
                    },
                    **(
                        {
                            user_email_obj.email: user_obj
                            for user_obj in user_objs
                            if user_obj.can_manage and hasattr(user_obj, "emails")
                            for user_email_obj in user_obj.emails.all()
                        }
                    ),
                }

            emails_due_module = emails_due_module.union(
                set(user_module_by_email.keys())
            )
            user_by_email = {**user_by_email, **user_module_by_email}

        emails_due_all = emails_due_newsletter.union(emails_due_module)

        emails_to_add_group = {
            email for email in emails_due_all if email not in existing_emails.keys()
        }
        if google_group_obj.delete_on_expire:
            emails_to_delete_group = {
                email
                for email in existing_emails.keys()
                if email not in emails_due_all
                and (
                    email not in google_group_user_by_email
                    or not google_group_user_by_email[email].force_member
                )
            }
        else:
            emails_to_delete_group = set()
        emails_to_update_group = {
            email
            for email in emails_due_all
            if email in existing_emails.keys()
            and email not in emails_to_delete_group
            and permission_by_email.get(email, GoogleGroupUserRole.MEMBER)
            != existing_emails[email]
        }

        # Delete emails from the Google group
        for email_to_delete_group in emails_to_delete_group:
            try:
                service.members().delete(
                    groupKey=google_group_obj.external_id,
                    memberKey=email_to_delete_group,
                ).execute()
                GoogleGroupUser.objects.filter(
                    group=google_group_obj,
                    email=email_to_delete_group,
                ).delete()
            except HttpError as e:
                _log.exception(e)
        # Add emails to the Google group
        for email_to_add_group in emails_to_add_group:
            google_group_user_role = permission_by_email.get(
                email_to_add_group, GoogleGroupUserRole.MEMBER
            )
            try:
                service.members().insert(
                    groupKey=google_group_obj.external_id,
                    body={
                        "email": email_to_add_group,
                        "role": google_group_user_role.name,
                    },
                ).execute()
                GoogleGroupUser.objects.update_or_create(
                    group=google_group_obj,
                    email=email_to_add_group,
                    defaults={
                        "user": user_by_email.get(email_to_add_group),
                        "role": google_group_user_role,
                    },
                )
            except HttpError as e:
                _log.exception(e)

        # Update emails from the Google group
        for email_to_update_group in emails_to_update_group:
            google_group_user_role = permission_by_email.get(
                email_to_update_group, GoogleGroupUserRole.MEMBER
            )
            try:
                service.members().update(
                    groupKey=google_group_obj.external_id,
                    memberKey=email_to_update_group,
                    body={
                        "email": email_to_update_group,
                        "role": google_group_user_role.name,
                    },
                ).execute()
                GoogleGroupUser.objects.update_or_create(
                    group=google_group_obj,
                    email=email_to_update_group,
                    defaults={
                        "user": user_by_email.get(email_to_update_group),
                        "role": google_group_user_role,
                    },
                )
            except HttpError as e:
                _log.exception(e)
