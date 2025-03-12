import enum


class EventType(enum.IntEnum):
    GENERAL = 10
    INTERNAL = 20
    TALK = 30
    GATHERING = 40
    REHEARSAL = 50
    PERFORMANCE = 60


class EventStatus(enum.IntEnum):
    DRAFT = 10
    PUBLISHED = 20
    CANCELLED = 30


class EventRequirementType(enum.IntEnum):
    TO_BRING = 10


class RegistrationStatus(enum.IntEnum):
    REQUESTED = 10
    ACTIVE = 20
    CANCELLED = 30
    TENTATIVE = 40


class TransportMode(enum.IntEnum):
    BUS = 10
    TROLLEYBUS = 20
    TRAM = 30
    METRO = 40
    RAIL = 50
    WATER = 60
    FERRY = 70
