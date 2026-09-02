from uuid import UUID

from django.utils import translation
from django.utils.translation import gettext_lazy as _

from comunicat.consts import LOCALE_BY_MODULE
from event.api.export import export_event
from event.consts import GOOGLE_DRIVE_BY_MODULE
from event.models import Event
from integration.api.google.drive import create_folder, get_service, upload_file


def sync_event(event_id: UUID) -> None:
    event_obj = (
        Event.objects.filter(id=event_id).prefetch_related("registrations").first()
    )

    if not event_obj:
        return None

    service = get_service(module=event_obj.module)

    if not service:
        return None

    google_drive_id = GOOGLE_DRIVE_BY_MODULE[event_obj.module]["drive_id"]
    google_folder_id = GOOGLE_DRIVE_BY_MODULE[event_obj.module]["folder_id"]

    if not google_drive_id or not google_folder_id:
        return None

    folder_year_id = create_folder(
        service=service,
        drive_id=google_drive_id,
        folder_name=str(event_obj.time_from.year),
        parent_id=google_folder_id,
    )

    with translation.override(LOCALE_BY_MODULE[event_obj.module]):
        folder_event_id = create_folder(
            service=service,
            drive_id=google_drive_id,
            folder_name=event_obj.title_locale,
            parent_id=folder_year_id,
        )

        event_file = export_event(event_id=event_id)
        registrations_name = f"{str(_('Registrations'))}.xlsx"
        upload_file(
            service=service,
            drive_id=google_drive_id,
            file_bytes=event_file,
            file_name=registrations_name,
            folder_id=folder_event_id,
            mime_type="application/vnd.google-apps.spreadsheet",
        )

    return None
