import { RegistrationStatus } from "../enums";

export function getEventsCount(events: any, registrations: any, users: any) {
  const userIds = users && users.map((user: any) => user.id);
  return events && events.results.length > 0 && registrations && users
    ? Object.fromEntries(
        events.results
          .filter(
            (event: any) => event.require_signup && event.id in registrations,
          )
          .map((event: any) => {
            const registrationsActive = Object.values(
              registrations[event.id],
            ).filter(
              (registration: any) =>
                userIds.includes(registration.user.id) &&
                registration.status === RegistrationStatus.ACTIVE,
            ).length;
            const registrationsCancelled = Object.values(
              registrations[event.id],
            ).filter(
              (registration: any) =>
                userIds.includes(registration.user.id) &&
                registration.status === RegistrationStatus.CANCELLED,
            ).length;
            const registrationsUnknown =
              users.length - registrationsActive - registrationsCancelled;
            return [
              event.id,
              [
                registrationsActive,
                registrationsCancelled,
                registrationsUnknown,
              ],
            ];
          }),
      )
    : undefined;
}
