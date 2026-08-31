import styles from "./styles.module.css";
import { Container, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import { LoaderClip } from "../LoaderClip/LoaderClip";
import Alerts from "../Alerts/Alerts";

export default function PageBase({
  title = undefined,
  subtitle = undefined,
  content,
  finishedRegistration = false,
  loading = false,
  screenFull = false,
}: any) {
  // const { user } = useAppContext();

  // TODO: Prompt to finish registration
  const hasFinishedRegistration = finishedRegistration; // && !isRegistrationFinished(user);
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
            marginTop: {
              xs: screenFull ? "0" : "56px",
              md: screenFull ? "0" : "65px",
            },
            padding: {
              xs: screenFull ? "0" : "32px 0",
              md: screenFull ? "0" : "64px 0",
            },
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
            maxWidth={screenFull ? false : "lg"}
            sx={{
              position: screenFull ? "unset" : "relative",
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
            {(title || subtitle) && (
              <Box className={styles.pageHeader}>
                {title && (
                  <Typography
                    variant="h3"
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
              </Box>
            )}
            {content}
          </Container>
        </Box>
      )}
    </>
  );
}
