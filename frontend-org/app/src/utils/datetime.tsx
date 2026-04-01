import { languageToLocale } from "./locale";

export function getAge(birthday: string) {
  if (birthday == null) {
    return undefined;
  }
  var today = new Date();
  var birthDate = new Date(birthday);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

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
