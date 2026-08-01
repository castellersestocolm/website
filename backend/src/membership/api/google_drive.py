from django.utils.translation import gettext_lazy as _

from comunicat.enums import Module
from integration.api.google.drive import get_service, upload_file
from membership.api.export import export_memberships
from membership.consts import GOOGLE_DRIVE_BY_MODULE


# TODO: Add configure to enable the export depending on module and store it accordingly
def sync_memberships(module: Module) -> bool:
    service = get_service(module=module)

    if not service:
        return False

    google_drive_id = GOOGLE_DRIVE_BY_MODULE[module]["drive_id"]
    google_folder_id = GOOGLE_DRIVE_BY_MODULE[module]["folder_id"]

    if not google_drive_id or not google_folder_id:
        return False

    memberships_file = export_memberships(module=module)
    members_name = f"{str(_('Members'))}.xlsx"
    upload_file(
        service=service,
        drive_id=google_drive_id,
        file_bytes=memberships_file,
        file_name=members_name,
        folder_id=google_folder_id,
        mime_type="application/vnd.google-apps.spreadsheet",
    )

    return True
