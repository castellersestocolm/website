from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from comunicat.consts import DOMAIN_BY_MODULE
from user.consts import GOOGLE_GROUP_SCOPES
from user.models import GoogleGroup

import user.api

import logging

_log = logging.getLogger(__name__)


def sync_users() -> None:
    google_group_objs = list(
        GoogleGroup.objects.select_related("google_integration").prefetch_related(
            "modules"
        )
    )

    for google_group_obj in google_group_objs:
        creds = Credentials.from_authorized_user_info(
            info=google_group_obj.google_integration.authorized_user_info,
            scopes=GOOGLE_GROUP_SCOPES,
        )
        service = build("admin", "directory_v1", credentials=creds)

        user_emails = set()

        for google_group_module_obj in google_group_obj.modules.all():
            team_ids = (
                [google_group_module_obj.team.id]
                if google_group_module_obj.team
                else []
            )
            user_objs = user.api.get_list(
                team_ids=team_ids,
                modules=[google_group_module_obj.module],
                with_pending_membership=not google_group_module_obj.require_membership,
            )

            if google_group_module_obj.require_module_domain:
                email_domain = f"@{DOMAIN_BY_MODULE[google_group_module_obj.module]}"
                user_emails = user_emails.union(
                    {
                        email
                        for user_obj in user_objs
                        if user_obj.can_manage
                        for email in [
                            tmp_email
                            for tmp_email in [user_obj.email]
                            + (
                                [
                                    user_email_obj.email
                                    for user_email_obj in user_obj.emails.all()
                                ]
                                if hasattr(user_obj, "emails")
                                else []
                            )
                            if tmp_email.endswith(email_domain)
                        ][:1]
                    }
                )
            else:
                user_emails = user_emails.union(
                    {user_obj.email for user_obj in user_objs if user_obj.can_manage}
                )

        existing_members = (
            service.members().list(groupKey=google_group_obj.external_id).execute()
        )
        existing_emails = [
            member.get("email")
            for member in existing_members.get("members", [])
            if "email" in member
        ]
        while "nextPageToken" in existing_members:
            existing_members = (
                service.members()
                .list(
                    groupKey=google_group_obj.external_id,
                    pageToken=existing_members["nextPageToken"],
                )
                .execute()
            )
            existing_emails += [
                member.get("email")
                for member in existing_members.get("members", [])
                if "email" in member
            ]

        if google_group_obj.delete_on_expire:
            delete_emails = set(existing_emails) - set(user_emails)

            for delete_email in delete_emails:
                try:
                    service.members().delete(
                        groupKey=google_group_obj.external_id, memberKey=delete_email
                    ).execute()
                except HttpError as e:
                    _log.exception(e)

        create_emails = set(user_emails) - set(existing_emails)

        for create_email in create_emails:
            try:
                service.members().insert(
                    groupKey=google_group_obj.external_id,
                    body={"email": create_email},
                ).execute()
            except HttpError as e:
                _log.exception(e)
