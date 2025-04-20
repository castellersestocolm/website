from ast import Bytes
from io import BytesIO
from uuid import UUID

import mimetypes

from comunicat.enums import Module
from integration.models import GoogleIntegration

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build, Resource
from googleapiclient.http import MediaIoBaseUpload

from payment.api.export import export_payments
from payment.consts import GOOGLE_DRIVE_SCOPES, GOOGLE_DRIVE_FILES_LIST, GOOGLE_DRIVE_ID
from payment.models import Statement


def upload_file(
    service,
    file_bytes: BytesIO,
    file_name: str,
    folder_id: str,
    mime_type: str | None = None,
) -> str:
    media = MediaIoBaseUpload(file_bytes, mimetype=mimetypes.guess_type(file_name)[0])
    file_name = ".".join(file_name.split(".")[:-1])

    results = (
        service.files()
        .list(
            pageSize=100,
            fields="files(id, name)",
            **GOOGLE_DRIVE_FILES_LIST,
            q=f"name = '{file_name}' and '{folder_id}' in parents",
        )
        .execute()
    )

    file_id_by_name = {file["name"]: file["id"] for file in results.get("files", [])}

    file_id = file_id_by_name.get(file_name)
    if file_id:
        metadata = {
            "name": file_name,
            **({"mimeType": mime_type} if mime_type is not None else {}),
        }
        file = (
            service.files()
            .update(
                fileId=file_id,
                body=metadata,
                media_body=media,
                fields="id",
                supportsAllDrives=True,
            )
            .execute()
        )
    else:
        metadata = {
            "name": file_name,
            "parents": [folder_id],
            **({"mimeType": mime_type} if mime_type is not None else {}),
        }
        file = (
            service.files()
            .create(
                body=metadata,
                media_body=media,
                fields="id",
                supportsAllDrives=True,
            )
            .execute()
        )

    return file["id"]


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

    upload_file(
        service=service,
        file_bytes=statement_obj.file.file,
        file_name=file_name,
        folder_id=folder_month_id,
    )

    payments_file = export_payments(
        date_from=statement_obj.date_from, date_to=statement_obj.date_to, module=module
    )
    payments_name = f"Payments_{statement_obj.date_from.strftime('%Y%m%d')}_{statement_obj.date_to.strftime('%Y%m%d')}.xlsx"
    upload_file(
        service=service,
        file_bytes=payments_file,
        file_name=payments_name,
        folder_id=folder_month_id,
        mime_type="application/vnd.google-apps.spreadsheet",
    )

    return None
