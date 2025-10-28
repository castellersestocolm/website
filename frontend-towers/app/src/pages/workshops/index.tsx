import {
  Card,
  Container,
  Divider,
  ListItem,
  List,
  ListItemIcon,
  ListItemText,
  Typography,
  CardContent,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import ImageHeroWorkshops from "../../assets/images/heros/workshops.jpg";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import LanguageChip from "../../components/LanguageChip/LanguageChip";
import MarkdownText from "../../components/MarkdownText/MarkdownText";
import styles from "../admin-equipment/styles.module.css";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import ImageHelmets from "../../assets/images/workshops/helmets.jpg";
import IconSchool from "@mui/icons-material/School";
import IconGroup from "@mui/icons-material/Group";
import IconTranslate from "@mui/icons-material/Translate";
import IconGroupAdd from "@mui/icons-material/GroupAdd";
import IconSunny from "@mui/icons-material/Sunny";
import ImageTraining1 from "../../assets/images/workshops/training1.jpg";
import ImageTraining2 from "../../assets/images/workshops/training2.jpg";
import IconLocationOn from "@mui/icons-material/LocationOn";
import IconMailOutline from "@mui/icons-material/MailOutline";

function WorkshopsPage() {
  const { t } = useTranslation("common");

  const content = (
    <>
      <Container maxWidth="lg">
        <Grid container spacing={4} mb={{ xs: "40px", md: "64px" }}>
          <Grid size={{ xs: 12, md: 4 }} order={{ xs: 2, md: 1 }}>
            <Box
              className={styles.introImage}
              style={{ backgroundImage: "url(" + ImageHelmets + ")" }}
              sx={{ height: { xs: "200px !important", md: "unset" } }}
            />
          </Grid>
          <Grid
            size={{ xs: 12, md: 8 }}
            order={{ xs: 1, md: 2 }}
            display="flex"
            alignItems="center"
          >
            <Typography variant="h6">
              <MarkdownText text={t("pages.workshops.intro-card.body")} />
            </Typography>
          </Grid>
        </Grid>
      </Container>

      <Box component="section" className={styles.workshopsBoxGrey}>
        <Container maxWidth="xl">
          <Box mb={5}>
            <Typography variant="h5" fontWeight={700} mb={1}>
              {t("pages.workshops.who-card.title")}
            </Typography>
            <Typography variant="body1" mb={1}>
              <MarkdownText text={t("pages.workshops.who-card.body-1")} />
            </Typography>
            <Typography variant="body1" mb={1}>
              <MarkdownText text={t("pages.workshops.who-card.body-2")} />
            </Typography>
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} mb={2}>
              {t("pages.workshops.values-card.title")}
            </Typography>

            <Grid container spacing={3}>
              <Grid container size={{ xs: 12, md: 6, lg: 3 }} direction="row">
                <Card variant="outlined" className={styles.workshopsCard}>
                  <Box className={styles.workshopsTopBox}>
                    <Typography variant="h6" fontWeight="600" component="div">
                      <MarkdownText
                        text={t("pages.workshops.values-card.value-1.title")}
                      />
                    </Typography>
                  </Box>
                  <Divider />
                  <Box className={styles.workshopsBottomBox}>
                    <Typography variant="body1" component="div">
                      <MarkdownText
                        text={t("pages.workshops.values-card.value-1.body")}
                      />
                    </Typography>
                  </Box>
                </Card>
              </Grid>
              <Grid container size={{ xs: 12, md: 6, lg: 3 }} direction="row">
                <Card variant="outlined" className={styles.workshopsCard}>
                  <Box className={styles.workshopsTopBox}>
                    <Typography variant="h6" fontWeight="600" component="div">
                      <MarkdownText
                        text={t("pages.workshops.values-card.value-2.title")}
                      />
                    </Typography>
                  </Box>
                  <Divider />
                  <Box className={styles.workshopsBottomBox}>
                    <Typography variant="body1" component="div">
                      <MarkdownText
                        text={t("pages.workshops.values-card.value-2.body")}
                      />
                    </Typography>
                  </Box>
                </Card>
              </Grid>
              <Grid container size={{ xs: 12, md: 6, lg: 3 }} direction="row">
                <Card variant="outlined" className={styles.workshopsCard}>
                  <Box className={styles.workshopsTopBox}>
                    <Typography variant="h6" fontWeight="600" component="div">
                      <MarkdownText
                        text={t("pages.workshops.values-card.value-3.title")}
                      />
                    </Typography>
                  </Box>
                  <Divider />
                  <Box className={styles.workshopsBottomBox}>
                    <Typography variant="body1" component="div">
                      <MarkdownText
                        text={t("pages.workshops.values-card.value-3.body")}
                      />
                    </Typography>
                  </Box>
                </Card>
              </Grid>
              <Grid container size={{ xs: 12, md: 6, lg: 3 }} direction="row">
                <Card variant="outlined" className={styles.workshopsCard}>
                  <Box className={styles.workshopsTopBox}>
                    <Typography variant="h6" fontWeight="600" component="div">
                      <MarkdownText
                        text={t("pages.workshops.values-card.value-4.title")}
                      />
                    </Typography>
                  </Box>
                  <Divider />
                  <Box className={styles.workshopsBottomBox}>
                    <Typography variant="body1" component="div">
                      <MarkdownText
                        text={t("pages.workshops.values-card.value-4.body")}
                      />
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      <Box component="section" className={styles.workshopsBox}>
        <Container maxWidth="xl">
          <Box mb={5}>
            <Typography variant="h5" fontWeight={700} mb={1}>
              {t("pages.workshops.offer-card.title")}
            </Typography>
            <Typography variant="body1" mb={1}>
              <MarkdownText text={t("pages.workshops.offer-card.body-1")} />
            </Typography>
            <Typography variant="body1" mb={1}>
              <MarkdownText text={t("pages.workshops.offer-card.body-2")} />
            </Typography>
          </Box>

          <Box>
            <Grid container spacing={4}>
              <Grid container size={{ xs: 12, md: 6 }} direction="row">
                <img
                  src={ImageTraining1}
                  className={styles.workshopsImage}
                  alt="poster"
                />
              </Grid>
              <Grid
                container
                size={{ xs: 12, md: 6 }}
                direction="row"
                sx={{ display: { xs: "none", md: "block" } }}
              >
                <img
                  src={ImageTraining2}
                  className={styles.workshopsImage}
                  alt="poster"
                />
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      <Box component="section" className={styles.workshopsBoxGrey}>
        <Container maxWidth="xl">
          <Box mb={5}>
            <Typography variant="h5" fontWeight={700} mb={1}>
              {t("pages.workshops.expectations-card.title")}
            </Typography>
            <Typography variant="body1" mb={1}>
              <MarkdownText
                text={t("pages.workshops.expectations-card.body-1")}
              />
            </Typography>
            <Typography variant="body1" mb={1}>
              <MarkdownText
                text={t("pages.workshops.expectations-card.body-2")}
              />
            </Typography>
            <Typography variant="body1" mb={1}>
              <MarkdownText
                text={t("pages.workshops.expectations-card.body-3")}
              />
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" fontWeight={700} mb={1}>
              {t("pages.workshops.choose-card.title")}
            </Typography>
            <List dense={true} className={styles.workshopsList}>
              <ListItem>
                <ListItemIcon>
                  <IconSchool />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MarkdownText
                      text={t("pages.workshops.choose-card.list.point-1")}
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <IconGroup />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MarkdownText
                      text={t("pages.workshops.choose-card.list.point-2")}
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <IconTranslate />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MarkdownText
                      text={t("pages.workshops.choose-card.list.point-3")}
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <IconGroupAdd />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MarkdownText
                      text={t("pages.workshops.choose-card.list.point-4")}
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <IconSunny />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MarkdownText
                      text={t("pages.workshops.choose-card.list.point-5")}
                    />
                  }
                />
              </ListItem>
            </List>
          </Box>
        </Container>
      </Box>

      <Box component="section" className={styles.workshopsBox}>
        <Container maxWidth="xl">
          <Box mb={5}>
            <Typography variant="h5" fontWeight={700} mb={1}>
              {t("pages.workshops.pricing-card.title")}
            </Typography>
            <Typography variant="body1" mb={1}>
              <MarkdownText text={t("pages.workshops.pricing-card.body-1")} />
            </Typography>
            <Typography variant="body1" mb={1}>
              <MarkdownText text={t("pages.workshops.pricing-card.body-2")} />
            </Typography>
          </Box>
          <Grid container spacing={4} className={styles.workshopsPricingGrid}>
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ display: "flex", flexDirection: "column" }}
            >
              <React.Fragment>
                <CardContent className={styles.workshopsPricingCard}>
                  <IconMailOutline className={styles.workshopsPricingIcon} />
                  <Box>
                    <Typography variant="h5" fontWeight="600">
                      {t("pages.workshops.pricing-card.grid-contact.title")}
                    </Typography>
                    <Typography className={styles.workshopsPricingCardText}>
                      <MarkdownText
                        text={t(
                          "pages.workshops.pricing-card.grid-contact.body",
                        )}
                      />
                    </Typography>
                  </Box>
                </CardContent>
              </React.Fragment>
            </Grid>
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ display: "flex", flexDirection: "column" }}
            >
              <React.Fragment>
                <CardContent className={styles.workshopsPricingCard}>
                  <IconLocationOn className={styles.workshopsPricingIcon} />
                  <Box>
                    <Typography variant="h5" fontWeight="600">
                      {t("pages.workshops.pricing-card.grid-location.title")}
                    </Typography>
                    <Typography className={styles.workshopsPricingCardText}>
                      <MarkdownText
                        text={t(
                          "pages.workshops.pricing-card.grid-location.body",
                        )}
                      />
                    </Typography>
                  </Box>
                </CardContent>
              </React.Fragment>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );

  return (
    <PageImageHero
      title={
        <>
          {t("pages.workshops.title")}
          <LanguageChip language="en" marginLeft="16px" />
        </>
      }
      contentPost={content}
      hero={ImageHeroWorkshops}
    />
  );
}

export default WorkshopsPage;
