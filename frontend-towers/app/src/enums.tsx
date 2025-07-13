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
import IconCheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import IconCancelOutlined from "@mui/icons-material/CancelOutlined";
import IconHelpOutlineOutlined from "@mui/icons-material/HelpOutlineOutlined";
import IconPDF from "@mui/icons-material/PictureAsPdf";
import IconImage from "@mui/icons-material/Image";
import IconFile from "@mui/icons-material/FilePresent";

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

export enum OrderStatus {
  CREATED = 10,
  PROCESSING = 20,
  COMPLETED = 30,
  CANCELED = 40,
}

export const ORDER_STATUS_ICON: any = {
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

export enum ProductType {
  SHIPPING = 10,
  SHIRT = 3210,
  FAIXA = 3220,
  BANDANA = 3230,
  TSHIRT = 3240,
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

export function getEnumLabel(t: any, enumName: string, value: any) {
  return t("enums." + enumName + "." + value);
}

export enum RegistrationStatus {
  REQUESTED = 10,
  ACTIVE = 20,
  CANCELLED = 30,
  TENTATIVE = 40,
}

export const REGISTRATION_STATUS_ICON: any = {
  10: <IconHelpOutlineOutlined />,
  20: <IconCheckCircleOutlined />,
  30: <IconCancelOutlined />,
  40: <IconCheckCircleOutlined />,
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

export enum PermissionLevel {
  NONE = 10,
  USER = 20,
  ADMIN = 30,
  SUPERADMIN = 40,
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

export const EXTENSION_ICON: any = {
  pdf: <IconPDF />,
  jpg: <IconImage />,
  jpeg: <IconImage />,
  png: <IconImage />,
  undefined: <IconFile />,
};
