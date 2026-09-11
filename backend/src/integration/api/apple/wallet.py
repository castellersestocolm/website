import datetime
import hashlib
import json
import logging
import os
import zipfile
from io import BytesIO
from uuid import UUID

from django.conf import settings
from django.db.models import Prefetch
from django.template.loader import render_to_string
from django.utils import timezone

import comunicat.utils.crypto
from comunicat.enums import Module
from membership.enums import MembershipStatus

_log = logging.getLogger(__name__)


# https://developer.apple.com/documentation/walletpasses/building-a-pass
class AppleWalletLoyalty:
    def __init__(self, user_id: UUID, module: Module | None):
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

    def get_bundle(self) -> BytesIO | None:
        context = {
            "user_obj": self.user_obj,
            "membership_obj": self.membership_obj,
            "membership_start": self.membership_start,
            "membership_end": self.membership_end,
            "module": self.module,
        }

        json_string = render_to_string(
            template_name=f"integration/apple/wallet/loyalty.{self.module.name.lower()}.pass/pass.json",
            context=context,
        )

        zip_buffer = BytesIO()

        manifest = {}

        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            zip_path = f"{settings.BASE_DIR}/comunicat/templates/integration/apple/wallet/loyalty.{self.module.name.lower()}.pass"
            for root, dirs, files in os.walk(zip_path):
                for file in files:
                    if file == "pass.json":
                        bytes_string = bytes(json_string, "utf8")
                        manifest["pass.json"] = hashlib.sha1(bytes_string).hexdigest()
                        zip_file.writestr(file, json_string)
                    else:
                        path_abs = os.path.join(root, file)
                        path_rel = os.path.relpath(os.path.join(root, file), zip_path)
                        with open(path_abs, "rb") as f:
                            bytes_file = f.read()
                        manifest[path_rel] = hashlib.sha1(bytes_file).hexdigest()
                        zip_file.write(path_abs, path_rel)

            zip_file.writestr("manifest.json", json.dumps(manifest))
            bytes_manifest = bytes(json.dumps(manifest), "utf8")

            bytes_signature = comunicat.utils.crypto.pkcs7_sign(
                path_cert=f"{settings.INTEGRATION_APPLE_CERT_DIR}{self.module.name.lower()}_cert.pem",
                path_key=f"{settings.INTEGRATION_APPLE_CERT_DIR}{self.module.name.lower()}_key.pem",
                path_verify=f"{settings.INTEGRATION_APPLE_CERT_DIR}{self.module.name.lower()}_verify.pem",
                data=bytes_manifest,
            )
            zip_file.writestr("signature", bytes_signature)

        zip_file.close()

        return zip_buffer


def get_pass_loyalty_bundle(user_id: UUID, module: Module) -> BytesIO | None:
    try:
        apple_wallet_loyalty = AppleWalletLoyalty(user_id=user_id, module=module)
    except Exception as e:
        _log.exception(e)
        return None

    return apple_wallet_loyalty.get_bundle()
