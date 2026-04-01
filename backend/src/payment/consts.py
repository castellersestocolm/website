from django.conf import settings

from payment.enums import PaymentMethod

from django.utils.translation import gettext_lazy as _


EDIT_DISTANCE_NAME_THRESHOLD = 0.7
EDIT_DISTANCE_ACCOUNT_THRESHOLD = 0.3

PAYMENT_LINE_CONTENT_TYPES = (
    ("activity", "programcourseregistration"),
    ("membership", "membershipmodule"),
    ("order", "orderdelivery"),
    ("order", "orderproduct"),
    ("event", "registration"),
)

GOOGLE_DRIVE_ID = settings.MODULE_ALL_GOOGLE_DRIVE["payment"]["drive_id"]
GOOGLE_DRIVE_FOLDER_ID = settings.MODULE_ALL_GOOGLE_DRIVE["payment"]["folder_id"]

PAYMENT_METHOD_FIELDS = {
    PaymentMethod.CASH: None,
    PaymentMethod.TRANSFER: (
        "bank",
        "iban",
    ),
    PaymentMethod.CARD: None,
    PaymentMethod.PAYPAL: None,
    PaymentMethod.SE_SWISH: None,
    PaymentMethod.SE_PLUSGIRO: ("account",),
    PaymentMethod.SE_BANKGIRO: ("account",),
    PaymentMethod.SE_TRANSFER: ("bank", "clearing", "account"),
}

PAYMENT_METHOD_FIELD_LABELS = {
    "iban": _("IBAN"),
    "bank": _("Bank"),
    "account": _("Account number"),
    "clearing": _("Clearing number"),
}
