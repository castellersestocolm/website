from comunicat.enums import Module
from integration.api.google.drive import get_service, upload_file
from django.utils.translation import gettext_lazy as _

from membership.consts import GOOGLE_DRIVE_ID, GOOGLE_DRIVE_FOLDER_ID
from membership.api.export import export_memberships


def sync_memberships(module: Module) -> None:
    service = get_service(module=module)

    if not service:
        return None

    memberships_file = export_memberships()
    members_name = f"{str(_('Members'))}.xlsx"
    upload_file(
        service=service,
        drive_id=GOOGLE_DRIVE_ID,
        file_bytes=memberships_file,
        file_name=members_name,
        folder_id=GOOGLE_DRIVE_FOLDER_ID,
        mime_type="application/vnd.google-apps.spreadsheet",
    )

    return None
