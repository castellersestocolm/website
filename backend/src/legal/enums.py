import enum


class TeamType(enum.IntEnum):
    BOARD = 10
    TECHNICAL = 20
    MUSICIANS = 30
    COMMISSION = 40


class PermissionLevel(enum.IntEnum):
    NONE = 10
    USER = 20
    ADMIN = 30
    SUPERADMIN = 40
