import { sv } from "date-fns/locale/sv";
import { ca } from "date-fns/locale/ca";

export function languageToLocale(language: string) {
  switch (language) {
    case "ca":
      return ca;
    case "sv":
      return sv;
  }
}
