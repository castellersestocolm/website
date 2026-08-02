from io import BytesIO

from django.db.models import Prefetch
from django.utils import timezone, translation
from django.utils.translation import gettext_lazy as _
from openpyxl.styles import Font, numbers
from openpyxl.workbook import Workbook

from comunicat.consts import LOCALE_BY_MODULE, SHORT_NAME_BY_MODULE
from comunicat.enums import Module
from membership.enums import MembershipStatus
from membership.models import MembershipModule, MembershipUser


def export_memberships(module: Module) -> BytesIO:
    membership_user_objs = (
        MembershipUser.objects.filter(
            membership__modules__module=module,
            membership__date_end__isnull=True,
            membership__date_from__lte=timezone.localdate(),
            membership__date_to__gte=timezone.localdate(),
        )
        .select_related("family", "user", "membership")
        .prefetch_related(
            "family__members",
            Prefetch(
                "membership__modules", MembershipModule.objects.order_by("module")
            ),
        )
        .with_membership_amount()
        .with_family_name()
        .order_by(
            "user__firstname",
            "user__lastname",
            "-user__created_at",
            "membership__date_from",
            "-membership__status",
            "-membership__created_at",
        )
        .distinct()
    )

    wb = Workbook()
    ws = wb.active

    with translation.override(LOCALE_BY_MODULE[module]):
        ws.title = str(_("Members"))

        ws.append(
            [
                str(_("First name")),
                str(_("Last name")),
                str(_("Email")),
                str(_("Phone")),
                str(_("Family")),
                str(_("Membership")),
                str(_("Date from")),
                str(_("Date to")),
                str(_("Status")),
                str(_("Price")),
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
        ws.column_dimensions["J"].number_format = "[$SEK ]#,##0.00_-"

        font_fold = Font(bold=True)

        for cell in ws["1:1"]:
            cell.font = font_fold

        for membership_user_obj in membership_user_objs:
            ws.append(
                [
                    membership_user_obj.user.firstname,
                    membership_user_obj.user.lastname,
                    (
                        membership_user_obj.user.email
                        if membership_user_obj.user.can_manage
                        else ""
                    ),
                    (
                        membership_user_obj.user.phone or ""
                        if membership_user_obj.user.can_manage
                        else ""
                    ),
                    membership_user_obj.family_name,
                    "\n".join(
                        [
                            SHORT_NAME_BY_MODULE[membership_module_obj.module]
                            for membership_module_obj in membership_user_obj.membership.modules.all()
                        ]
                    ),
                    membership_user_obj.membership.date_from.strftime("%Y-%m-%d"),
                    membership_user_obj.membership.date_to.strftime("%Y-%m-%d"),
                    str(MembershipStatus.labels[membership_user_obj.membership.status]),
                    membership_user_obj.membership_amount.amount,
                ]
            )

    bytes_workbook = BytesIO()
    wb.save(bytes_workbook)

    return bytes_workbook
