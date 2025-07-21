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
