import styles from "./styles.module.css";
import { Container, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import FormLogin from "../../components/FormLogin/FormLogin";
import { useAppContext } from "../../components/AppContext/AppContext";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import Alerts from "../../components/Alerts/Alerts";

function UserLoginPage() {
  const { t } = useTranslation("common");
  let navigate = useNavigate();

  const { user } = useAppContext();

  React.useEffect(() => {
    if (user) {
      navigate(ROUTES["user-dashboard"].path);
    }
  }, [user]);

  return (
    <>
      <Box
        component="section"
        className={styles.userLogin}
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
