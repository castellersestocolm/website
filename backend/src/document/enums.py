import enum


class DocumentType(enum.IntEnum):
    GENERAL = 10
    GUIDE = 20
    RESOURCE = 30
    PRESS = 40


class DocumentStatus(enum.IntEnum):
    DRAFT = 10
    PUBLISHED = 20
    DELETED = 30
