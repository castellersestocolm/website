from enum import IntEnum


class FamilyMemberRole(IntEnum):
    MEMBER = 10
    MANAGER = 20


class FamilyMemberStatus(IntEnum):
    REQUESTED = 10
    ACTIVE = 20
    DELETED = 30


class FamilyMemberRequestStatus(IntEnum):
    REQUESTED = 10
    ACCEPTED = 20
    DELETED = 30
    REJECTED = 40


class UserProductSource(IntEnum):
    OWNED = 10
    FROM_ORDER = 20
