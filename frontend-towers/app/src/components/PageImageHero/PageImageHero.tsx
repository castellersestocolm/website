import styles from "./styles.module.css";
import Alerts from "../Alerts/Alerts";
import { Container, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import { useAppContext } from "../AppContext/AppContext";
import { useTranslation } from "react-i18next";
import FormUpdate from "../FormUpdate/FormUpdate";
import Grid from "@mui/material/Grid2";
import Hero from "../Hero/Hero";

export default function PageImageHero({
  title,
  content,
  hero,
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
        <Grid
          direction="column"
          display="flex"
          alignItems="center"
          flexDirection="column"
        >
          <Hero title={title} hero={hero} />
          <Container
            maxWidth="xl"
            sx={{
              marginTop: { xs: "16px", md: "32px" },
              paddingTop: { xs: "32px", md: "64px" },
              paddingBottom: { xs: "32px", md: "64px" },
            }}
          >
            <Alerts />
            {finishedRegistration && user && !user.registration_finished ? (
              <>
                <Typography
                  variant="h4"
                  fontWeight="700"
                  align="center"
                  marginBottom="32px"
                >
                  {t("pages.user-registration.title")}
                </Typography>
                <Box className={styles.pageForm}>
                  <FormUpdate />
                </Box>
              </>
            ) : (
              content
            )}
          </Container>
        </Grid>
      </Box>
    </>
  );
}
