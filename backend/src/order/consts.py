from order.enums import OrderStatus
from payment.enums import PaymentMethod

ORDER_CLEAN_STATUS_CREATED_HOURS = 1
ORDER_CLEAN_STATUS_PROCESSING_HOURS = 24 * 30 * 6

ORDER_ADMIN_SHOW_ABANDONED_HOURS = 24 * 7

ORDER_STATUS_ACTIVE = (
    OrderStatus.REQUESTED,
    OrderStatus.PROCESSING,
    OrderStatus.COMPLETED,
)

ORDER_STATUS_DELETED = (
    OrderStatus.CANCELLED,
    OrderStatus.ABANDONED,
)

ORDER_COMPLETE_PAYMENT_METHODS = (PaymentMethod.SE_SWISH,)
