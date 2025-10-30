import {
  Container,
  ListItem,
  List,
  ListItemIcon,
  ListItemText,
  Typography,
  Stack,
  CardContent,
  Card,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import ImageHeroPerformances from "../../assets/images/heros/performances.jpg";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import LanguageChip from "../../components/LanguageChip/LanguageChip";
import MarkdownText from "../../components/MarkdownText/MarkdownText";
import styles from "./styles.module.css";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import ImageColumn from "../../assets/images/performances/column.jpg";
import IconSunny from "@mui/icons-material/Sunny";
import IconCelebration from "@mui/icons-material/Celebration";
import IconTheaterComedy from "@mui/icons-material/TheaterComedy";
import IconPublic from "@mui/icons-material/Public";
import IconMusicNote from "@mui/icons-material/MusicNote";
import ImagePerformance1 from "../../assets/images/performances/performance1.jpg";
import ImagePerformance2 from "../../assets/images/performances/performance2.jpg";
import IconMailOutline from "@mui/icons-material/MailOutline";
import IconLocationOn from "@mui/icons-material/LocationOn";
import IconEvent from "@mui/icons-material/Event";

function BusinessPerformancesPage() {
  const { t } = useTranslation("common");

  const content = (
    <>
      <Container maxWidth="lg">
        <Grid container spacing={5} mb={{ xs: "40px", md: "64px" }}>
          <Grid size={{ xs: 12, md: 4 }} order={{ xs: 2, md: 1 }}>
            <img
              src={ImageColumn}
              className={styles.workshopsImage}
              alt="poster"
            />
          </Grid>
          <Grid
            size={{ xs: 12, md: 8 }}
            order={{ xs: 1, md: 2 }}
            display="flex"
            alignItems="center"
          >
            <Stack direction="column" spacing={1}>
              <Typography variant="h6">
                <MarkdownText
                  text={t("pages.performances.intro-card.body-1")}
                />
              </Typography>
              <Typography variant="h6">
                <MarkdownText
                  text={t("pages.performances.intro-card.body-2")}
                />
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <Box component="section" className={styles.workshopsBoxGrey}>
        <Container maxWidth="xl">
          <Box>
            <Typography variant="h5" fontWeight={700} mb={1}>
              {t("pages.workshops.who-card.title")}
            </Typography>
            <Typography variant="body1" mb={1}>
              <MarkdownText text={t("pages.workshops.who-card.body-1")} />
            </Typography>
            <Typography variant="body1">
              <MarkdownText text={t("pages.workshops.who-card.body-2")} />
            </Typography>
          </Box>
        </Container>
      </Box>

      <Box component="section" className={styles.workshopsBox}>
        <Container maxWidth="xl">
          <Box>
            <Grid container spacing={4}>
              <Grid container size={{ xs: 12, md: 6 }} direction="row">
                <img
                  src={ImagePerformance1}
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
                  src={ImagePerformance2}
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
          <Box>
            <Typography variant="h5" fontWeight={700} mb={1}>
              {t("pages.performances.choose-card.title")}
            </Typography>
            <Typography variant="body1" mb={1}>
              <MarkdownText
                text={t("pages.performances.choose-card.list.points")}
              />
            </Typography>
            <List dense={true} className={styles.workshopsList}>
              <ListItem>
                <ListItemIcon>
                  <IconCelebration />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MarkdownText
                      text={t("pages.performances.choose-card.list.point-1")}
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <IconTheaterComedy />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MarkdownText
                      text={t("pages.performances.choose-card.list.point-2")}
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
                      text={t("pages.performances.choose-card.list.point-3")}
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <IconPublic />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MarkdownText
                      text={t("pages.performances.choose-card.list.point-4")}
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <IconMusicNote />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MarkdownText
                      text={t("pages.performances.choose-card.list.point-5")}
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
          <Box>
            <Typography variant="h5" fontWeight={700} mb={1}>
              {t("pages.performances.pricing-card.title")}
            </Typography>
            <Typography variant="body1" mb={1}>
              <MarkdownText
                text={t("pages.performances.pricing-card.body-1")}
              />
            </Typography>
            <Typography variant="body1" mb={1}>
              <MarkdownText
                text={t("pages.performances.pricing-card.body-2")}
              />
            </Typography>
            <Typography variant="body1">
              <MarkdownText
                text={t("pages.performances.pricing-card.body-3")}
              />
            </Typography>
          </Box>
          <Grid container spacing={4} className={styles.workshopsPricingGrid}>
            <Grid container direction="row" size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" className={styles.workshopsPricingCard}>
                <CardContent className={styles.workshopsPricingCard}>
                  <IconMailOutline className={styles.workshopsPricingIcon} />
                  <Box>
                    <Typography variant="h5" fontWeight="600">
                      {t("pages.performances.pricing-card.grid-contact.title")}
                    </Typography>
                    <Typography className={styles.workshopsPricingCardText}>
                      <MarkdownText
                        text={t(
                          "pages.performances.pricing-card.grid-contact.body",
                        )}
                      />
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid container direction="row" size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" className={styles.workshopsPricingCard}>
                <CardContent className={styles.workshopsPricingCard}>
                  <IconLocationOn className={styles.workshopsPricingIcon} />
                  <Box>
                    <Typography variant="h5" fontWeight="600">
                      {t("pages.performances.pricing-card.grid-location.title")}
                    </Typography>
                    <Typography className={styles.workshopsPricingCardText}>
                      <MarkdownText
                        text={t(
                          "pages.performances.pricing-card.grid-location.body",
                        )}
                      />
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid container direction="row" size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" className={styles.workshopsPricingCard}>
                <CardContent className={styles.workshopsPricingCard}>
                  <IconEvent className={styles.workshopsPricingIcon} />
                  <Box>
                    <Typography variant="h5" fontWeight="600">
                      {t("pages.performances.pricing-card.grid-date.title")}
                    </Typography>
                    <Typography className={styles.workshopsPricingCardText}>
                      <MarkdownText
                        text={t(
                          "pages.performances.pricing-card.grid-date.body",
                        )}
                      />
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
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
          {t("pages.performances.title")}
          <LanguageChip language="en" marginLeft="16px" />
        </>
      }
      subtitle={t("pages.performances.subtitle")}
      contentPost={content}
      hero={ImageHeroPerformances}
    />
  );
}

export default BusinessPerformancesPage;
