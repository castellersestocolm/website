import { EVENT_TYPE_ICON, EventType, Module, TeamType } from "../enums";
import IconMusicNote from "@mui/icons-material/MusicNote";

export function get_event_icon(eventType: EventType, eventModules: any[]) {
  if (
    eventModules &&
    eventModules.filter(
      (eventModule: any) =>
        eventModule.module === Module.TOWERS &&
        eventModule.team &&
        eventModule.team.type === TeamType.MUSICIANS,
    ).length > 0
  ) {
    return <IconMusicNote />;
  }
  return EVENT_TYPE_ICON[eventType];
}

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

export function eventPriceToTitle(t: any, eventPrice: any) {
  return eventPrice.age_from && eventPrice.age_to
    ? t("pages.calendar-event.register.prices.between") +
        " " +
        eventPrice.age_from +
        " " +
        t("pages.calendar-event.register.prices.and") +
        " " +
        eventPrice.age_to +
        " " +
        t("pages.calendar-event.register.prices.years")
    : eventPrice.age_from
      ? t("pages.calendar-event.register.prices.above") +
        " " +
        eventPrice.age_from +
        " " +
        t("pages.calendar-event.register.prices.years")
      : eventPrice.age_to
        ? t("pages.calendar-event.register.prices.under") +
          " " +
          eventPrice.age_to +
          " " +
          t("pages.calendar-event.register.prices.years")
        : t("pages.calendar-event.register.prices.general-admission");
}
