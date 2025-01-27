import styles from "./styles.module.css";
import { Container, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import FormLogin from "../../components/FormLogin/FormLogin";

function UserLoginPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Box component="section" className={styles.userLogin}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight="700"
            className={styles.userLoginTitle}
          >
            {t("pages.user-login.title")}
          </Typography>
          <FormLogin />
        </Container>
      </Box>
    </>
  );
}

export default UserLoginPage;
