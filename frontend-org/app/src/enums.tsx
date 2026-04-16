import IconHelp from "@mui/icons-material/Help";
import IconChangeCircle from "@mui/icons-material/ChangeCircle";
import IconCheckCircle from "@mui/icons-material/CheckCircle";
import IconCancel from "@mui/icons-material/Cancel";
import IconPending from "@mui/icons-material/Pending";
import IconDeleteForeverRounded from "@mui/icons-material/DeleteForeverRounded";

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

export function getEnumLabel(t: any, enumName: string, value: any) {
  return t("enums." + enumName + "." + value);
}

export enum RegistrationStatus {
  REQUESTED = 10,
  ACTIVE = 20,
  CANCELLED = 30,
  TENTATIVE = 40,
}

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
