import styles from "./styles.module.css";
import { Container, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import FormJoin from "../../components/FormJoin/FormJoin";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../components/AppContext/AppContext";
import ImageCarousel from "../../components/ImageCarousel/ImageCarousel";
import Alerts from "../../components/Alerts/Alerts";

function UserJoinPage() {
  const { t } = useTranslation("common");
  let navigate = useNavigate();

  const { user } = useAppContext();

  React.useEffect(() => {
    if (user) {
      navigate(ROUTES["user-dashboard"].path, { replace: true });
    }
  }, [user]);

  return (
    <>
      <Box
        component="section"
        className={styles.userJoin}
        sx={{
          marginTop: { xs: "57px", md: "65px" },
          padding: { xs: "32px 0", md: "64px 0" },
        }}
      >
        <Container maxWidth="lg">
          <Alerts />
          <Typography
            variant="h3"
            fontWeight="700"
            className={styles.userJoinTitle}
          >
            {t("pages.user-join.title")}
          </Typography>
          <FormJoin />
        </Container>
        <Box className={styles.carouselTop}>
          <ImageCarousel dense={true} />
        </Box>
      </Box>
    </>
  );
}

export default UserJoinPage;
