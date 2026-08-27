from uuid import UUID

from django.db.models import Q

import user.api.family
from activity.enums import ProgramCourseRegistrationStatus
from activity.models import ProgramCourseRegistration
from comunicat.consts import ZERO_MONEY
from comunicat.enums import Module


def get_list(
    user_id: UUID,
    module: Module,
    course_ids: list[UUID] | None = None,
    for_admin: bool = False,
    for_family: bool = False,
) -> list[ProgramCourseRegistration]:
    registration_filter = Q()

    if course_ids:
        registration_filter &= Q(course_id__in=course_ids)

    if not for_admin:
        if for_family:
            user_ids = user.api.family.get_user_ids(user_id=user_id)
            registration_filter &= Q(entity__user_id__in=user_ids)
        else:
            registration_filter &= Q(entity__user_id=user_id)

        registration_filter &= Q(status=ProgramCourseRegistrationStatus.ACTIVE)

    return list(
        # TODO: Allow non-user registrations but add support for entity on serializer instead before
        ProgramCourseRegistration.objects.filter(registration_filter)
        .filter_with_user()
        .select_related("course", "course__program", "entity", "entity__user")
        .order_by("-course__date_from", "created_at")
    )


def delete(registration_id: UUID, user_id: UUID, module: Module) -> bool:
    program_course_registration_obj = ProgramCourseRegistration.objects.filter(
        Q(
            Q(status=ProgramCourseRegistrationStatus.REQUESTED)
            | Q(status=ProgramCourseRegistrationStatus.ACTIVE, amount=ZERO_MONEY)
        ),
        id=registration_id,
        entity__user__family_member__family__members__user_id=user_id,
    ).first()

    if not program_course_registration_obj:
        return False

    program_course_registration_obj.status = ProgramCourseRegistrationStatus.CANCELLED
    program_course_registration_obj.save(update_fields=("status",))

    return True
