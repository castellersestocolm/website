from enum import IntEnum


class OrderStatus(IntEnum):
    CREATED = 10
    PROCESSING = 20
    COMPLETED = 30
    CANCELLED = 40
    ABANDONED = 50


class OrderDeliveryType(IntEnum):
    PICK_UP = 10
    IN_PERSON = 20
    DELIVERY = 30
