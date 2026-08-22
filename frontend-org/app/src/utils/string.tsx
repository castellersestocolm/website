export function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export function lowerFirstLetter(val: string) {
  return String(val).charAt(0).toLowerCase() + String(val).slice(1);
}

export function listToCommaSeparatedString(val: string[], t: any) {
  if (val.length > 2) {
    return (
      val.slice(0, val.length - 2).join(", ") +
      " " +
      t("general.words.and") +
      " " +
      val[val.length - 1]
    );
  } else if (val.length === 2) {
    return val[0] + " " + t("general.words.and") + " " + val[1];
  } else if (val.length === 1) {
    return val[0];
  }

  return "";
}
