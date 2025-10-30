import styles from "./styles.module.css";
import Alerts from "../Alerts/Alerts";
import { Container, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import { useAppContext } from "../AppContext/AppContext";
import { useTranslation } from "react-i18next";
import FormUpdate from "../FormUpdate/FormUpdate";
import Grid from "@mui/material/Grid";
import Hero from "../Hero/Hero";
import { LoaderClip } from "../LoaderClip/LoaderClip";

export default function PageImageHero({
  title,
  subtitle = undefined,
  content,
  contentPost,
  hero,
  finishedRegistration = false,
  loading = false,
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
          ...(loading
            ? {
                position: "absolute",
                bottom: 0,
                top: 0,
                left: 0,
                right: 0,
                alignItems: "stretch",
                display: "flex",
                flexGrow: 1,
                flexDirection: "row",
                zIndex: -100,
              }
            : {}),
        }}
      >
        <Grid
          direction="column"
          display="flex"
          alignItems="center"
          flexDirection="column"
          sx={
            loading
              ? {
                  alignItems: "stretch",
                  display: "flex",
                  flexGrow: 1,
                  flexDirection: "column",
                }
              : {}
          }
        >
          <Hero title={title} subtitle={subtitle} hero={hero} />
          {content && (
            <Container
              maxWidth="xl"
              sx={{
                marginTop: { xs: "16px", md: "32px" },
                paddingTop: { xs: "32px", md: "64px" },
                paddingBottom: { xs: "24px", md: "32px" },
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
              ) : loading ? (
                <Box className={styles.pageLoader}>
                  <LoaderClip />
                </Box>
              ) : (
                content
              )}
            </Container>
          )}
        </Grid>
      </Box>
      {contentPost}
    </>
  );
}
