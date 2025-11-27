from uuid import UUID

from comunicat.enums import Module
from notify.enums import ContactMessageType
from notify.models import ContactMessage

import notify.tasks


def create(
    entity_id: UUID,
    message_type: ContactMessageType,
    message: str,
    context: dict,
    module: Module,
) -> ContactMessage:
    contact_message_obj = ContactMessage.objects.create(
        entity_id=entity_id,
        type=message_type,
        message=message,
        context=context,
        module=module,
    )

    notify.tasks.send_contact_message_slack.delay(
        message_id=contact_message_obj.id,
    )

    return contact_message_obj
