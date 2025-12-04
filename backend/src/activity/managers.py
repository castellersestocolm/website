from django.db.models import (
    QuerySet,
    F,
)
from django.utils import translation


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
