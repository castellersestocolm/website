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

  const hasFinishedRegistration =
    finishedRegistration && !isRegistrationFinished(user);
  const isLoading = hasFinishedRegistration && loading;

  return (
    <>
      {isLoading ? (
        <Box
          className={styles.pageLoader}
          sx={{
            marginTop: { xs: "56px", md: "65px" },
          }}
        >
          <Box className={styles.boxLoader}>
            <LoaderClip />
          </Box>
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
            {hasFinishedRegistration ? (
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
                {content}
              </>
            )}
          </Container>
        </Box>
      )}
    </>
  );
}
