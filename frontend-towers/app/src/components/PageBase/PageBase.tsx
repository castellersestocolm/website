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
  content,
  finishedRegistration = false,
  loading = false,
}: any) {
  const { t } = useTranslation("common");

  const { user } = useAppContext();

  return (
    <>
      <Box
        component="section"
        className={styles.page}
        sx={{
          marginTop: { xs: "56px", md: "65px" },
          padding: { xs: "32px 0", md: "64px 0" },
          ...(loading
            ? {
                position: "absolute",
                bottom: 0,
                top: 0,
                left: 0,
                right: 0,
                alignItems: "start",
                display: "flex",
                flexGrow: 1,
                flexDirection: "column",
                zIndex: -100,
              }
            : {}),
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            ...(loading
              ? {
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                }
              : {}),
          }}
        >
          <Alerts />
          {finishedRegistration && !isRegistrationFinished(user) ? (
            <>
              <Typography
                variant="h3"
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
              <Typography
                variant="h3"
                fontWeight="700"
                className={styles.pageTitle}
              >
                {title}
              </Typography>
              {loading ? (
                <Box className={styles.pageLoader}>
                  <LoaderClip />
                </Box>
              ) : (
                content
              )}
            </>
          )}
        </Container>
      </Box>
    </>
  );
}
