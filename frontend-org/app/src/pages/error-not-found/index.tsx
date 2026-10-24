import { Typography, Box } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import IconWarning from "@mui/icons-material/Warning";
import styles from "./styles.module.css";

function ErrorNotFoundPage() {
  const { t } = useTranslation("common");

  const content = (
    <Box className={styles.boxError}>
      <IconWarning className={styles.iconError} />
      <Typography variant="h3" fontWeight="700">
        {t("pages.error-not-found.title")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.error-not-found.description")}
      </Typography>
    </Box>
  );

  return <PageBase content={content} heightFull={true} />;
}

export default ErrorNotFoundPage;
