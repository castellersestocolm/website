from io import BytesIO
from uuid import UUID

from django.db.models import Prefetch
from openpyxl.workbook import Workbook
from openpyxl.styles import numbers, Font

from activity.enums import ProgramCourseRegistrationStatus
from activity.models import ProgramCourse, ProgramCourseRegistration

from django.utils.translation import gettext_lazy as _

from user.enums import FamilyMemberStatus, FamilyMemberRole
from user.models import FamilyMember


def export_program_course(course_id: UUID) -> BytesIO:
    program_course_obj = (
        ProgramCourse.objects.filter(id=course_id)
        .prefetch_related(
            Prefetch(
                "registrations",
                ProgramCourseRegistration.objects.select_related(
                    "entity", "entity__user"
                ).order_by("entity__firstname", "entity__lastname"),
            ),
            Prefetch(
                "registrations__entity__user__family_member__family__members",
                FamilyMember.objects.filter(
                    status__in=(FamilyMemberStatus.REQUESTED, FamilyMemberStatus.ACTIVE)
                )
                .select_related("user")
                .order_by("-role", "user__firstname", "user__lastname"),
            ),
        )
        .first()
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
                "Age",
                "Family",
                "Parents",
                "Emails",
                "Phones",
                "Status",
                "Price",
            ]
        ]
    )

    ws.column_dimensions["A"].width = 15
    ws.column_dimensions["B"].width = 25
    ws.column_dimensions["C"].width = 10
    ws.column_dimensions["D"].width = 25
    ws.column_dimensions["E"].width = 30
    ws.column_dimensions["F"].width = 30
    ws.column_dimensions["G"].width = 20
    ws.column_dimensions["H"].width = 15
    ws.column_dimensions["I"].width = 10

    ws.column_dimensions["C"].number_format = numbers.FORMAT_NUMBER_00
    ws.column_dimensions["I"].number_format = numbers.FORMAT_NUMBER_00

    font_fold = Font(bold=True)

    for cell in ws["1:1"]:
        cell.font = font_fold

    for program_course_registration_obj in program_course_obj.registrations.all():
        family_user_objs = (
            [
                family_member_obj.user
                for family_member_obj in program_course_registration_obj.entity.user.family_member.family.members.all()
                if family_member_obj.role == FamilyMemberRole.MANAGER
                and family_member_obj.user.can_manage
            ]
            if program_course_registration_obj.entity.user
            and hasattr(program_course_registration_obj.entity.user, "family_member")
            else []
        )

        firstname = (
            program_course_registration_obj.entity.user.firstname
            if program_course_registration_obj.entity.user
            else program_course_registration_obj.entity.firstname
        )
        lastname = (
            program_course_registration_obj.entity.user.lastname
            if program_course_registration_obj.entity.user
            else program_course_registration_obj.entity.lastname
        )
        age = (
            program_course_registration_obj.entity.user.age
            if program_course_registration_obj.entity.user
            else 0
        )
        family_str = (
            str(program_course_registration_obj.entity.user.family_member.family)
            if program_course_registration_obj.entity.user
            and hasattr(program_course_registration_obj.entity.user, "family_member")
            else "-"
        )
        family_names = [user_obj.name for user_obj in family_user_objs if user_obj.name]
        family_emails = [user_obj.email for user_obj in family_user_objs]
        family_phones = [
            user_obj.phone for user_obj in family_user_objs if user_obj.phone
        ]

        ws.append(
            [
                firstname,
                lastname,
                age,
                family_str,
                "\n".join(family_names),
                "\n".join(family_emails),
                "\n".join(family_phones),
                ProgramCourseRegistrationStatus(
                    program_course_registration_obj.status
                ).name,
                program_course_registration_obj.amount.amount,
            ]
        )

    bytes_workbook = BytesIO()
    wb.save(bytes_workbook)

    return bytes_workbook
