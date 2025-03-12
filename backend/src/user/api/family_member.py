import datetime
import uuid
from uuid import UUID

import user.api
from comunicat.enums import Module
from user.enums import FamilyMemberRole, FamilyMemberStatus
from user.models import FamilyMember, User, Family
from user.utils import get_default_consent_pictures

import membership.api


def create(
    user_id: UUID,
    firstname: str,
    lastname: str,
    birthday: datetime.date,
    consent_pictures: bool,
    module: Module,
    towers: dict | None,
    organisation: dict | None,
    role: FamilyMemberRole = FamilyMemberRole.MEMBER,
    status: FamilyMemberStatus = FamilyMemberStatus.REQUESTED,
) -> FamilyMember | None:
    user_obj = User.objects.filter(id=user_id).select_related("family_member").first()

    # TODO: Max members per family, max adults per family

    if (
        not user_obj
        or hasattr(user_obj, "family_member")
        and user_obj.family_member.role != FamilyMemberRole.MANAGER
    ):
        return None

    if hasattr(user_obj, "family_member"):
        family_obj = user_obj.family_member.family
    else:
        family_obj = Family.objects.create()
        FamilyMember.objects.create(
            user=user_obj,
            family=family_obj,
            role=FamilyMemberRole.MANAGER,
            status=FamilyMemberStatus.ACTIVE,
        )

    user_email = user_obj.email.split("@")
    new_user_email = f"{user_email[0]}+{str(uuid.uuid4())}@{user_email[-1]}"
    new_user_obj = user.api.create(
        firstname=firstname,
        lastname=lastname,
        email=new_user_email,
        phone=user_obj.phone,
        password=None,
        birthday=birthday,
        consent_pictures=consent_pictures,
        towers=towers,
        organisation=organisation,
        module=module,
        with_family=False,
    )

    family_member_obj = FamilyMember.objects.create(
        user=new_user_obj, family=family_obj, role=role, status=status
    )

    # Add the user to the existing membership
    membership.api.create_or_update(
        user_id=new_user_obj.id, modules=[module], family_id=family_obj.id
    )

    return family_member_obj


def update(
    id: UUID,
    user_id: UUID,
    firstname: str,
    lastname: str,
    birthday: datetime.date,
    consent_pictures: bool,
    towers: dict | None,
    organisation: dict | None,
) -> FamilyMember | None:
    user_obj = User.objects.filter(id=user_id).select_related("family_member").first()

    if (
        not user_obj
        or not user_obj.family_member
        or not user_obj.family_member.role == FamilyMemberRole.MANAGER
    ):
        return None

    family_obj = user_obj.family_member.family
    family_member_obj = (
        FamilyMember.objects.filter(id=id, family=family_obj)
        .select_related("user", "user__towers")
        .first()
    )

    if not family_member_obj or family_member_obj.user.can_manage:
        return None

    consent_pictures |= get_default_consent_pictures(birthday=birthday)

    family_member_obj.user.firstname = firstname
    family_member_obj.user.lastname = lastname
    family_member_obj.user.birthday = birthday
    family_member_obj.user.consent_pictures = consent_pictures
    family_member_obj.user.save(
        update_fields=("firstname", "lastname", "birthday", "consent_pictures")
    )

    family_member_obj.user.towers.height_shoulders = towers.get("height_shoulders")
    family_member_obj.user.towers.height_arms = towers.get("height_arms")
    family_member_obj.user.towers.save(update_fields=("height_shoulders", "height_arms"))

    return family_member_obj


def delete(id: UUID, user_id: UUID) -> bool:
    user_obj = User.objects.filter(id=user_id).select_related("family_member").first()

    if (
        not user_obj
        or not user_obj.family_member
        or not user_obj.family_member.role == FamilyMemberRole.MANAGER
    ):
        return False

    family_member_obj = (
        FamilyMember.objects.filter(id=id, family=user_obj.family_member.family)
        .exclude(role=FamilyMemberRole.MANAGER)
        .exclude(status=FamilyMemberStatus.DELETED)
        .first()
    )

    if not family_member_obj:
        return False

    family_member_obj.status = FamilyMemberStatus.DELETED
    family_member_obj.save(update_fields=("status",))

    return True
