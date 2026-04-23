from uuid import UUID

from django.db.models import Q

from activity.enums import ProgramCourseRegistrationStatus
from activity.models import ProgramCourseRegistration
from comunicat.enums import Module

import user.api.family


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
