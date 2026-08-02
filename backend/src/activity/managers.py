from django.apps import apps
from django.contrib.postgres.aggregates import StringAgg
from django.db.models import CharField, F, OuterRef, Q, QuerySet, Subquery
from django.db.models.functions import Coalesce
from django.utils import translation

from user.enums import FamilyMemberRole, FamilyMemberStatus


class ProgramQuerySet(QuerySet):
    def with_name(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            name_locale=F(f"name__{locale}"),
        )

    def with_description(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            description_locale=F(f"description__{locale}"),
        )


class ProgramCourseQuerySet(QuerySet):
    def with_program_name(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            program_name_locale=F(f"program__name__{locale}"),
        )

    def with_program_description(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            program_description_locale=F(f"program__description__{locale}"),
        )


class ProgramCourseRegistrationQuerySet(QuerySet):
    def filter_with_user(self):
        return self.filter(entity__user__isnull=False)

    def with_course_program_name(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            course_program_name_locale=F(f"course__program__name__{locale}"),
        )

    def with_course_program_description(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            course_program_description_locale=F(
                f"course__program__description__{locale}"
            ),
        )

    def with_family_name(self):
        Family = apps.get_model("user", "Family")

        return self.annotate(
            family_name=Coalesce(
                Subquery(
                    Family.objects.filter(
                        id=OuterRef("entity__user__family_member__family_id")
                    )
                    .annotate(
                        family_name=StringAgg(
                            "members__user__lastname",
                            filter=Q(
                                members__status=FamilyMemberStatus.ACTIVE,
                                members__role=FamilyMemberRole.MANAGER,
                            ),
                            delimiter="-",
                            order_by="members__user__lastname",
                        )
                    )
                    .values("family_name")[:1]
                ),
                F("entity__lastname"),
                output_field=CharField(),
            )
        )
