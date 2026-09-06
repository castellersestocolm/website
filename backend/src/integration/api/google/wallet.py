import datetime
import logging
from uuid import UUID

from django.conf import settings
from django.db.models import Prefetch
from django.utils import timezone
from google.auth import crypt, jwt
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import Resource, build

from comunicat.consts import (
    FILE_HERO_BY_MODULE,
    FILE_LOGO_BY_MODULE,
    NAME_BY_MODULE,
    PALETTE_BY_MODULE,
)
from comunicat.enums import Module
from comunicat.template_tags.comunicat_tags import full_url
from integration.consts import GOOGLE_WALLET_SCOPES
from membership.enums import MembershipStatus

_log = logging.getLogger(__name__)


# https://github.com/google-wallet/rest-samples/blob/main/python/demo_loyalty.py
class GoogleWalletLoyalty:
    key_file_path: str
    credentials: Credentials
    client: Resource

    def __init__(self, user_id: UUID, module: Module | None):
        self.key_file_path = f"{settings.INTEGRATION_GOOGLE_CRED_DIR}app.json"
        self.auth()

        from membership.models import Membership, MembershipModule
        from user.models import User

        self.user_obj = (
            User.objects.filter(id=user_id).with_has_active_membership().first()
        )

        if not self.user_obj or not self.user_obj.membership_id:
            return

        self.membership_obj = (
            Membership.objects.filter(id=self.user_obj.membership_id)
            .prefetch_related(
                Prefetch(
                    "modules",
                    MembershipModule.objects.filter(
                        status=MembershipStatus.ACTIVE
                    ).order_by("module"),
                    to_attr="all_modules",
                )
            )
            .first()
        )

        if (
            not self.membership_obj
            or self.membership_obj.status != MembershipStatus.ACTIVE
        ):
            return

        self.membership_start = timezone.make_aware(
            datetime.datetime.combine(
                self.membership_obj.date_from, datetime.time(0, 0, 0)
            )
        ).isoformat()
        self.membership_end = timezone.make_aware(
            datetime.datetime.combine(
                self.membership_obj.date_to, datetime.time(23, 59, 59)
            )
        ).isoformat()

        modules = [
            membership_module_obj.module
            for membership_module_obj in self.membership_obj.all_modules
        ]

        self.module = (
            module if module and module in modules else settings.MODULE_DEFAULT
        )

    def auth(self):
        self.credentials = Credentials.from_service_account_file(
            self.key_file_path, scopes=GOOGLE_WALLET_SCOPES
        )

        self.client = build("walletobjects", "v1", credentials=self.credentials)

    # https://developers.google.com/wallet/retail/loyalty-cards/rest/v1/loyaltyclass
    def get_class(self) -> dict:

        name = NAME_BY_MODULE[self.module]
        file_logo = full_url(
            path=FILE_LOGO_BY_MODULE[self.module],
            module=self.module,
        )
        file_hero = (
            full_url(
                path=FILE_HERO_BY_MODULE[self.module],
                module=self.module,
            )
            if FILE_HERO_BY_MODULE[self.module]
            else None
        )
        palette_colour = PALETTE_BY_MODULE[self.module]["primary"]["light"]
        url_homepage = full_url(module=self.module)
        url_calendar = full_url(path="calendar", module=self.module)
        url_dashboard = full_url(path="user/dashboard", module=self.module)

        new_class = {
            "id": f"{settings.INTEGRATION_GOOGLE_WALLET_ISSUER_ID}.loyalty.{Module(self.module).name.lower()}",
            "issuerName": name,
            "reviewStatus": "UNDER_REVIEW",
            "localizedProgramName": {
                "defaultValue": {"language": "ca", "value": "Membre"},
                "translatedValues": [
                    {"language": "en-GB", "value": "Member"},
                    {"language": "sv", "value": "Medlem"},
                ],
            },
            "programLogo": {"sourceUri": {"uri": file_logo}},
            "hexBackgroundColor": palette_colour,
            **({"heroImage": {"sourceUri": {"uri": file_hero}}} if file_hero else {}),
            "homepageUri": {
                "uri": url_homepage,
                "localizedDescription": {
                    "defaultValue": {"language": "ca", "value": "Pàgina web"},
                    "translatedValues": [
                        {"language": "en-GB", "value": "Website"},
                        {"language": "sv", "value": "Hemsida"},
                    ],
                },
            },
            "linksModuleData": {
                "uris": [
                    {
                        "uri": url_dashboard,
                        "localizedDescription": {
                            "defaultValue": {
                                "language": "ca",
                                "value": "Panell d'usuari",
                            },
                            "translatedValues": [
                                {"language": "en-GB", "value": "Dashboard"},
                                {"language": "sv", "value": "Användarpanel"},
                            ],
                        },
                    },
                    {
                        "uri": url_calendar,
                        "localizedDescription": {
                            "defaultValue": {"language": "ca", "value": "Calendari"},
                            "translatedValues": [
                                {"language": "en-GB", "value": "Calendar"},
                                {"language": "sv", "value": "Kalender"},
                            ],
                        },
                    },
                ]
            },
        }

        return new_class

    def get_object(self) -> dict | None:

        new_object = {
            "id": f"{settings.INTEGRATION_GOOGLE_WALLET_ISSUER_ID}.loyalty.{Module(self.module).name.lower()}.{self.user_obj.membership_number}",
            "classId": f"{settings.INTEGRATION_GOOGLE_WALLET_ISSUER_ID}.loyalty.{Module(self.module).name.lower()}",
            "state": "ACTIVE" if self.membership_obj.is_active else "EXPIRED",
            "barcode": {"type": "QR_CODE", "value": self.user_obj.membership_number},
            "accountId": self.user_obj.membership_number,
            "accountName": self.user_obj.name,
            "validTimeInterval": {
                "start": {"date": self.membership_start},
                "end": {"date": self.membership_end},
            },
            # "messages": [
            #     {
            #         "id": "modules",
            #         "localizedHeader": {
            #             "defaultValue": {"language": "ca", "value": "Membre"},
            #             "translatedValues": [
            #                 {"language": "en-GB", "value": "Member"},
            #                 {"language": "sv", "value": "Medlem"},
            #             ],
            #         },
            #         "body": ", ".join(
            #             [
            #                 NAME_BY_MODULE[membership_module_obj.module]
            #                 for membership_module_obj in self.membership_obj.all_modules
            #             ]
            #         ),
            #         "displayInterval": {
            #             "start": {"date": self.membership_start},
            #             "end": {"date": self.membership_end},
            #         },
            #         "messageType": "TEXT",
            #     }
            # ],
        }

        return new_object

    def get_url(self) -> str:
        new_class = self.get_class()
        new_object = self.get_object()

        origin_url = full_url(module=self.module)

        claims = {
            "iss": settings.INTEGRATION_GOOGLE_EMAIL,
            "aud": "google",
            "origins": [origin_url],
            "typ": "savetowallet",
            "payload": {
                "loyaltyClasses": [new_class],
                "loyaltyObjects": [new_object],
            },
        }

        signer = crypt.RSASigner.from_service_account_file(self.key_file_path)
        token = jwt.encode(signer, claims).decode("utf-8")

        return f"https://pay.google.com/gp/v/save/{token}"


def get_pass_loyalty_url(user_id: UUID, module: Module) -> str | None:
    try:
        google_wallet_loyalty = GoogleWalletLoyalty(user_id=user_id, module=module)
    except Exception as e:
        _log.exception(e)
        return None

    return google_wallet_loyalty.get_url()
