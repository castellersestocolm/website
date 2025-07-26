import random
import string


string_characters = "".join(
    [c for c in string.ascii_uppercase + string.digits if c not in ("I", "O")]
)


def generate_reference(length: int = 8) -> str:
    return "".join(
        random.SystemRandom().choice(string_characters) for _ in range(length)
    ).upper()
