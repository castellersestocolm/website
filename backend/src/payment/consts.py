from django.conf import settings
from django.utils.translation import gettext_lazy as _

from comunicat.enums import Module
from payment.enums import PaymentMethod

EDIT_DISTANCE_NAME_THRESHOLD = 0.7
EDIT_DISTANCE_ACCOUNT_THRESHOLD = 0.3

PAYMENT_LINE_CONTENT_TYPES = (
    ("activity", "programcourseregistration"),
    ("membership", "membershipmodule"),
    ("order", "orderdelivery"),
    ("order", "orderproduct"),
    ("order", "orderregistration"),
    ("order", "orderdelivery"),
    ("event", "registration"),
)

GOOGLE_DRIVE_BY_MODULE = {
    module: getattr(settings, f"MODULE_{Module(module).name}_GOOGLE_DRIVE")["payment"]
    for module in Module
}

PAYMENT_METHOD_FIELDS = {
    PaymentMethod.CASH: None,
    PaymentMethod.TRANSFER: (
        "bank",
        "iban",
    ),
    PaymentMethod.CARD: None,
    PaymentMethod.PAYPAL: None,
    # TODO SWISH: Verify phone on save entity payment details
    PaymentMethod.SE_SWISH: ("phone",),
    PaymentMethod.SE_PLUSGIRO: ("account",),
    PaymentMethod.SE_BANKGIRO: ("account",),
    PaymentMethod.SE_TRANSFER: ("bank", "clearing", "account"),
}

PAYMENT_METHOD_FIELD_LABELS = {
    "iban": _("IBAN"),
    "bank": _("Bank"),
    "account": _("Account number"),
    "clearing": _("Clearing number"),
    "phone": _("Phone"),
}

PAYMENT_METHOD_REQUIRE_SOURCE = (PaymentMethod.SUMUP, PaymentMethod.SE_SWISH)
PAYMENT_CODE_REQUIRE_SOURCE = ("SUMUP", "SE_SWISH")

PAYMENT_PROVIDER_CLASS_BY_CODE = {
    "PAYPAL": ("paypal", "PaymentProviderPaypal"),
    "SUMUP": ("sumup", "PaymentProviderSumUp"),
    "TRANSFER": ("transfer", "PaymentProviderTransfer"),
    "SE_SWISH": ("se_swish", "PaymentProviderSESwish"),
}
