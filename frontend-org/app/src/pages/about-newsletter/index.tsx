import styles from "./styles.module.css";
import * as React from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import FormNewsletter from "../../components/FormNewsletter/FormNewsletter";

function AboutNewsletterPage() {
  const { t } = useTranslation("common");

  const content = (
    <Box className={styles.aboutNewsletterContainerBox}>
      <FormNewsletter />
    </Box>
  );

  return (
    <PageBase title={t("pages.about-newsletter.title")} content={content} />
  );
}

export default AboutNewsletterPage;
