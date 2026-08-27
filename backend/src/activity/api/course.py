import itertools
from uuid import UUID

from django.db.models import Prefetch, Q
from django.utils import timezone

import notify.tasks
from activity.enums import ProgramCourseRegistrationStatus, ProgramType
from activity.models import ProgramCourse, ProgramCoursePrice, ProgramCourseRegistration
from comunicat.consts import ZERO_MONEY
from comunicat.enums import Module
from event.enums import EventStatus
from event.models import Event
from notify.enums import EmailType
from payment.models import Entity


def get_list(
    module: Module,
    request_user_id: UUID | None = None,
    filter_program_types: list[ProgramType] | None = None,
) -> list[ProgramCourse]:
    course_filter = Q()

    if filter_program_types:
        course_filter &= Q(program__type__in=filter_program_types)

    return list(
        ProgramCourse.objects.filter(
            course_filter, program__module=module, date_to__gte=timezone.localdate()
        )
        .prefetch_related(
            Prefetch(
                "prices",
                ProgramCoursePrice.objects.order_by("amount"),
            ),
            Prefetch(
                "registrations",
                ProgramCourseRegistration.objects.filter_with_user()
                .filter(
                    entity__user__family_member__family__members__user_id=request_user_id
                )
                .exclude(status=ProgramCourseRegistrationStatus.CANCELLED)
                .select_related("entity", "entity__user")
                .order_by("created_at"),
            ),
            Prefetch(
                "events",
                Event.objects.filter(status=EventStatus.PUBLISHED)
                .order_by("time_from")
                .select_related("location"),
            ),
        )
        .order_by("date_from", "date_to")
    )


def complete_registrations(
    registration_ids: list[UUID],
    is_completed: bool = True,
    with_notify: bool = True,
) -> bool:
    course_registration_objs = list(
        ProgramCourseRegistration.objects.filter(
            id__in=registration_ids,
            status__lte=ProgramCourseRegistrationStatus.PROCESSING,
        )
        .select_related("course", "course__program")
        .distinct()
    )

    if not course_registration_objs:
        return False

    for course_registration_obj in course_registration_objs:
        course_registration_obj.status = (
            ProgramCourseRegistrationStatus.ACTIVE
            if is_completed
            else ProgramCourseRegistrationStatus.PROCESSING
        )

    ProgramCourseRegistration.objects.bulk_update(
        course_registration_objs, fields=("status",)
    )

    if with_notify:
        for (
            program_course_obj,
            program_course_registration_objs,
        ) in itertools.groupby(
            course_registration_objs,
            lambda course_registration_obj: course_registration_obj.course,
        ):
            notify.tasks.send_program_course_registration_email.delay(
                program_course_registration_ids=[
                    program_course_registration_obj.id
                    for program_course_registration_obj in program_course_registration_objs
                ],
                email_type=EmailType.COURSE_REGISTRATION_PAID,
                module=program_course_obj.program.module,
            )

    return True


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

        is_free = program_course_price_obj.amount.amount == ZERO_MONEY.amount

        program_course_registration_obj, __ = (
            ProgramCourseRegistration.objects.get_or_create(
                course_id=course_id,
                entity_id=entity_id,
                defaults={
                    "price_id": program_course_price_obj.id,
                    "amount": program_course_price_obj.amount,
                    "status": (
                        ProgramCourseRegistrationStatus.ACTIVE
                        if is_free
                        else ProgramCourseRegistrationStatus.REQUESTED
                    ),
                },
            )
        )

        if (
            program_course_registration_obj.status
            == ProgramCourseRegistrationStatus.CANCELLED
        ):
            if is_free:
                program_course_registration_obj.status = (
                    ProgramCourseRegistrationStatus.ACTIVE
                )
            else:
                program_course_registration_obj.status = (
                    ProgramCourseRegistrationStatus.REQUESTED
                )
        program_course_registration_obj.price = program_course_price_obj
        program_course_registration_obj.amount = program_course_price_obj.amount

        program_course_registration_obj.save(
            update_fields=("status", "price", "amount")
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
        # TODO: Store in the model if it should ignore free
        existing_family_members_registered = (
            ProgramCourseRegistration.objects.exclude(entity_id=entity_id)
            .filter(entity__user__family_member__family=family_obj, price__amount__gt=0)
            .count()
        )
    else:
        existing_family_members_registered = 0

    program_course_price_objs = list(
        ProgramCoursePrice.objects.filter(
            course_id=course_id,
            min_registrations__lte=existing_family_members_registered,
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
