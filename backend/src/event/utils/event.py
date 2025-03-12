from event.enums import RegistrationStatus


def get_registration_initial_status(require_approve: bool) -> RegistrationStatus:
    if require_approve:
        return RegistrationStatus.REQUESTED
    return RegistrationStatus.ACTIVE
