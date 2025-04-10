from uuid import UUID

from django.db.models import Prefetch
from django.utils import timezone

from comunicat.enums import Module
from event.enums import EventType, RegistrationStatus
from event.models import Event, AgendaItem, Registration
from user.models import User

from django.db import connections, transaction


def select_table(table_name: str) -> tuple[tuple]:
    cursor = connections["pinyator"].cursor()

    cursor.execute("SELECT * FROM CASTELLER")
    results = cursor.fetchall()

    cursor.close()

    return results


@transaction.atomic
def update_or_create_user(user_id: UUID) -> None:
    user_obj = (
        User.objects.with_has_active_membership(modules=[Module.TOWERS])
        .filter(id=user_id)
        .select_related("towers")
        .first()
    )

    if not user_obj or not hasattr(user_obj, "towers"):
        return

    cursor = connections["pinyator"].cursor()

    user_status = 1 if user_obj.has_active_membership else 0

    exists = cursor.execute(f"SELECT * FROM CASTELLER WHERE Codi='{user_obj.id}'") > 0

    if exists:
        cursor.execute(
            f"UPDATE CASTELLER SET MalNom='{user_obj.towers.alias}', Altura={user_obj.towers.height_shoulders or 0}, ALTURA_TRONCS={user_obj.towers.height_arms or 0}, Nom='{user_obj.firstname}', Cognom_1='{user_obj.lastname}', Cognom_2='', Estat={user_status} WHERE Codi='{user_obj.id}'"
        )
    else:
        cursor.execute(
            f"INSERT INTO CASTELLER (MalNom, Altura, ALTURA_TRONCS, POSICIO_PINYA_ID, Nom, Cognom_1, Cognom_2, Codi, Familia_ID, Estat) VALUES ('{user_obj.towers.alias}', {user_obj.towers.height_shoulders or 0}, {user_obj.towers.height_arms or 0}, 0, '{user_obj.firstname}', '{user_obj.lastname}', '', '{user_obj.id}', 0, {user_status})"
        )

    cursor.close()


@transaction.atomic
def update_or_create_event(event_id: UUID) -> None:
    event_obj = (
        Event.objects.filter(id=event_id)
        .select_related("location")
        .prefetch_related(
            Prefetch(
                "agenda_items",
                (AgendaItem.objects.order_by("time_from")),
            ),
        )
        .first()
    )

    if not event_obj or event_obj.type not in (
        EventType.REHEARSAL,
        EventType.PERFORMANCE,
    ):
        return

    cursor = connections["pinyator"].cursor()

    if event_obj.type == EventType.REHEARSAL and event_obj.location:
        event_title = f"{event_obj.title} - {event_obj.location.name}"
    else:
        event_title = event_obj.title
    event_time_from = timezone.localtime(event_obj.time_from).strftime(
        "%Y-%m-%d %H:%M:%S"
    )
    event_season = timezone.localtime(event_obj.time_from).strftime("%Y")
    event_type = 1 if event_obj.type == EventType.PERFORMANCE else 0
    event_status = 1
    agenda = "\n\n".join(
        [
            f"{timezone.localtime(agenda_item_obj.time_from).strftime('%H:%M')} — {agenda_item_obj.name}\n{agenda_item_obj.description}"
            for agenda_item_obj in event_obj.agenda_items.all()
        ]
    )

    exists = (
        cursor.execute(f"SELECT EVENT_ID FROM EVENT WHERE Codi='{event_obj.id}'") > 0
    )

    if exists:
        cursor.execute(
            f"UPDATE EVENT SET Nom='{event_title}', Data='{event_time_from}', Tipus={event_type}, Estat={event_status}, TEMPORADA='{event_season}', OBSERVACIONS='{agenda}' WHERE Data='{event_time_from}'"
        )
    else:
        cursor.execute(
            f"INSERT INTO EVENT (Nom, Data, Tipus, Estat, Codi, TEMPORADA, OBSERVACIONS) VALUES ('{event_title}', '{event_time_from}', {event_type}, {event_status}, '{event_obj.id}', '{event_season}', '{agenda}')"
        )

    cursor.close()


@transaction.atomic
def update_or_create_registration(registration_id: UUID) -> None:
    registration_obj = (
        Registration.objects.filter(id=registration_id)
        .select_related("event", "user")
        .first()
    )

    if not registration_obj:
        return

    cursor = connections["pinyator"].cursor()

    event_updated_at = timezone.localtime(registration_obj.updated_at).strftime(
        "%Y-%m-%d %H:%M:%S"
    )
    registration_status = (
        1 if registration_obj.status == RegistrationStatus.ACTIVE else 0
    )

    exists_event = (
        cursor.execute(
            f"SELECT Event_ID FROM EVENT WHERE Codi='{registration_obj.event.id}' LIMIT 1"
        )
        > 0
    )

    if not exists_event:
        return

    pinyator_event_id = cursor.fetchone()[0]

    exists_user = (
        cursor.execute(
            f"SELECT Casteller_ID FROM CASTELLER WHERE Codi='{registration_obj.user.id}' LIMIT 1"
        )
        > 0
    )

    if not exists_user:
        return

    pinyator_user_id = cursor.fetchone()[0]

    exists = (
        cursor.execute(
            f"SELECT * FROM INSCRITS WHERE Event_ID='{pinyator_event_id}' AND Casteller_ID='{pinyator_user_id}'"
        )
        > 0
    )

    if exists:
        cursor.execute(
            f"UPDATE INSCRITS SET Estat={registration_status} WHERE Event_ID='{pinyator_event_id}' AND Casteller_ID='{pinyator_user_id}'"
        )
    else:
        cursor.execute(
            f"INSERT INTO INSCRITS (Event_ID, Casteller_ID, Estat, Codi, ACOMPANYANTS, DATA_VINC, DATA_NOVINC) VALUES ('{pinyator_event_id}', '{pinyator_user_id}', {registration_status}, '{registration_obj.id}', 0, '{event_updated_at}', '{event_updated_at}')"
        )

    cursor.close()
