from comunicat.enums import Module
from comunicat.utils.request import get_module_from_request
from user.enums import FamilyMemberRole, FamilyMemberStatus
from user.models import Family, FamilyMember

import membership.api

from django.conf import settings


def module_data(backend, response, details, user, *args, **kwargs):
    request = response.get("request")

    # TODO: Fix this, for now set it from TOWERS
    origin_module = get_module_from_request(request=request) or Module.TOWERS

    user.firstname = user.firstname or details.get("first_name", user.firstname)
    user.lastname = user.lastname or details.get("last_name", user.lastname)
    user.origin_module = origin_module

    update_fields = ["firstname", "lastname", "origin_module"]

    # social = user.social_auth.get(provider='integration-oauth2')
    # response = requests.get(
    #     'https://people.googleapis.com/v1/people/me?personFields=birthdays,phoneNumbers',
    #     params={'access_token': social.extra_data['access_token']}
    # )
    # people_response = response.json()
    # user_birthdays = people_response.get("birthdays", [])
    # for user_birthday in user_birthdays:
    #     if user_birthday.get("metadata", {}).get("primary", False) and "date" in user_birthday:
    #         user_birthday_date = user_birthday["date"]
    #         if "year" in user_birthday_date and "month" in user_birthday_date and "date" in user_birthday_date:
    #             user.birthday = datetime.date(year=user_birthday_date["year"], month=user_birthday_date["month"], day=user_birthday_date["day"])
    #             update_fields += ["birthday"]
    #             break

    user.save(update_fields=update_fields)

    if hasattr(user, "family_member"):
        family_id = user.family_member.family_id
    else:
        family_obj = Family.objects.create()
        family_id = family_obj.id
        FamilyMember.objects.create(
            user=user,
            family=family_obj,
            role=FamilyMemberRole.MANAGER,
            status=FamilyMemberStatus.ACTIVE,
        )

    membership.api.create_or_update(user_id=user.id, modules=[origin_module])
