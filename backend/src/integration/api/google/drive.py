from io import BytesIO

import mimetypes

from googleapiclient.http import MediaIoBaseUpload

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build, Resource

from comunicat.enums import Module
from integration.consts import GOOGLE_DRIVE_SCOPES
from integration.models import GoogleIntegration


def get_service(module: Module) -> Resource | None:
    google_integration_obj = GoogleIntegration.objects.filter(module=module).first()

    if not google_integration_obj:
        return

    creds = Credentials.from_authorized_user_info(
        info=google_integration_obj.authorized_user_info,
        scopes=GOOGLE_DRIVE_SCOPES,
    )
    service = build("drive", "v3", credentials=creds)

    return service


def upload_file(
    service,
    file_bytes: BytesIO,
    file_name: str,
    drive_id: str,
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
            driveId=drive_id,
            includeItemsFromAllDrives=True,
            corpora="drive",
            supportsAllDrives=True,
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


def create_folder(
    service,
    drive_id: str,
    folder_name: str,
    parent_id: str | None = None,
) -> str:
    # TODO: Problematic if there are over 100 folders/months
    results = (
        service.files()
        .list(
            pageSize=100,
            fields="files(id, name)",
            driveId=drive_id,
            includeItemsFromAllDrives=True,
            corpora="drive",
            supportsAllDrives=True,
            **({"q": f"'{parent_id}' in parents"} if parent_id else {}),
        )
        .execute()
    )

    folder_id_by_name = {
        folder["name"]: folder["id"] for folder in results.get("files", [])
    }

    folder_id = folder_id_by_name.get(folder_name)
    if not folder_id:
        folder_id = (
            service.files()
            .create(
                body={
                    "name": folder_name,
                    "mimeType": "application/vnd.google-apps.folder",
                    **({"parents": [parent_id]} if parent_id else {}),
                },
                fields="id",
                supportsAllDrives=True,
            )
            .execute()["id"]
        )

    return folder_id
