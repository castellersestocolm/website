from urllib import parse

from django.core.signing import Signer, BadSignature
from django.utils import timezone


def sign_url(url: str, minutes: int) -> str:
    expires_at = int((timezone.now() + timezone.timedelta(minutes=minutes)).timestamp())
    signer = Signer()
    full_value = "{}-{}".format(url, expires_at)
    full_signature = signer.sign(full_value)
    signature = full_signature.split(signer.sep)[-1]

    return "{}?{}".format(
        url, parse.urlencode({"signature": signature, "expires_at": expires_at})
    )


def check_signature(url: str) -> bool:
    parsed_url = parse.urlparse(url.lstrip("/"))
    query_dict = parse.parse_qs(parsed_url.query)

    try:
        signature = query_dict["signature"][0]
        expires_at = int(query_dict["expires_at"][0])
    except (KeyError, ValueError):
        return False

    signer = Signer()
    full_value = "{}-{}".format(parsed_url.path, expires_at)

    try:
        signer.unsign("{}{}{}".format(full_value, signer.sep, signature))
    except BadSignature:
        return False

    return expires_at > int(timezone.now().timestamp())
