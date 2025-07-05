from enum import IntEnum


class OrderStatus(IntEnum):
    CREATED = 0
    PROCESSING = 1
    COMPLETED = 2
    CANCELLED = 3


class OrderDeliveryType(IntEnum):
    PICK_UP = 10
    IN_PERSON = 20
    POST = 30
