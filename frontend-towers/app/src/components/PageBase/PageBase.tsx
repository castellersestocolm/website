import styles from "./styles.module.css";
import Alerts from "../Alerts/Alerts";
import { Container, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import { useAppContext } from "../AppContext/AppContext";
import { useTranslation } from "react-i18next";
import FormUpdate from "../FormUpdate/FormUpdate";
import { LoaderClip } from "../LoaderClip/LoaderClip";
import { isRegistrationFinished } from "../../utils/user";

export default function PageBase({
  title,
  subtitle = undefined,
  description = undefined,
  content,
  finishedRegistration = false,
  loading = false,
  screenFull = false,
  heightFull = false,
}: any) {
  const { t } = useTranslation("common");

  const { user } = useAppContext();

  const hasFinishedRegistration =
    finishedRegistration && !isRegistrationFinished(user);
  const isLoading = hasFinishedRegistration && loading;

  const pageContent = isLoading ? (
    <LoaderClip />
  ) : (
    <>
      <Alerts />
      {hasFinishedRegistration ? (
        <>
          <Typography
            variant="h4"
            fontWeight="700"
            className={styles.pageTitle}
          >
            {t("pages.user-registration.title")}
          </Typography>
          {user ? (
            <Box className={styles.pageForm}>
              <FormUpdate />
            </Box>
          ) : (
            <Box className={styles.pageLoader}>
              <LoaderClip />
            </Box>
          )}
        </>
      ) : (
        <>
          {(title || subtitle) && (
            <Box
              className={styles.pageHeader}
              sx={{
                paddingBottom: {
                  xs: "calc(4 * var(--mui-spacing))",
                  md: "calc(6 * var(--mui-spacing))",
                },
              }}
            >
              {title && (
                <Typography
                  variant="h4"
                  fontWeight="700"
                  className={styles.pageTitle}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  variant="h6"
                  fontWeight="700"
                  className={styles.pageSubtitle}
                >
                  {subtitle}
                </Typography>
              )}
              {description && (
                <Box className={styles.pageDescription}>{description}</Box>
              )}
            </Box>
          )}
          {content}
        </>
      )}
    </>
  );

  return (
    <>
      {isLoading || heightFull ? (
        <Box
          className={styles.pageLoader}
          sx={{
            xs: screenFull ? "0" : "56px",
            md: screenFull ? "0" : "65px",
          }}
        >
          <Box className={styles.boxLoader}>{pageContent}</Box>
        </Box>
      ) : (
        <Box
          component="section"
          className={styles.page}
          sx={{
            marginTop: { xs: "56px", md: "65px" },
            padding: { xs: "32px 0", md: "64px 0" },
          }}
        >
          <Container
            maxWidth={screenFull ? false : "lg"}
            sx={{
              position: screenFull ? "unset" : "relative",
              ...(loading
                ? {
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  }
                : {
                    paddingLeft: {
                      xs: "calc(3 * var(--mui-spacing)) !important",
                      md: "calc(6 * var(--mui-spacing)) !important",
                    },
                    paddingRight: {
                      xs: "calc(3 * var(--mui-spacing)) !important",
                      md: "calc(6 * var(--mui-spacing)) !important",
                    },
                  }),
            }}
          >
            {pageContent}
          </Container>
        </Box>
      )}
    </>
  );
}
