import { ConsentType } from "../enums";

export function isRegistrationFinished(user: any) {
  if (!user) {
    return false;
  }
  if (!user.registration_finished) {
    return false;
  }

  const consentTypes =
    user &&
    user.consents
      .filter((consent: any) => !consent.deleted_at)
      .map((consent: any) => consent.type);

  if (
    !consentTypes.includes(ConsentType.GENERAL) ||
    !consentTypes.includes(ConsentType.MEDIA) ||
    !consentTypes.includes(ConsentType.HEALTH)
  ) {
    return false;
  }

  return true;
}
