import { ConsentType } from "../enums";

export function isRegistrationFinished(user: any) {
  // Don't check if the registration is finished if the user isn't logged in
  if (!user) {
    return true;
  }

  if (!user.registration_finished) {
    return false;
  }

  const consentTypes =
    user &&
    user.consents
      .filter((consent: any) => !consent.deleted_at)
      .map((consent: any) => consent.type);

  return !(
    !consentTypes.includes(ConsentType.GENERAL) ||
    !consentTypes.includes(ConsentType.MEDIA) ||
    !consentTypes.includes(ConsentType.HEALTH)
  );
}
