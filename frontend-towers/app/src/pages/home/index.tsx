import Box from "@mui/material/Box";
import ImageHero from "../../assets/images/hero.jpg";
import styles from "./styles.module.css";
import { CardContent, Container, Typography } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import IconLogoColour from "../../components/IconLogoColour/IconLogoColour.jsx";
import Grid from "@mui/material/Grid2";
import IconSchedule from "@mui/icons-material/Schedule";
import IconPlace from "@mui/icons-material/Place";
import IconBackpack from "@mui/icons-material/Backpack";

function HomePage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Box component="section" className={styles.hero}>
        <Container maxWidth="lg">
          <Grid container spacing={2} className={styles.heroGridLeft}>
            <Grid size={6}>
              <IconLogoColour />
              <Typography
                variant="h3"
                fontWeight="700"
                className={styles.heroTitle}
              >
                {t("pages.home-hero.title")}
              </Typography>
              <Typography
                variant="h5"
                fontWeight="700"
                className={styles.heroSubtitle}
              >
                {t("pages.home-hero.subtitle")}
              </Typography>
              <Typography variant="h6" className={styles.heroSubtitle}>
                {t("pages.home-hero.subtitle2")}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Box
                className={styles.heroImage}
                style={{ backgroundImage: "url(" + ImageHero + ")" }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box component="section" className={styles.rehearsals}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight="700"
            className={styles.rehearsalsTitle}
          >
            {t("pages.home-rehearsals.title")}
          </Typography>
          <Grid container spacing={4} className={styles.rehearsalsGrid}>
            <Grid size={5}>
              <React.Fragment>
                <CardContent className={styles.rehearsalsCard}>
                  <IconSchedule className={styles.rehearsalsIcon} />
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight="600"
                      className={styles.rehearsalsCardTitle}
                    >
                      {t("pages.home-rehearsals.box1.title")}
                    </Typography>
                    <Typography className={styles.rehearsalsCardText}>
                      {t("pages.home-rehearsals.box1.text1")}
                    </Typography>
                    <Typography className={styles.rehearsalsCardText2}>
                      {t("pages.home-rehearsals.box1.text2")}
                    </Typography>
                  </Box>
                </CardContent>
              </React.Fragment>
              <React.Fragment>
                <CardContent className={styles.rehearsalsCard}>
                  <IconPlace className={styles.rehearsalsIcon} />
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight="600"
                      className={styles.rehearsalsCardTitle}
                    >
                      {t("pages.home-rehearsals.box2.title")}
                    </Typography>
                    <Typography className={styles.rehearsalsCardText}>
                      {t("pages.home-rehearsals.box2.text1")}
                    </Typography>
                    <Typography className={styles.rehearsalsCardText2}>
                      {t("pages.home-rehearsals.box2.text2")}
                    </Typography>
                  </Box>
                </CardContent>
              </React.Fragment>
              <React.Fragment>
                <CardContent className={styles.rehearsalsCard}>
                  <IconBackpack className={styles.rehearsalsIcon} />
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight="600"
                      className={styles.rehearsalsCardTitle}
                    >
                      {t("pages.home-rehearsals.box3.title")}
                    </Typography>
                    <Typography className={styles.rehearsalsCardText}>
                      {t("pages.home-rehearsals.box3.text1")}
                    </Typography>
                  </Box>
                </CardContent>
              </React.Fragment>
            </Grid>
            <Grid size={7}>
              <iframe
                title="calendar"
                className={styles.calendarEmbed}
                src="https://calendar.google.com/calendar/embed?height=600&wkst=2&ctz=Europe%2FStockholm&bgcolor=%23ffffff&showTitle=0&hl=en_GB&showTz=0&showCalendars=0&showPrint=0&title=Castellers%20d'Estocolm&src=Y19jMzM5YTdmZWI1YzA5YzEyNTE2OTU1ODMwNjg3ZmI3MDY1YTVmODgzYTZiZGNiYTc0Y2U1NzgxMTIzYjJjN2Y2QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&color=%238E24AA"
              ></iframe>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box component="section">
        <object
          className={styles.mapEmbed}
          aria-label="map"
          data="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d10549.351169868873!2d17.99051515699911!3d59.35840008798483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNTnCsDIxJzI3LjQiTiAxN8KwNTknMzguOCJF!5e0!3m2!1sca!2sse!4v1726217485573!5m2!1sca!2sse"
        ></object>
      </Box>
    </>
  );
}

export default HomePage;
