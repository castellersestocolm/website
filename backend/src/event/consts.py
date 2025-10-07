from event.enums import RegistrationStatus

GOOGLE_CALENDAR_SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events",
]

GOOGLE_PHOTOS_SCOPES = [
    "https://www.googleapis.com/auth/photoslibrary.appendonly",
    "https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata",
    "https://www.googleapis.com/auth/photoslibrary.edit.appcreateddata"
]

REGISTRATION_STATUS_TO_GOOGLE_RESPONSE_STATUS = {
    RegistrationStatus.REQUESTED: "needsAction",
    RegistrationStatus.ACTIVE: "accepted",
    RegistrationStatus.CANCELLED: "declined",
    RegistrationStatus.TENTATIVE: "declined",
    # RegistrationStatus.TENTATIVE: "tentative",
}

GOOGLE_RESPONSE_STATUS_TO_REGISTRATION_STATUS = {
    "needsAction": None,
    "accepted": RegistrationStatus.ACTIVE,
    "declined": RegistrationStatus.CANCELLED,
    "tentative": RegistrationStatus.CANCELLED,
}

# GOOGLE_RESPONSE_STATUS_TO_REGISTRATION_STATUS = {
#     v: k for k, v in REGISTRATION_STATUS_TO_GOOGLE_RESPONSE_STATUS.items()
# }
