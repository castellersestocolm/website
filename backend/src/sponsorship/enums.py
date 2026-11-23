from enum import IntEnum


class SponsorshipType(IntEnum):
    GENERAL = 10
    EVENT = 20


class SponsorshipStatus(IntEnum):
    DRAFT = 10
    PUBLISHED = 20
    DELETED = 30


class RewardType(IntEnum):
    PRODUCT = 10
    NEWSLETTER = 20


class EntityTierStatus(IntEnum):
    REQUESTED = 10
    ACTIVE = 20
    CANCELLED = 30
    EXPIRED = 40
