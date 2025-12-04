from uuid import UUID

from activity.models import ProgramCourseRegistration, ProgramCoursePrice
from payment.models import Entity


def register_entity(
    entity_id: UUID, course_ids: list[UUID]
) -> list[ProgramCourseRegistration]:
    program_course_registration_objs = []

    for course_id in course_ids:
        program_course_price_obj = get_course_price(
            entity_id=entity_id, course_id=course_id
        )

        if not program_course_price_obj:
            continue

        program_course_registration_obj, __ = (
            ProgramCourseRegistration.objects.get_or_create(
                course_id=course_id,
                entity_id=entity_id,
                defaults={
                    "price_id": program_course_price_obj.id,
                    "amount": program_course_price_obj.amount,
                },
            )
        )
        program_course_registration_objs.append(program_course_registration_obj)

    return program_course_registration_objs


def get_course_price(entity_id: UUID, course_id: UUID) -> ProgramCoursePrice | None:
    entity_obj = Entity.objects.filter(id=entity_id).select_related("user").first()

    if not entity_obj:
        return None

    user_obj = entity_obj.user

    family_obj = user_obj.family_member.family if user_obj else None
    if family_obj:
        existing_family_members_registered = (
            ProgramCourseRegistration.objects.exclude(entity_id=entity_id)
            .filter(entity__user__family_member__family=family_obj)
            .count()
        )
    else:
        existing_family_members_registered = 0

    program_course_price_objs = list(
        ProgramCoursePrice.objects.filter(
            course_id=course_id,
            min_registrations__gte=existing_family_members_registered,
        ).order_by("min_registrations", "amount")
    )

    for program_course_price_obj in program_course_price_objs:
        if program_course_price_obj.age_from and (
            not user_obj
            or user_obj.age is None
            or program_course_price_obj.age_from > user_obj.age
        ):
            continue
        if program_course_price_obj.age_to and (
            not user_obj
            or user_obj.age is None
            or program_course_price_obj.age_to < user_obj.age
        ):
            continue
        return program_course_price_obj

    return None
