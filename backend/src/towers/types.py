from towers.consts import PINYATOR_POSITION_TO_POSITION_TYPE
from towers.enums import PositionType
from user.models import User


class Position:
    name: str
    type: PositionType | None

    external_id: int

    def __init__(self, name: str, external_id: int) -> None:
        self.name = name
        self.type = PINYATOR_POSITION_TO_POSITION_TYPE[name]

        self.external_id = external_id


class Placement:
    x: int
    y: int
    angle: int

    def __init__(self, x: int, y: int, angle: int) -> None:
        self.x = x
        self.y = y
        self.angle = angle


class Size:
    width: int
    height: int

    def __init__(self, width: int, height: int) -> None:
        self.width = width
        self.height = height


class PlaceExtra:
    text: str | None
    height: int | None

    def __init__(self, text: str | None = None, height: int | None = None) -> None:
        self.text = text
        self.height = height


class Responsible:
    user: User | None = None
    extra: PlaceExtra

    def __init__(
        self,
        extra: PlaceExtra,
        user_obj: User | None = None,
    ) -> None:
        self.user_obj = user_obj
        self.extra = extra


class Place:
    user: User | None = None
    position: Position
    placement: Placement
    size: Size
    extra: PlaceExtra

    layer: int
    ring: int

    external_id: int
    external_next_id: int | None = None
    external_link_id: int | None = None

    is_user: bool = False
    is_family: bool = False

    def __init__(
        self,
        position: Position,
        placement: Placement,
        size: Size,
        extra: PlaceExtra,
        layer: int,
        ring: int,
        external_id: int,
        external_next_id: int | None = None,
        external_link_id: int | None = None,
        user_obj: User | None = None,
        is_user: bool = False,
        is_family: bool = False,
    ) -> None:
        self.user = user_obj
        self.position = position
        self.placement = placement
        self.size = size
        self.extra = extra

        self.layer = layer
        self.ring = ring

        self.external_id = external_id
        self.external_next_id = external_next_id
        self.external_link_id = external_link_id

        self.is_user = is_user
        self.is_family = is_family


class Tower:
    name: str
    order: int
    places: list[Place]
    responsible: Responsible | None = None

    external_id: int

    def __init__(
        self,
        name: str,
        order: int,
        is_published: bool,
        places: list[Place],
        external_id: int,
        responsible: Responsible | None = None,
    ) -> None:
        self.name = name
        self.order = order
        self.is_published = is_published
        self.places = places

        self.external_id = external_id

        self.responsible = responsible
