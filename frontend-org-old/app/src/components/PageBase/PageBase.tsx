import styles from "./styles.module.css";
import { Container, Link, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import IconEast from "@mui/icons-material/East";
import ImageLogo from "../../assets/images/header/logo.png";

export default function PageBase({ title, subtitle, content }: any) {
  const [t, i18n] = useTranslation("common");

  return (
    <>
      <Box
        component="section"
        className={styles.pageTitleBox}
        sx={{
          padding: { xs: "32px 0", md: "64px 0" },
        }}
      >
        <Container maxWidth="lg">
          <img src={ImageLogo} className={styles.logo} alt="logo" />
          <Typography
            variant="h3"
            fontWeight="700"
            className={styles.pageTitle}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="h5"
              fontWeight="700"
              className={styles.pageSubtitle}
            >
              {subtitle}
            </Typography>
          )}
          <Typography textAlign="center" marginTop={2}>
            {i18n.resolvedLanguage === "ca" && (
              <Link
                onClick={() => i18n.changeLanguage("sv")}
                color="secondary"
                underline="none"
                target="_blank"
                className={styles.link}
              >
                {t("language.selector.sv")}
                <IconEast className={styles.iconEast} />
              </Link>
            )}
            {i18n.resolvedLanguage === "sv" && (
              <Link
                onClick={() => i18n.changeLanguage("ca")}
                color="secondary"
                underline="none"
                target="_blank"
                className={styles.link}
              >
                {t("language.selector.ca")}
                <IconEast className={styles.iconEast} />
              </Link>
            )}
          </Typography>
        </Container>
      </Box>
      <Box
        component="section"
        className={styles.page}
        sx={{
          padding: { xs: "32px 0", md: "64px 0" },
        }}
      >
        <Container maxWidth="lg">{content}</Container>
      </Box>
    </>
  );
}
