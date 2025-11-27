import enum


class NotificationType(enum.IntEnum):
    EMAIL = 10


class EmailType(enum.IntEnum):
    GENERAL = 5
    REGISTER = 10
    PASSWORD = 11
    WELCOME = 12
    IMPORTED = 13
    FAMILY_INVITE = 20
    EVENT_SIGNUP = 30
    MEMBERSHIP_RENEW = 40
    MEMBERSHIP_EXPIRED = 41
    MEMBERSHIP_PAID = 42
    MEMBERSHIP_CHECK = 43
    ORDER_CREATED = 50
    ORDER_PAID = 51
    REGISTRATION_PAID = 61


class EmailStatus(enum.IntEnum):
    DRAFT = 10
    SENT = 20


class MessageSlackType(enum.IntEnum):
    ORDER_CREATED = 50
    CONTACT_MESSAGE_CREATED = 60


class ContactMessageType(enum.IntEnum):
    CONTACT = 10
    BUSINESS_WORKSHOP = 20
    BUSINESS_PERFORMANCE = 21


class ContactMessageStatus(enum.IntEnum):
    CREATED = 10
    REPLIED = 20
    DELETED = 30
