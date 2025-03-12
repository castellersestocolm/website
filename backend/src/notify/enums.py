import enum


class NotificationType(enum.IntEnum):
    EMAIL = 10


class EmailType(enum.IntEnum):
    REGISTER = 10
    PASSWORD = 11
    WELCOME = 12
    FAMILY_INVITE = 20
