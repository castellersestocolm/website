import { Module } from "../enums";

export function getEventUsers(event: any, users: any[]) {
  if (
    event.modules.filter(
      (eventModule: any) =>
        eventModule.module === Module.TOWERS && !eventModule.team,
    ).length > 0
  ) {
    return users;
  }
  return users.filter(
    (user: any) =>
      event.modules.filter(
        (eventModule: any) =>
          eventModule.module === Module.TOWERS &&
          eventModule.team &&
          user.members &&
          user.members.filter(
            (member: any) => eventModule.team.id === member.team.id,
          ).length > 0,
      ).length > 0,
  );
}
