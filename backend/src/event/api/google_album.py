from uuid import UUID

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from event.consts import (
    GOOGLE_PHOTOS_SCOPES,
)
from event.models import (
    Event,
    GoogleAlbum,
)

from integration.models import GoogleIntegration

import logging

_log = logging.getLogger(__name__)


def create_or_update_album(event_id: UUID) -> GoogleAlbum | None:
    event_obj = (
        Event.objects.filter(id=event_id)
        .select_related("location", "google_event")
        .first()
    )

    if not event_obj:
        return None

    google_integration_obj = GoogleIntegration.objects.filter(
        module=event_obj.module
    ).first()

    if not google_integration_obj:
        return None

    try:
        creds = Credentials.from_authorized_user_info(
            info=google_integration_obj.authorized_user_info,
            scopes=GOOGLE_PHOTOS_SCOPES,
        )
        service = build(
            "photoslibrary", "v1", credentials=creds, static_discovery=False
        )

        event_title = f"{event_obj.time_from.strftime('%Y-%m-%d')} - {event_obj.title}"

        if hasattr(event_obj, "google_album"):
            service.albums().patch(
                id=event_obj.google_album.external_id,
                updateMask="title",
                body={"title": event_title},
            ).execute()
        else:
            album = (
                service.albums()
                .create(body={"album": {"title": event_title}})
                .execute()
            )

            GoogleAlbum.objects.create(
                event=event_obj,
                google_integration=google_integration_obj,
                external_id=album["id"],
            )
    except HttpError as e:
        _log.exception(e)


# TODO: Unfortunately Google doesn't support album deletion via API just yet (since 2018...)
def delete_google_album(google_album_id: UUID) -> bool:
    pass
    # google_album_obj = (
    #     GoogleAlbum.objects.filter(id=google_album_id)
    #     .select_related("google_integration")
    #     .first()
    # )
    #
    # if not google_album_obj:
    #     return False
    #
    # try:
    #     creds = Credentials.from_authorized_user_info(
    #         info=google_album_obj.google_integration.authorized_user_info,
    #         scopes=GOOGLE_PHOTOS_SCOPES,
    #     )
    #     service = build("photoslibrary", "v1", credentials=creds, static_discovery=False)
    # except HttpError as e:
    #     _log.exception(e)
    #
    # return True
