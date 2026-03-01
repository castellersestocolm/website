from comunicat.enums import Module
from comunicat.rest.utils.translation import get_translated_string
from event.enums import RegistrationStatus, EventType
from legal.enums import TeamType


def get_registration_initial_status(require_approve: bool) -> RegistrationStatus:
    if require_approve:
        return RegistrationStatus.REQUESTED
    return RegistrationStatus.ACTIVE


# TODO: Move this somewhere else
def get_event_title(
    event_title: dict[str, str],
    event_type: EventType,
    modules: list[tuple[Module, TeamType]] | None = None,
) -> dict[str, str]:
    if event_type == EventType.REHEARSAL:
        if (Module.TOWERS, None) in modules and (
            Module.TOWERS,
            TeamType.MUSICIANS,
        ) in modules:
            return get_translated_string(text="Rehearsal with musicians")
        elif (Module.TOWERS, None) in modules:
            return get_translated_string(text="Rehearsal")
        elif (Module.TOWERS, TeamType.MUSICIANS) in modules:
            return get_translated_string(text="Musicians rehearsal")
    return event_title
