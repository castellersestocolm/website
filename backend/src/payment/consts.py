from django.conf import settings


EDIT_DISTANCE_NAME_THRESHOLD = 0.7
EDIT_DISTANCE_ACCOUNT_THRESHOLD = 0.3

GOOGLE_DRIVE_SCOPES = [
    "https://www.googleapis.com/auth/drive.metadata.readonly",
    "https://www.googleapis.com/auth/drive.file",
]

GOOGLE_DRIVE_ID = "0ANefqEg5Czl3Uk9PVA"

GOOGLE_DRIVE_FILES_LIST = {
    "driveId": "0ANefqEg5Czl3Uk9PVA",
    "includeItemsFromAllDrives": True,
    "corpora": "drive",
    "supportsAllDrives": True,
}
