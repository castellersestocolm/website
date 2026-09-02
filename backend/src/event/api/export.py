from io import BytesIO
from uuid import UUID

from django.db.models import Prefetch
from django.utils import translation
from django.utils.translation import gettext_lazy as _
from openpyxl.styles import DEFAULT_FONT, Font, numbers
from openpyxl.workbook import Workbook

from comunicat.consts import FONT_NAME_BY_MODULE, LOCALE_BY_MODULE
from event.enums import RegistrationStatus
from event.models import Event, Registration


def export_event(event_id: UUID) -> BytesIO:
    event_obj = (
        Event.objects.filter(id=event_id)
        .prefetch_related(
            Prefetch(
                "registrations",
                Registration.objects.select_related("entity", "entity__user", "price")
                .with_family_name()
                .order_by("entity__firstname", "entity__lastname"),
            ),
        )
        .first()
    )

    font_name = FONT_NAME_BY_MODULE[event_obj.module]

    wb = Workbook()
    ws = wb.active

    DEFAULT_FONT.name = font_name
    font_fold = Font(name=font_name, bold=True)

    with translation.override(LOCALE_BY_MODULE[event_obj.module]):
        ws.title = str(_("Registrations"))

        ws.append(
            [
                str(_("First name")),
                str(_("Last name")),
                str(_("Age")),
                str(_("Family")),
                str(_("Email")),
                str(_("Phone")),
                str(_("Status")),
                str(_("Price")),
            ]
        )

        ws.column_dimensions["A"].width = 15
        ws.column_dimensions["B"].width = 25
        ws.column_dimensions["C"].width = 10
        ws.column_dimensions["D"].width = 25
        ws.column_dimensions["E"].width = 30
        ws.column_dimensions["F"].width = 20
        ws.column_dimensions["G"].width = 15
        ws.column_dimensions["H"].width = 10

        ws.column_dimensions["C"].number_format = numbers.FORMAT_NUMBER_00
        ws.column_dimensions["H"].number_format = "[$SEK ]#,##0.00_-"

        for cell in ws["1:1"]:
            cell.font = font_fold

        for registration_obj in event_obj.registrations.all():
            firstname = (
                registration_obj.entity.user.firstname
                if registration_obj.entity.user
                else registration_obj.entity.firstname
            )
            lastname = (
                registration_obj.entity.user.lastname
                if registration_obj.entity.user
                else registration_obj.entity.lastname
            )
            age = (
                registration_obj.entity.user.age if registration_obj.entity.user else ""
            )
            email = (
                registration_obj.entity.user.email
                if registration_obj.entity.user
                else registration_obj.entity.email
            )
            phone = (
                registration_obj.entity.user.phone
                if registration_obj.entity.user
                else registration_obj.entity.phone
            )

            ws.append(
                [
                    firstname,
                    lastname,
                    age,
                    registration_obj.family_name,
                    email,
                    phone,
                    str(RegistrationStatus.labels[registration_obj.status]),
                    registration_obj.price.amount.amount,
                ]
            )

    bytes_workbook = BytesIO()
    wb.save(bytes_workbook)

    return bytes_workbook
