from towers.enums import PositionType

import pinyator.api
from user.models import User


def get_positions() -> list[dict]:
    position_stats = []

    user_by_id = {str(user_obj.id): user_obj for user_obj in User.objects.all()}

    for position_type in PositionType:
        position_user_stats = pinyator.api.get_stats_for_position(
            position_type=position_type
        )
        if position_user_stats:
            position_stats.append(
                {
                    "type": position_type.value,
                    "users": sorted(
                        [
                            {"user": user_by_id[user_id], "times": times}
                            for user_id, times in position_user_stats
                            if user_id in user_by_id
                        ],
                        key=lambda pu: -pu["times"],
                    ),
                }
            )

    return position_stats
