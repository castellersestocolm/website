from uuid import UUID

from user.models import User


def get(id: UUID) -> User:
    return User.objects.filter(id=id).first()
