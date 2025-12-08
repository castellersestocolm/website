from django.conf import settings


EDIT_DISTANCE_NAME_THRESHOLD = 0.7
EDIT_DISTANCE_ACCOUNT_THRESHOLD = 0.3

PAYMENT_LINE_CONTENT_TYPES = (
    ("activity", "programcourseregistration"),
    ("membership", "membershipmodule"),
    ("order", "orderproduct"),
    ("event", "registration"),
)

GOOGLE_DRIVE_ID = settings.MODULE_ALL_GOOGLE_DRIVE["payment"]["drive_id"]
GOOGLE_DRIVE_FOLDER_ID = settings.MODULE_ALL_GOOGLE_DRIVE["payment"]["folder_id"]
