import styles from "./styles.module.css";
import Alerts from "../Alerts/Alerts";
import { Container, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import { useAppContext } from "../AppContext/AppContext";
import { useTranslation } from "react-i18next";
import FormUpdate from "../FormUpdate/FormUpdate";

export default function PageBase({
  title,
  content,
  finishedRegistration = false,
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
        }}
      >
        <Container maxWidth="lg">
          <Alerts />
          {finishedRegistration && user && !user.registration_finished ? (
            <>
              <Typography
                variant="h3"
                fontWeight="700"
                className={styles.pageTitle}
              >
                {t("pages.user-registration.title")}
              </Typography>
              <Box className={styles.pageForm}>
                <FormUpdate />
              </Box>
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
    </>
  );
}
