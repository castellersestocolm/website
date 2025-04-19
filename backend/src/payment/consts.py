from django.conf import settings


EDIT_DISTANCE_NAME_THRESHOLD = 0.7
EDIT_DISTANCE_ACCOUNT_THRESHOLD = 0.3

GOOGLE_DRIVE_SCOPES = [
    "https://www.googleapis.com/auth/drive.metadata.readonly",
    "https://www.googleapis.com/auth/drive.file",
]

GOOGLE_DRIVE_ID = settings.MODULE_ALL_GOOGLE_DRIVE_ID

GOOGLE_DRIVE_FILES_LIST = {
    "driveId": GOOGLE_DRIVE_ID,
    "includeItemsFromAllDrives": True,
    "corpora": "drive",
    "supportsAllDrives": True,
}
