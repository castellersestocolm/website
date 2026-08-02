from enum import IntEnum

from django.utils.translation import gettext_lazy as _


class ProgramType(IntEnum):
    GENERAL = 10
    ESPLAI = 20
    TEACHING = 30


ProgramType.labels = {
    ProgramType.GENERAL: _("General"),
    ProgramType.ESPLAI: _("Camp"),
    ProgramType.TEACHING: _("Teaching"),
}


class ProgramCourseRegistrationStatus(IntEnum):
    REQUESTED = 0
    PROCESSING = 1
    ACTIVE = 2
    EXPIRED = 3


ProgramCourseRegistrationStatus.labels = {
    ProgramCourseRegistrationStatus.REQUESTED: _("Requested"),
    ProgramCourseRegistrationStatus.PROCESSING: _("Processing"),
    ProgramCourseRegistrationStatus.ACTIVE: _("Active"),
    ProgramCourseRegistrationStatus.EXPIRED: _("Expired"),
}
