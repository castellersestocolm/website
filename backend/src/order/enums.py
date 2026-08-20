from enum import IntEnum

from django.utils.translation import gettext_lazy as _


class OrderStatus(IntEnum):
    CREATED = 10
    REQUESTED = 15
    PROCESSING = 20
    COMPLETED = 30
    CANCELLED = 40
    ABANDONED = 50


OrderStatus.labels = {
    OrderStatus.CREATED: _("Created"),
    OrderStatus.REQUESTED: _("Requested"),
    OrderStatus.PROCESSING: _("Processing"),
    OrderStatus.COMPLETED: _("Completed"),
    OrderStatus.CANCELLED: _("Cancelled"),
    OrderStatus.ABANDONED: _("Abandoned"),
}


class OrderDeliveryType(IntEnum):
    PICK_UP = 10
    IN_PERSON = 20
    DELIVERY = 30


class OrderType(IntEnum):
    PRODUCT = 10
    REGISTRATION = 20
    MEMBERSHIP = 30
