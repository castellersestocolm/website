from comunicat.enums import Module
from event.enums import RegistrationStatus, EventType
from legal.enums import TeamType

from django.utils.translation import gettext_lazy as _


def get_registration_initial_status(require_approve: bool) -> RegistrationStatus:
    if require_approve:
        return RegistrationStatus.REQUESTED
    return RegistrationStatus.ACTIVE


# TODO: Move this somewhere else
def get_event_name(
    event_title: str,
    event_type: EventType,
    modules: list[tuple[Module, TeamType]] | None = None,
) -> str:
    if event_type == EventType.REHEARSAL:
        if (Module.TOWERS, None) in modules and (
            Module.TOWERS,
            TeamType.MUSICIANS,
        ) in modules:
            return str(_("Rehearsal with musicians"))
        elif (Module.TOWERS, None) in modules:
            return str(_("Rehearsal"))
        elif (Module.TOWERS, TeamType.MUSICIANS) in modules:
            return str(_("Musicians rehearsal"))
    return event_title
