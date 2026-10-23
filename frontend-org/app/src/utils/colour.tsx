import { ColourType } from "../enums";

export function getColour(theme: any, colour: any): string {
  if (!colour || !theme) {
    return "";
  }

  switch (colour.type) {
    case ColourType.PALETTE_PRIMARY_MAIN:
      return theme.palette.primary.main;
    case ColourType.PALETTE_PRIMARY_CONTRAST_TEXT:
      return theme.palette.primary.contrastText;
    case ColourType.PALETTE_SECONDARY_MAIN:
      return theme.palette.secondary.main;
    case ColourType.PALETTE_SECONDARY_CONTRAST_TEXT:
      return theme.palette.secondary.contrastText;
    case ColourType.PALETTE_TEXT_PRIMARY:
      return theme.palette.text.primary;
    case ColourType.PALETTE_TEXT_SECONDARY:
      return theme.palette.text.secondary;
  }

  return "";
}
