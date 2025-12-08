from io import BytesIO

from openpyxl.workbook import Workbook
from openpyxl.styles import numbers, Font

from django.utils.translation import gettext_lazy as _


# TODO: Include actual memberships
def export_memberships() -> BytesIO:
    wb = Workbook()
    ws = wb.active
    ws.title = str(_("Registrations"))

    ws.append(
        [
            str(_(k))
            for k in [
                "First name",
                "Last name",
                "Email",
                "Phone",
                "Family",
                "Membership",
                "Date from",
                "Date to",
                "Status",
                "Price",
            ]
        ]
    )

    ws.column_dimensions["A"].width = 15
    ws.column_dimensions["B"].width = 25
    ws.column_dimensions["C"].width = 30
    ws.column_dimensions["D"].width = 20
    ws.column_dimensions["E"].width = 25
    ws.column_dimensions["F"].width = 30
    ws.column_dimensions["G"].width = 20
    ws.column_dimensions["H"].width = 20
    ws.column_dimensions["I"].width = 15
    ws.column_dimensions["I"].width = 10

    ws.column_dimensions["G"].number_format = numbers.FORMAT_DATE_YYYYMMDD2
    ws.column_dimensions["H"].number_format = numbers.FORMAT_DATE_YYYYMMDD2
    ws.column_dimensions["I"].number_format = numbers.FORMAT_NUMBER_00

    font_fold = Font(bold=True)

    for cell in ws["1:1"]:
        cell.font = font_fold

    bytes_workbook = BytesIO()
    wb.save(bytes_workbook)

    return bytes_workbook
