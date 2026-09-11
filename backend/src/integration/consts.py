GOOGLE_DRIVE_SCOPES = [
    "https://www.googleapis.com/auth/drive.metadata.readonly",
    "https://www.googleapis.com/auth/drive.file",
]

GOOGLE_WALLET_SCOPES = ["https://www.googleapis.com/auth/wallet_object.issuer"]

LANGUAGE_TO_GOOGLE_LANGUAGE = {"en": "en-GB", "ca": "ca", "sv": "sv"}
LANGUAGE_TO_GOOGLE_LOCALE_COUNTRY = {"en": "enGB", "ca": "ca", "sv": "se"}

LANGUAGE_TO_APPLE_WALLET_FILE = {
    "en": ("US_UK", "US-UK_Add_to_Apple_Wallet_RGB_101421"),
    "ca": ("CAES", "CAES_Add_to_Apple_Wallet_RGB_101421"),
    "sv": ("SE", "SE_Add_to_Apple_Wallet_RGB_102021"),
}
