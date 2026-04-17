import enum

from django.utils.translation import gettext_lazy as _


class EventType(enum.IntEnum):
    GENERAL = 10
    INTERNAL = 20
    TALK = 30
    GATHERING = 40
    REHEARSAL = 50
    PERFORMANCE = 60
    COURSE = 70
    WORKSHOP = 80


class EventStatus(enum.IntEnum):
    DRAFT = 10
    PUBLISHED = 20
    CANCELLED = 30


class EventQuestionType(enum.IntEnum):
    SHORT = 10
    LONG = 20
    BOOLEAN = 30
    CHOICE = 40


class EventRequirementType(enum.IntEnum):
    TO_BRING = 10


class RegistrationStatus(enum.IntEnum):
    REQUESTED = 10
    ACTIVE = 20
    CANCELLED = 30
    TENTATIVE = 40


RegistrationStatus.labels = {
    RegistrationStatus.REQUESTED: _("Requested"),
    RegistrationStatus.ACTIVE: _("Active"),
    RegistrationStatus.CANCELLED: _("Cancelled"),
    RegistrationStatus.TENTATIVE: _("Tentative"),
}


class TransportMode(enum.IntEnum):
    BUS = 10
    TROLLEYBUS = 20
    TRAM = 30
    METRO = 40
    RAIL = 50
    WATER = 60
    FERRY = 70
