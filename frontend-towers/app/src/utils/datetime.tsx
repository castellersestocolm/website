import { languageToLocale } from "./locale";
import { capitalizeFirstLetter } from "./string";

export function dateToString(language: string, date: Date) {
  return new Date(date).toLocaleDateString(languageToLocale(language).code, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function datetimeToString(language: string, date: Date) {
  return new Date(date).toLocaleDateString(languageToLocale(language).code, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function datetimeToLongString(language: string, date: Date) {
  return capitalizeFirstLetter(
    new Date(date).toLocaleDateString(language, {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
}
