from towers.enums import PositionType


PINYATOR_POSITION_TO_POSITION_TYPE = {
    "Primers": PositionType.PRIMER,
    "Tronqueti": None,
    "Vent": PositionType.VENT,
    "Lateral": PositionType.LATERAL,
    "Crosa": PositionType.CROSSA,
    "Contrafort": PositionType.CONTRAFORT,
    "Agulla": PositionType.AGULLA,
    "1Baixos": PositionType.BAIX,
    "Altres": None,
    "Gralles": None,
    "Canalla": None,
    "Tap": PositionType.TAP,
    "Crosa Folre": PositionType.CROSSA,
    "Contrafort Folre": PositionType.CONTRAFORT,
    "Agulla Folre": PositionType.AGULLA,
    "Portacrosses": None,
    "3TerÃ§os": PositionType.TRONC_TERC,
    "4Quarts": PositionType.TRONC_QUART,
    "5Quints": PositionType.TRONC_QUINT,
    "2Segons": PositionType.TRONC_SEGON,
    "6Sisens": PositionType.TRONC_SISE,
    "Soca": None,
    "Crossanet": PositionType.CROSSA,
    "Lateral Folre": PositionType.LATERAL,
    "Vent Folre": PositionType.VENT,
    "Primers Folre": PositionType.PRIMER,
    "Ultim Cordo": PositionType.CORDO,
    "Novelles": None,
}

POSITION_TYPE_TO_PINYATOR_POSITIONS = {
    position_type: [
        pp
        for pp, pt in PINYATOR_POSITION_TO_POSITION_TYPE.items()
        if pt == position_type
    ]
    for position_type in PositionType
}
