from towers.consts import PINYATOR_POSITION_TO_POSITION_TYPE
from towers.enums import PositionType


class Position:
    name: str
    type: PositionType | None

    external_id: int

    def __init__(self, name: str, external_id: int) -> None:
        self.name = name
        self.type = PINYATOR_POSITION_TO_POSITION_TYPE[name]

        self.external_id = external_id


class Place:
    user_id: str
    position: Position

    external_id: int

    def __init__(self, user_id: str, position: Position, external_id: int) -> None:
        self.user_id = user_id
        self.position = position

        self.external_id = external_id


class Tower:
    name: str
    order: int
    places: list[Place]

    external_id: int

    def __init__(
        self,
        name: str,
        order: int,
        is_published: bool,
        places: list[Place],
        external_id: int,
    ) -> None:
        self.name = name
        self.order = order
        self.is_published = is_published
        self.places = places

        self.external_id = external_id
