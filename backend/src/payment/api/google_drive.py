from uuid import UUID

import mimetypes

from comunicat.enums import Module
from integration.models import GoogleIntegration

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

from payment.consts import GOOGLE_DRIVE_SCOPES, GOOGLE_DRIVE_FILES_LIST, GOOGLE_DRIVE_ID
from payment.models import Statement


# TODO: Move functions out
# TODO: Sync other files related to the statement like payments and expenses
def sync_statement(statement_id: UUID, module: Module) -> None:
    google_integration_obj = GoogleIntegration.objects.filter(module=module).first()

    if not google_integration_obj:
        return

    statement_obj = Statement.objects.filter(id=statement_id).first()

    if not statement_obj:
        return

    statement_year = str(statement_obj.date_from.year)
    statement_month = str(statement_obj.date_from.month)

    creds = Credentials.from_authorized_user_info(
        info=google_integration_obj.authorized_user_info,
        scopes=GOOGLE_DRIVE_SCOPES,
    )
    service = build("drive", "v3", credentials=creds)

    # TODO: Problematic if there are over 100 folders/years
    results = (
        service.files()
        .list(pageSize=100, fields="files(id, name)", **GOOGLE_DRIVE_FILES_LIST)
        .execute()
    )

    folder_id_by_year = {
        folder["name"]: folder["id"] for folder in results.get("files", [])
    }

    folder_year_id = folder_id_by_year.get(statement_year)
    if not folder_year_id:
        folder_year_id = (
            service.files()
            .create(
                body={
                    "name": statement_year,
                    "mimeType": "application/vnd.google-apps.folder",
                    "parents": [GOOGLE_DRIVE_ID],
                },
                fields="id",
                supportsAllDrives=True,
            )
            .execute()["id"]
        )

    # TODO: Problematic if there are over 100 folders/months
    results = (
        service.files()
        .list(
            pageSize=100,
            fields="files(id, name)",
            **GOOGLE_DRIVE_FILES_LIST,
            q=f"'{folder_year_id}' in parents",
        )
        .execute()
    )

    folder_id_by_month = {
        folder["name"]: folder["id"] for folder in results.get("files", [])
    }

    folder_month_id = folder_id_by_month.get(statement_month)
    if not folder_month_id:
        folder_month_id = (
            service.files()
            .create(
                body={
                    "name": statement_month,
                    "mimeType": "application/vnd.google-apps.folder",
                    "parents": [folder_year_id],
                },
                fields="id",
                supportsAllDrives=True,
            )
            .execute()["id"]
        )

    file_extension = statement_obj.file.name.split(".")[-1]
    file_name = f"{statement_obj.source.name}_{statement_obj.date_from.strftime('%Y%m%d')}_{statement_obj.date_to.strftime('%Y%m%d')}.{file_extension}"
    file_media = MediaIoBaseUpload(
        statement_obj.file.file, mimetype=mimetypes.guess_type(file_name)[0]
    )

    results = (
        service.files()
        .list(
            pageSize=100,
            fields="files(id, name)",
            **GOOGLE_DRIVE_FILES_LIST,
            q=f"name = '{file_name}' and '{folder_month_id}' in parents",
        )
        .execute()
    )

    file_id_by_name = {file["name"]: file["id"] for file in results.get("files", [])}

    file_id = file_id_by_name.get(file_name)
    if file_id:
        file_metadata = {"name": file_name}
        file = (
            service.files()
            .update(
                fileId=file_id,
                body=file_metadata,
                media_body=file_media,
                fields="id",
                supportsAllDrives=True,
            )
            .execute()
        )
    else:
        file_metadata = {
            "name": file_name,
            "parents": [folder_month_id],
        }
        file = (
            service.files()
            .create(
                body=file_metadata,
                media_body=file_media,
                fields="id",
                supportsAllDrives=True,
            )
            .execute()
        )

    return None
