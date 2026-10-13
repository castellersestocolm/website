import IconHelp from "@mui/icons-material/Help";
import IconChangeCircle from "@mui/icons-material/ChangeCircle";
import IconCheckCircle from "@mui/icons-material/CheckCircle";
import IconCancel from "@mui/icons-material/Cancel";
import IconPending from "@mui/icons-material/Pending";
import IconDeleteForeverRounded from "@mui/icons-material/DeleteForeverRounded";
import IconTbana from "./components/IconTbana/IconTbana.jsx";
import IconBus from "./components/IconBus/IconBus.jsx";
import IconTrolleybus from "./components/IconTrolleybus/IconTrolleybus.jsx";
import IconRail from "./components/IconRail/IconRail.jsx";
import IconWater from "./components/IconWater/IconWater.jsx";
import IconEvent from "@mui/icons-material/Event";
import IconSportsGymnastics from "@mui/icons-material/SportsGymnastics";
import IconLocalActivity from "@mui/icons-material/LocalActivity";
import IconWavingHand from "@mui/icons-material/WavingHand";
import IconSpeakerNotes from "@mui/icons-material/SpeakerNotes";
import IconLock from "@mui/icons-material/Lock";
import IconSchool from "@mui/icons-material/School";
import IconGroups from "@mui/icons-material/Groups";

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
  CREATED = 0,
  PENDING = 10,
  PROCESSING = 20,
  COMPLETED = 30,
  CANCELED = 40,
}

export const PAYMENT_STATUS_ICON: any = {
  0: <IconPending />,
  10: <IconPending />,
  20: <IconChangeCircle />,
  30: <IconCheckCircle />,
  40: <IconCancel />,
};

export enum OrderType {
  PRODUCT = 10,
  REGISTRATION = 20,
  MEMBERSHIP = 30,
  COURSE = 40,
  REQUEST = 50,
}

export enum OrderStatus {
  CREATED = 10,
  REQUESTED = 15,
  PROCESSING = 20,
  COMPLETED = 30,
  CANCELED = 40,
  ABANDONED = 50,
}

export const ORDER_STATUS_ICON: any = {
  10: <IconPending />,
  15: <IconPending />,
  20: <IconChangeCircle />,
  30: <IconCheckCircle />,
  40: <IconCancel />,
  50: <IconDeleteForeverRounded />,
};

export enum EventType {
  GENERAL = 10,
  INTERNAL = 20,
  TALK = 30,
  GATHERING = 40,
  REHEARSAL = 50,
  PERFORMANCE = 60,
  COURSE = 70,
  WORKSHOP = 80,
}

export const EVENT_TYPE_ICON: any = {
  10: <IconEvent />,
  20: <IconLock />,
  30: <IconSpeakerNotes />,
  40: <IconWavingHand />,
  50: <IconSportsGymnastics />,
  60: <IconLocalActivity />,
  70: <IconSchool />,
  80: <IconGroups />,
};

export function getEnumLabel(t: any, enumName: string, value: any) {
  return t("enums." + enumName + "." + value);
}

export enum RegistrationStatus {
  REQUESTED = 10,
  ACTIVE = 20,
  CANCELLED = 30,
  TENTATIVE = 40,
  ATTENDED = 50,
}

export const REGISTRATION_STATUS_ICON: any = {
  10: <IconPending />,
  20: <IconCheckCircle />,
  30: <IconCancel />,
  40: <IconPending />,
  50: <IconCheckCircle />,
};

export enum Weekday {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}

export enum Month {
  JANUARY = 1,
  FEBRUARY = 2,
  MARCH = 3,
  APRIL = 4,
  MAY = 5,
  JUNE = 6,
  JULY = 7,
  AUGUST = 8,
  SEPTEMBER = 9,
  OCTOBER = 10,
  NOVEMBER = 11,
  DECEMBER = 12,
}

export enum ExpenseStatus {
  CREATED = 10,
  PROCESSING = 20,
  APPROVED = 30,
  REJECTED = 40,
  DELETED = 50,
}

export const EXPENSE_STATUS_ICON: any = {
  10: <IconPending />,
  20: <IconChangeCircle />,
  30: <IconCheckCircle />,
  40: <IconCancel />,
  50: <IconCancel />,
};

export enum EventQuestionType {
  SHORT = 10,
  LONG = 20,
  BOOLEAN = 30,
  CHOICE = 40,
}

export enum TeamType {
  BOARD = 10,
  TECHNICAL = 20,
  MUSICIANS = 30,
  COMMISSION = 40,
  ELECTION = 50,
  AUDITING = 60,
}

export enum ContactMessageType {
  CONTACT = 10,
  BUSINESS_WORKSHOP = 20,
  BUSINESS_PERFORMANCE = 21,
}

export enum DocumentType {
  GENERAL = 10,
  GUIDE = 20,
  RESOURCE = 30,
  PRESS = 40,
  NEWSLETTER = 50,
  REPORT = 60,
  FINANCIAL = 70,
}

export enum ConsentType {
  GENERAL = 10,
  MEDIA = 20,
  COMMUNICATION = 30,
  NEWSLETTER = 40,
  HEALTH = 50,
  SIGNUP = 60,
}

export enum ProgramType {
  GENERAL = 10,
  ESPLAI = 20,
  TEACHING = 30,
}

export enum ProgramCourseRegistrationStatus {
  REQUESTED = 0,
  PROCESSING = 1,
  ACTIVE = 2,
  EXPIRED = 3,
  CANCELLED = 4,
}

export enum PermissionLevel {
  NONE = 10,
  USER = 20,
  ADMIN = 30,
  SUPERADMIN = 40,
}

export enum GoogleLocaleCountry {
  en = "enGB",
  ca = "ca",
  sv = "se",
}

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
