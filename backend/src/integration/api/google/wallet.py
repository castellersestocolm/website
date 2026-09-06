import datetime
from uuid import UUID

from django.conf import settings
from django.db.models import Prefetch
from django.utils import timezone
from googleapiclient.discovery import build, Resource
from google.oauth2.service_account import Credentials
from google.auth import jwt, crypt

from comunicat.consts import NAME_BY_MODULE
from integration.consts import GOOGLE_WALLET_SCOPES
from membership.enums import MembershipStatus


# https://github.com/google-wallet/rest-samples/blob/main/python/demo_loyalty.py
class GoogleWalletLoyalty:
    key_file_path: str
    credentials: Credentials
    client: Resource

    issuer_id = "3388000000023199314"
    class_suffix = "loyalty"

    def __init__(self):
        self.key_file_path = f"{settings.INTEGRATION_GOOGLE_CRED_DIR}app.json"
        self.auth()

    def auth(self):
        self.credentials = Credentials.from_service_account_file(
            self.key_file_path,
            scopes=GOOGLE_WALLET_SCOPES)

        self.client = build("walletobjects", "v1", credentials=self.credentials)

    # https://developers.google.com/wallet/retail/loyalty-cards/rest/v1/loyaltyclass
    def get_class(self) -> dict:
        new_class = {
            "id": f"{self.issuer_id}.{self.class_suffix}",
            "reviewStatus": "UNDER_REVIEW",
            "localizedIssuerName": {
                "defaultValue": {
                    "language": "ca",
                    "value": "Les Quatre Barres"
                },
                "translatedValues": [
                    {
                        "language": "en-GB",
                        "value": "Les Quatre Barres"
                    },
                    {
                        "language": "sv",
                        "value": "Les Quatre Barres"
                    }
                ],
            },
            "localizedProgramName": {
                "defaultValue": {
                    "language": "ca",
                    "value": "Carnet de membre"
                },
                "translatedValues": [
                    {
                        "language": "en-GB",
                        "value": "Member card"
                    },
                    {
                        "language": "sv",
                        "value": "Medlemskort"
                    }
                ],
            },
            "programLogo": {
                "sourceUri": {
                    "uri": "https://lesquatrebarres.org/logo512.png"
                }
            },
            "hexBackgroundColor": "#fac01a",  # "#f9b900",
            "heroImage": {
                "sourceUri": {
                    "uri": "https://lesquatrebarres.org/static/media/hero8.a8e20234beae6c132070.jpg"
                }
            },
            "homepageUri": {
                "uri": "https://lesquatrebarres.org",
                "localizedDescription": {
                    "defaultValue": {
                        "language": "ca",
                        "value": "Pàgina web"
                    },
                    "translatedValues": [
                        {
                            "language": "en-GB",
                            "value": "Website"
                        },
                        {
                            "language": "sv",
                            "value": "Hemsida"
                        }
                    ],
                },
            },
            "linksModuleData": {
                "uris": [
                    {
                        "uri": "https://lesquatrebarres.org/user/dashboard",
                        "localizedDescription": {
                            "defaultValue": {
                                "language": "ca",
                                "value": "Panell d'usuari"
                            },
                            "translatedValues": [
                                {
                                    "language": "en-GB",
                                    "value": "Dashboard"
                                },
                                {
                                    "language": "sv",
                                    "value": "Användarpanel"
                                }
                            ],
                        },
                    },
                    {
                        "uri": "https://lesquatrebarres.org/calendar",
                        "localizedDescription": {
                            "defaultValue": {
                                "language": "ca",
                                "value": "Calendari"
                            },
                            "translatedValues": [
                                {
                                    "language": "en-GB",
                                    "value": "Calendar"
                                },
                                {
                                    "language": "sv",
                                    "value": "Kalender"
                                }
                            ],
                        },
                    }
                ]
            },
        }

        return new_class

    def get_object(self, user_id: UUID) -> dict | None:
        from user.models import User
        from membership.models import Membership
        from membership.models import MembershipModule

        user_obj = User.objects.filter(id=user_id).with_has_active_membership().first()

        if not user_obj or not user_obj.membership_id:
            return None

        membership_obj = Membership.objects.filter(id=user_obj.membership_id).prefetch_related(
            Prefetch(
                "modules",
                MembershipModule.objects.filter(status=MembershipStatus.ACTIVE).order_by("module"),
                to_attr="all_modules"
            )
        ).first()

        if not membership_obj or membership_obj.status != MembershipStatus.ACTIVE:
            return None

        membership_start = timezone.make_aware(datetime.datetime.combine(membership_obj.date_from, datetime.time(0, 0, 0))).isoformat()
        membership_end = timezone.make_aware(datetime.datetime.combine(membership_obj.date_to, datetime.time(23, 59, 59))).isoformat()

        new_object = {
            'id': f'{self.issuer_id}.loyalty.{user_obj.membership_number}',
            'classId': f'{self.issuer_id}.{self.class_suffix}',
            'state': 'ACTIVE',  # EXPIRED
            'barcode': {
                'type': 'QR_CODE',
                'value': user_obj.membership_number
            },
            'accountId': user_obj.membership_number,
            'accountName': user_obj.name,
            "validTimeInterval":{
                        "start": {"date": membership_start},
                        "end": {"date": membership_end},
                    },
            "messages": [
                {
                    "id": "modules",
                    "localizedHeader": {
                        "defaultValue": {
                            "language": "ca",
                            "value": "Membre"
                        },
                        "translatedValues": [
                            {
                                "language": "en-GB",
                                "value": "Member"
                            },
                            {
                                "language": "sv",
                                "value": "Medlem"
                            }
                        ],
                    },
                    "body": ", ".join([NAME_BY_MODULE[membership_module_obj.module] for membership_module_obj in membership_obj.all_modules]),
                    "displayInterval": {
                        "start": {"date": membership_start},
                        "end": {"date": membership_end},
                    },
                    "messageType": "TEXT",
                }
            ],
        }

        return new_object

    def get_url(self, user_id: UUID) -> str:
        new_class = self.get_class()
        new_object = self.get_object(user_id=user_id)

        # INTEGRATION_GOOGLE_EMAIL
        EMAIL = "les-quatre-barres@website-450311.iam.gserviceaccount.com"

        claims = {
            'iss': EMAIL,
            'aud': 'google',
            'origins': ['www.example.com'],
            'typ': 'savetowallet',
            'payload': {
                # The listed classes and objects will be created
                'loyaltyClasses': [new_class],
                'loyaltyObjects': [new_object]
            },
        }

        signer = crypt.RSASigner.from_service_account_file(self.key_file_path)
        token = jwt.encode(signer, claims).decode('utf-8')

        return f"https://pay.google.com/gp/v/save/{token}"
