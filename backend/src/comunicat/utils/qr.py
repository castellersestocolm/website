import base64
from io import BytesIO

from PIL.Image import Image
from qrcode import QRCode, constants


def generate_qr_code(text: str) -> Image:
    qr = QRCode(
        version=1,
        error_correction=constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(text)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    return img


def generate_qr_code_base_64(text: str) -> str:
    img = generate_qr_code(text=text)

    img_file = BytesIO()
    img.save(img_file, format="PNG")
    img_bytes = img_file.getvalue()
    img_b64 = base64.b64encode(img_bytes).decode("utf-8")

    return img_b64
