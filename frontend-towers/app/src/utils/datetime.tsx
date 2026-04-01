import { languageToLocale } from "./locale";

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
