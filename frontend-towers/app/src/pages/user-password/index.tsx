import styles from "./styles.module.css";
import { Container, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import FormPassword from "../../components/FormPassword/FormPassword";

function UserLoginPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Box component="section" className={styles.userPassword}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight="700"
            className={styles.userPasswordTitle}
          >
            {t("pages.user-password.title")}
          </Typography>
          <FormPassword />
        </Container>
      </Box>
    </>
  );
}

export default UserLoginPage;
