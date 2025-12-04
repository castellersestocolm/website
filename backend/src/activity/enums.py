from enum import IntEnum


class ProgramType(IntEnum):
    GENERAL = 10
    ESPLAI = 20
    TEACHING = 30


class ProgramCourseRegistrationStatus(IntEnum):
    REQUESTED = 0
    PROCESSING = 1
    ACTIVE = 2
    EXPIRED = 3
