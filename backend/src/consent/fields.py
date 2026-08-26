from uuid import UUID

from consent.enums import ConsentType


class Consent:
    consent_type: ConsentType
    is_active: bool
    newsletter_id: UUID | None = None

    def __init__(
        self,
        consent_type: ConsentType,
        is_active: bool,
        newsletter_id: UUID | None = None,
    ):
        self.consent_type = consent_type
        self.is_active = is_active
        self.newsletter_id = newsletter_id
