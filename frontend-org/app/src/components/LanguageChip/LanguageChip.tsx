import * as React from "react";
import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function LanguageChip({
  language,
  size = "medium",
  ifDifferent = true,
  marginLeft = "8px",
}: any) {
  const { i18n } = useTranslation("common");

  return !ifDifferent || i18n.resolvedLanguage !== language ? (
    <Chip
      label={language.toUpperCase()}
      variant="filled"
      color="primary"
      sx={{ marginLeft: marginLeft }}
      size={size}
    />
  ) : undefined;
}
