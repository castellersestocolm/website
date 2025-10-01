import styles from "./styles.module.css";
import { Container, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import FormPassword from "../../components/FormPassword/FormPassword";
import Alerts from "../../components/Alerts/Alerts";
import { useParams } from "react-router-dom";
import FormSetPassword from "../../components/FormSetPassword/FormSetPassword";

function UserLoginPage() {
  const { t } = useTranslation("common");
  const { token } = useParams();

  return (
    <>
      <Box
        component="section"
        className={styles.userPassword}
        sx={{
          marginTop: { xs: "56px", md: "65px" },
          padding: { xs: "32px 0", md: "64px 0" },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
          }}
        >
          <Alerts />
          <Typography
            variant="h3"
            fontWeight="700"
            className={styles.userPasswordTitle}
          >
            {token
              ? t("pages.user-set-password.title")
              : t("pages.user-password.title")}
          </Typography>
          {token ? <FormSetPassword token={token} /> : <FormPassword />}
        </Container>
      </Box>
    </>
  );
}

export default UserLoginPage;
