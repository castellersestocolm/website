import enum


class MembershipStatus(enum.IntEnum):
    REQUESTED = 0
    PROCESSING = 1
    ACTIVE = 2
    EXPIRED = 3
