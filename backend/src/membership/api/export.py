from io import BytesIO

from django.db.models import Prefetch
from django.utils.translation import gettext_lazy as _
from openpyxl.styles import Font, numbers
from openpyxl.workbook import Workbook

from comunicat.consts import SHORT_NAME_BY_MODULE
from comunicat.enums import Module
from membership.enums import MembershipStatus
from membership.models import MembershipModule, MembershipUser
from user.models import FamilyMember


def export_memberships(module: Module) -> BytesIO:
    membership_user_objs = (
        MembershipUser.objects.filter(membership__modules__module=module)
        .select_related("family", "user", "membership")
        .prefetch_related(
            Prefetch(
                "family__members",
                FamilyMember.objects.order_by(
                    "-role", "user__firstname", "user__lastname", "-user__created_at"
                ),
            ),
            Prefetch(
                "membership__modules", MembershipModule.objects.order_by("module")
            ),
        )
        .with_membership_amount()
        .with_family_role()
        .order_by(
            "user__firstname",
            "user__lastname",
            "-user__created_at",
            "membership__date_from",
            "-membership__status",
            "-membership__created_at",
        )
    )

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

    for membership_user_obj in membership_user_objs:
        ws.append(
            [
                membership_user_obj.user.firstname,
                membership_user_obj.user.lastname,
                membership_user_obj.user.email,
                membership_user_obj.user.phone or "",
                # TODO: Lower queries here
                membership_user_obj.family and str(membership_user_obj.family) or "",
                "\n".join(
                    [
                        SHORT_NAME_BY_MODULE[membership_module_obj.module]
                        for membership_module_obj in membership_user_obj.membership.modules.all()
                    ]
                ),
                membership_user_obj.membership.date_from.strftime("%Y-%m-%d"),
                membership_user_obj.membership.date_to.strftime("%Y-%m-%d"),
                MembershipStatus(membership_user_obj.membership.status).name,
                str(membership_user_obj.membership_amount),
            ]
        )

    bytes_workbook = BytesIO()
    wb.save(bytes_workbook)

    return bytes_workbook
