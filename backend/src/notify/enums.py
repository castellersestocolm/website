import enum


class NotificationType(enum.IntEnum):
    EMAIL = 10


class EmailType(enum.IntEnum):
    REGISTER = 10
    PASSWORD = 11
    WELCOME = 12
    IMPORTED = 13
    FAMILY_INVITE = 20
    EVENT_SIGNUP = 30
    MEMBERSHIP_RENEW = 40
    MEMBERSHIP_EXPIRED = 41
    ORDER_CREATED = 50


class MessageSlackType(enum.IntEnum):
    ORDER_CREATED = 50
