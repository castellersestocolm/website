import re
import unicodedata

from event.enums import EventType


# TODO: Allow to configure this, perhaps distance too or by calendar default
def get_event_type_by_title(title: str) -> EventType:
    title = unicodedata.normalize("NFKD", re.sub(r"[^\w\s]", "", title)).lower()

    if any([t in title for t in ("rehearsal", "assaig", "repetition")]):
        return EventType.REHEARSAL

    if any([t in title for t in ("performance", "actuacio", "uppvisning")]):
        return EventType.PERFORMANCE

    return EventType.GENERAL
