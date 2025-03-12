from event.enums import RegistrationStatus

GOOGLE_CALENDAR_SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events",
]

REGISTRATION_STATUS_TO_GOOGLE_RESPONSE_STATUS = {
    RegistrationStatus.REQUESTED: "needsAction",
    RegistrationStatus.ACTIVE: "accepted",
    RegistrationStatus.CANCELLED: "declined",
    RegistrationStatus.TENTATIVE: "tentative",
}

GOOGLE_RESPONSE_STATUS_TO_REGISTRATION_STATUS = {
    v: k for k, v in REGISTRATION_STATUS_TO_GOOGLE_RESPONSE_STATUS.items()
}
