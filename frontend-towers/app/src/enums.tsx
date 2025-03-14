import IconHelp from "@mui/icons-material/Help";
import IconChangeCircle from "@mui/icons-material/ChangeCircle";
import IconCheckCircle from "@mui/icons-material/CheckCircle";
import IconCancel from "@mui/icons-material/Cancel";
import IconPending from "@mui/icons-material/Pending";
import IconEvent from "@mui/icons-material/Event";
import IconSportsGymnastics from "@mui/icons-material/SportsGymnastics";
import IconLocalActivity from "@mui/icons-material/LocalActivity";
import IconWavingHand from "@mui/icons-material/WavingHand";
import IconSpeakerNotes from "@mui/icons-material/SpeakerNotes";
import IconLock from "@mui/icons-material/Lock";
import IconTbana from "./components/IconTbana/IconTbana.jsx";
import IconBus from "./components/IconBus/IconBus.jsx";
import IconTrolleybus from "./components/IconTrolleybus/IconTrolleybus.jsx";
import IconRail from "./components/IconRail/IconRail.jsx";
import IconWater from "./components/IconWater/IconWater.jsx";

export enum Language {
  ENGLISH = "en",
  CATALAN = "ca",
  SWEDISH = "sv",
}

export enum Module {
  ORG = 10,
  TOWERS = 20,
}

export enum MembershipStatus {
  REQUESTED = 0,
  PROCESSING = 1,
  ACTIVE = 2,
  EXPIRED = 3,
}

export const MEMBERSHIP_STATUS_ICON: any = {
  0: <IconHelp />,
  1: <IconChangeCircle />,
  2: <IconCheckCircle />,
  3: <IconCancel />,
};

export enum FamilyMemberRequestStatus {
  REQUESTED = 10,
  ACCEPTED = 20,
  DELETED = 30,
  REJECTED = 40,
}

export enum PaymentType {
  DEBIT = 10,
  CREDIT = 20,
}

export enum PaymentStatus {
  PENDING = 10,
  PROCESSING = 20,
  COMPLETED = 30,
  CANCELED = 40,
}

export const PAYMENT_STATUS_ICON: any = {
  10: <IconPending />,
  20: <IconChangeCircle />,
  30: <IconCheckCircle />,
  40: <IconCancel />,
};

export enum EventType {
  GENERAL = 10,
  INTERNAL = 20,
  TALK = 30,
  GATHERING = 40,
  REHEARSAL = 50,
  PERFORMANCE = 60,
}

export const EVENT_TYPE_ICON: any = {
  10: <IconEvent />,
  20: <IconLock />,
  30: <IconSpeakerNotes />,
  40: <IconWavingHand />,
  50: <IconSportsGymnastics />,
  60: <IconLocalActivity />,
};

export enum TransportMode {
  BUS = 10,
  TROLLEYBUS = 20,
  TRAM = 30,
  METRO = 40,
  RAIL = 50,
  WATER = 60,
  FERRY = 70,
}

export const TRANSPORT_MODE_ICON: any = {
  10: <IconBus />,
  20: <IconTrolleybus />,
  30: <IconRail />,
  40: <IconTbana />,
  50: <IconRail />,
  60: <IconWater />,
  70: <IconWater />,
};

export function getEnumLabel(t: any, enumName: string, value: any) {
  return t("enums." + enumName + "." + value);
}
