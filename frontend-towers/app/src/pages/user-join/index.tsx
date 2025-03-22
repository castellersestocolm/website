import styles from "./styles.module.css";
import { Container, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import FormJoin from "../../components/FormJoin/FormJoin";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../components/AppContext/AppContext";
import Alerts from "../../components/Alerts/Alerts";
import ImageHeroUserJoin from "../../assets/images/heros/user-join.jpg";
import Grid from "@mui/material/Grid2";

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
        <Grid
          direction="column"
          display="flex"
          alignItems="center"
          flexDirection="column"
        >
          <Container className={styles.heroContainer}>
            <Box className={styles.userJoinTitleBox}>
              <Typography
                variant="h3"
                fontWeight="700"
                className={styles.userJoinTitle}
              >
                {t("pages.user-join.title")}
              </Typography>
            </Box>
            <Box
              sx={{ height: { xs: "300px", md: "500px" } }}
              className={styles.heroImage}
              style={{ backgroundImage: "url(" + ImageHeroUserJoin + ")" }}
            />
          </Container>
          <Container
            maxWidth="xl"
            sx={{
              marginTop: { xs: "16px", md: "32px" },
              paddingTop: { xs: "32px", md: "64px" },
              paddingBottom: { xs: "32px", md: "64px" },
            }}
          >
            <Alerts />
            <Typography
              variant="h4"
              fontWeight="700"
              align="center"
              marginBottom="32px"
            >
              {t("pages.user-join.subtitle")}
            </Typography>
            <FormJoin />
          </Container>
        </Grid>
      </Box>
    </>
  );
}

export default UserJoinPage;
