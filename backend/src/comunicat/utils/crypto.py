# pylint: disable=protected-access, invalid-name, too-many-locals
import base64
import secrets

from cryptography import x509
from cryptography.hazmat.bindings.openssl.binding import Binding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.serialization import pkcs7
from django.utils.crypto import salted_hmac

copenssl = Binding.lib
cffi = Binding.ffi


# SMIME isn't supported by pyca/cryptography:
# https://github.com/pyca/cryptography/issues/1621
# adjusted with latest cryptography code from https://github.com/devartis/passbook/pull/60/files
def pkcs7_sign(
    path_cert: str,
    path_key: str,
    path_verify: str,
    data: bytes,
    key_password: str | None = None,
) -> bytes:
    cert_cert = open(path_cert, "rb").read()
    cert_key = open(path_key, "rb").read()
    cert_verify = open(path_verify, "rb").read()

    cert = x509.load_pem_x509_certificate(cert_cert)
    priv_key = serialization.load_pem_private_key(cert_key, password=key_password)
    wwdr_cert = x509.load_pem_x509_certificate(cert_verify)

    options = [pkcs7.PKCS7Options.DetachedSignature]

    return (
        pkcs7.PKCS7SignatureBuilder()
        .set_data(data)
        .add_signer(cert, priv_key, hashes.SHA256())
        .add_certificate(wwdr_cert)
        .sign(serialization.Encoding.DER, options)
    )


def gen_random_token():
    rand1 = secrets.token_bytes(16)
    rand2 = secrets.token_bytes(7)
    rand2 = salted_hmac(rand1, rand2).digest()
    part_a = base64.urlsafe_b64encode(rand2).rstrip(b"=").decode("ascii")
    part_b = secrets.token_urlsafe(20)
    return part_b + part_a
