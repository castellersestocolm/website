import itertools
from uuid import UUID

from activity.api.export import export_program_course
from activity.models import Program
from integration.api.google.drive import create_folder, get_service, upload_file
from django.utils.translation import gettext_lazy as _

from activity.consts import GOOGLE_DRIVE_ID, GOOGLE_DRIVE_FOLDER_ID


# TODO: Sync other files related to the statement like payments and expenses
def sync_programmes(program_id: UUID) -> None:
    program_obj = (
        Program.objects.filter(id=program_id)
        .prefetch_related("courses")
        .with_name()
        .first()
    )

    if not program_obj:
        return None

    service = get_service(module=program_obj.module)

    if not service:
        return None

    for year, program_course_objs in itertools.groupby(
        program_obj.courses.all(),
        lambda pc_obj: pc_obj.date_from.year,
    ):
        folder_year_id = create_folder(
            service=service,
            drive_id=GOOGLE_DRIVE_ID,
            folder_name=str(year),
            parent_id=GOOGLE_DRIVE_FOLDER_ID,
        )

        for program_course_obj in program_course_objs:
            folder_course_id = create_folder(
                service=service,
                drive_id=GOOGLE_DRIVE_ID,
                folder_name=program_obj.name_locale,
                parent_id=folder_year_id,
            )

            course_file = export_program_course(course_id=program_course_obj.id)
            payments_name = f"{str(_('Registrations'))}.xlsx"
            upload_file(
                service=service,
                drive_id=GOOGLE_DRIVE_ID,
                file_bytes=course_file,
                file_name=payments_name,
                folder_id=folder_course_id,
                mime_type="application/vnd.google-apps.spreadsheet",
            )

    return None
