import styles from "./styles.module.css";
import {Container, Typography} from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import ImageHeroAboutBylaws from "../../assets/images/heros/about-bylaws.jpg";
import { useTranslation } from "react-i18next";
import Alerts from "../../components/Alerts/Alerts";
import Grid from "@mui/material/Grid2";
import {apiLegalBylawsList} from "../../api";
import markdown from "@wcj/markdown-to-html";
import {capitalizeFirstLetter} from "../../utils/string";

function AboutBylawsPage() {
  const [t, i18n] = useTranslation("common");

  const [bylaws, setBylaws] = React.useState(undefined);

  React.useEffect(() => {
    apiLegalBylawsList().then((response) => {
      if (response.status === 200) {
        setBylaws(response.data.results.find((bylaws: any) => true));
      }
    });
  }, [setBylaws, i18n.resolvedLanguage]);

  return (
    <>
      <Box
        component="section"
        className={styles.aboutBylaws}
        sx={{
          marginTop: { xs: "57px", md: "65px" },
          padding: { xs: "32px 0", md: "64px 0" },
        }}
      >
              <Grid direction="column" display="flex" alignItems="center" flexDirection="column">
        <Container className={styles.heroContainer}>
            <Box className={styles.aboutBylawsTitleBox}>
              <Typography
                variant="h3"
                fontWeight="700"
                className={styles.aboutBylawsTitle}
              >
                {t("pages.about-bylaws.title")}
            </Typography>
            </Box>
            <Box
              sx={{ height: { xs: "300px", md: "500px" } }}
              className={styles.heroImage}
              style={{ backgroundImage: "url(" + ImageHeroAboutBylaws + ")" }}
            />
        </Container>
        <Container maxWidth="xl"
        sx={{
          marginTop: { xs: "16px", md: "32px" },
          paddingTop: { xs: "32px", md: "64px" },
          paddingBottom: { xs: "32px", md: "64px" },
        }}>
          <Alerts />{bylaws && <Box className={styles.aboutBylawsContainerBox}>
            <div
                dangerouslySetInnerHTML={{
                    __html: markdown(
                        bylaws.content,
                    ).toString(),
                }}
            ></div>
              <Typography
                variant="h6"
                fontWeight="700"
                align="center"
                marginTop="64px"
              >
                {capitalizeFirstLetter(
                              new Date(bylaws.date).toLocaleDateString(
                                i18n.resolvedLanguage,
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              ),
                            )}
            </Typography>
        </Box>}
        </Container>
              </Grid>
      </Box>
    </>
  );
}

export default AboutBylawsPage;
