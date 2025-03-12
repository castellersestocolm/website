from comunicat.enums import Module
from user.enums import FamilyMemberRole, FamilyMemberStatus
from user.models import Family, FamilyMember

import membership.api

from django.conf import settings


def module_data(backend, response, details, user, *args, **kwargs):
    request = response.get("request")
    origin_module = Module.ORG

    if request:
        host = request.headers.get("Host")

        if host:
            if settings.MODULE_ORG_DOMAIN in host:
                origin_module = Module.ORG
            else:
                origin_module = Module.TOWERS

    user.firstname = details.get("first_name", user.firstname)
    user.lastname = details.get("last_name", user.lastname)
    user.origin_module = origin_module

    update_fields = ["firstname", "lastname", "origin_module"]

    # social = user.social_auth.get(provider='google-oauth2')
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

    if not hasattr(user, "family_member"):
        family_obj = Family.objects.create()
        FamilyMember.objects.create(
            user=user,
            family=family_obj,
            role=FamilyMemberRole.MANAGER,
            status=FamilyMemberStatus.ACTIVE,
        )

    membership.api.create_or_update(user_id=user.id, modules=[origin_module])
