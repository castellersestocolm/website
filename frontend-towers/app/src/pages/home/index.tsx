import Box from "@mui/material/Box";
import ImageHero from "../../assets/images/hero.jpg";
import ImageJoin from "../../assets/images/join.jpg";
import styles from "./styles.module.css";
import {
  Button,
  Card,
  CardContent,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import IconLogoColour from "../../components/IconLogoColour/IconLogoColour.jsx";
import IconTbana from "../../components/IconTbana/IconTbana.jsx";
import Grid from "@mui/material/Grid2";
import IconSchedule from "@mui/icons-material/Schedule";
import IconPlace from "@mui/icons-material/Place";
import IconGroups from "@mui/icons-material/Groups";
import IconSportsGymnastics from "@mui/icons-material/SportsGymnastics";
import IconEmergency from "@mui/icons-material/Emergency";
import IconLoyalty from "@mui/icons-material/Loyalty";
import IconCreditCardOff from "@mui/icons-material/CreditCardOff";
import IconCheckroom from "@mui/icons-material/Checkroom";
import IconPayment from "@mui/icons-material/Payment";
import IconVisibility from "@mui/icons-material/Visibility";
import IconNaturePeople from "@mui/icons-material/NaturePeople";
import IconFitnessCenter from "@mui/icons-material/FitnessCenter";
import IconLocalActivity from "@mui/icons-material/LocalActivity";
import IconAcUnit from "@mui/icons-material/AcUnit";
import IconMic from "@mui/icons-material/Mic";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { ROUTES } from "../../routes";
import ImageCarousel from "../../components/ImageCarousel/ImageCarousel";
import { useAppContext } from "../../components/AppContext/AppContext";
import Alerts from "../../components/Alerts/Alerts";
import { apiEventList } from "../../api";
import { EventType, TRANSPORT_MODE_ICON } from "../../enums";
import { capitalizeFirstLetter } from "../../utils/string";
import EventCalendar from "../../components/EventCalendar/EventCalendar";
import Map from "../../components/Map/Map";
import IconArrowOutward from "@mui/icons-material/ArrowOutward";
import Hero from "../../components/Hero/Hero";
import ImageHeroTrips2025Berlin from "../../assets/images/heros/trips-2025-berlin.jpg";
import { Helmet } from "react-helmet";

function HomePage() {
  const [t, i18n] = useTranslation("common");

  const [events, setEvents] = React.useState(undefined);
  const { user, messages, rehearsal, setRehearsal } = useAppContext();

  const theme = useTheme();
  const timelineMatches = useMediaQuery(theme.breakpoints.up("md"));

  React.useEffect(() => {
    apiEventList().then((response) => {
      if (response.status === 200) {
        setRehearsal(
          response.data.results.find((event: any) => {
            return (
              event.type === EventType.REHEARSAL &&
              new Date(event.time_to) >= new Date()
            );
          }),
        );
      }
    });
  }, [setRehearsal, i18n.resolvedLanguage]);

  React.useEffect(() => {
    apiEventList().then((response) => {
      if (response.status === 200) {
        setEvents(response.data.results);
      }
    });
  }, [setEvents]);

  return (
    <>
      <Helmet>
        <title>{t("pages.home-hero.title")}</title>
        <meta
          name="description"
          content={
            t("pages.home-hero.subtitle") + " " + t("pages.home-hero.subtitle2")
          }
        />
        <meta name="og:title" content={t("pages.home-hero.title")} />
        <meta
          name="og:description"
          content={
            t("pages.home-hero.subtitle") + " " + t("pages.home-hero.subtitle2")
          }
        />
        <meta name="og:image" content={ImageHero} />
      </Helmet>
      <Box component="section" className={styles.hero}>
        <Box
          component="section"
          className={styles.heroInner}
          sx={{
            marginTop: { xs: "56px", md: "65px" },
            padding: {
              xs: messages ? "32px 0 64px 0" : "64px 0",
              md: messages ? "64px 0 132px 0" : "132px 0",
            },
          }}
        >
          <Container maxWidth="xl">
            <Alerts />
            <Grid
              container
              spacing={2}
              sx={{ textAlign: { xs: "center", md: "left" } }}
              className={styles.heroGrid}
            >
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{ marginBottom: { xs: "32px", md: "0" } }}
              >
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
                {!user && (
                  <Button
                    variant="outlined"
                    href={ROUTES["external-form-membership"].path}
                    target={"_blank"}
                    className={styles.heroButton}
                    disableElevation
                  >
                    {t("pages.home-join.list.button-join")}
                    <IconArrowOutward className={styles.externalIcon} />
                  </Button>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{ height: { xs: "300px", md: "500px" } }}
                  className={styles.heroImage}
                  style={{ backgroundImage: "url(" + ImageHero + ")" }}
                />
              </Grid>
            </Grid>
          </Container>
          <Box
            className={styles.carouselTop}
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            <ImageCarousel dense={false} />
          </Box>
        </Box>
      </Box>
      <Hero
        title={t("pages.trips-2025-berlin.title")}
        hero={ImageHeroTrips2025Berlin}
        content={
          <Box>
            <Typography
              variant="h4"
              className={styles.heroSectionSubtitle}
              marginTop="12px"
            >
              {t("pages.home-berlin.description")}
            </Typography>
            <Grid size={12} marginTop="24px">
              <Stack direction="row" spacing={2} className={styles.joinButtons}>
                <Button
                  variant="contained"
                  href={ROUTES["trips-2025-berlin"].path}
                  disableElevation
                >
                  {t("pages.home-berlin.button-page")}
                </Button>
                <Button
                  variant="contained"
                  href={ROUTES["trips-2025-berlin"].path + "#donations"}
                  disableElevation
                >
                  {t("pages.home-berlin.button-donations")}
                </Button>
                <Button
                  variant="contained"
                  href={ROUTES["external-berlin-diada-2025"].path}
                  target={"_blank"}
                  disableElevation
                >
                  {t("pages.home-berlin.button-diada")}
                  <IconArrowOutward className={styles.externalIcon} />
                </Button>
              </Stack>
            </Grid>
          </Box>
        }
      />
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
            <Grid
              size={{ xs: 12, md: 5 }}
              sx={{ display: "flex", flexDirection: "column" }}
            >
              <React.Fragment>
                <CardContent className={styles.rehearsalsCard}>
                  <IconSchedule className={styles.rehearsalsIcon} />
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight="600"
                      className={styles.rehearsalsCardTitle}
                    >
                      {rehearsal
                        ? t("pages.home-rehearsals.box1.title-rehearsal")
                        : t("pages.home-rehearsals.box1.title")}
                    </Typography>
                    <Typography className={styles.rehearsalsCardText}>
                      {rehearsal
                        ? capitalizeFirstLetter(
                            new Date(rehearsal.time_from).toLocaleDateString(
                              i18n.resolvedLanguage,
                              { weekday: "long" },
                            ),
                          ) +
                          " " +
                          capitalizeFirstLetter(
                            new Date(rehearsal.time_from).toLocaleDateString(
                              i18n.resolvedLanguage,
                              { day: "numeric", month: "long" },
                            ),
                          ) +
                          " " +
                          t("pages.home-rehearsals.box1.text1-from") +
                          " " +
                          new Date(rehearsal.time_from).toLocaleTimeString(
                            i18n.resolvedLanguage,
                            {
                              hour12: false,
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          ) +
                          " " +
                          t("pages.home-rehearsals.box1.text1-to") +
                          " " +
                          new Date(rehearsal.time_to).toLocaleTimeString(
                            i18n.resolvedLanguage,
                            {
                              hour12: false,
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : t("pages.home-rehearsals.box1.text1")}
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
                      {rehearsal ? (
                        rehearsal.location ? (
                          <>
                            {rehearsal.location.name}
                            {rehearsal.location.connections.length > 0 && (
                              <>
                                {" ("}
                                {
                                  TRANSPORT_MODE_ICON[
                                    rehearsal.location.connections[0].type
                                  ]
                                }
                                {rehearsal.location.connections[0].name}
                                {")"}
                              </>
                            )}
                          </>
                        ) : (
                          t("pages.home-rehearsals.box2.text1-location")
                        )
                      ) : (
                        <>
                          {t("pages.home-rehearsals.box2.text1-1")}
                          {" ("}
                          <IconTbana />
                          {t("pages.home-rehearsals.box2.text1-2")}
                          {")"}
                        </>
                      )}
                    </Typography>
                    {rehearsal &&
                    rehearsal.location &&
                    rehearsal.location.description ? (
                      <Typography className={styles.rehearsalsCardText2}>
                        {rehearsal.location.description}
                      </Typography>
                    ) : !rehearsal ? (
                      <Typography className={styles.rehearsalsCardText2}>
                        {t("pages.home-rehearsals.box2.text2")}
                      </Typography>
                    ) : undefined}
                  </Box>
                </CardContent>
              </React.Fragment>
              <React.Fragment>
                <CardContent className={styles.mapCard}>
                  <Map
                    location={
                      rehearsal && rehearsal.location
                        ? rehearsal.location
                        : undefined
                    }
                    coordinates={
                      rehearsal && rehearsal.location
                        ? [
                            rehearsal.location.coordinate_lat,
                            rehearsal.location.coordinate_lon,
                          ]
                        : [59.3576, 17.9941]
                    }
                    connections={
                      rehearsal &&
                      rehearsal.location &&
                      rehearsal.location.connections
                    }
                  />
                </CardContent>
              </React.Fragment>
            </Grid>
            <Grid
              size={{ xs: 12, md: 7 }}
              display={{ xs: "none", md: "initial" }}
              className={styles.calendarBox}
            >
              <Card variant="outlined" className={styles.calendarCard}>
                <EventCalendar events={events} compact={true} />
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box component="section" className={styles.join}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={4} sx={{ display: { xs: "none", md: "block" } }}>
              <Box
                className={styles.joinImage}
                style={{ backgroundImage: "url(" + ImageJoin + ")" }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography
                variant="h3"
                fontWeight="700"
                className={styles.joinTitle}
              >
                {t("pages.home-join.title")}
              </Typography>
              <Grid container spacing={1} className={styles.joinGrid}>
                <Grid size={12}>
                  <Typography
                    variant="h5"
                    fontWeight="700"
                    className={styles.joinListTitle}
                  >
                    {t("pages.home-join.list.title")}
                  </Typography>
                </Grid>
                <Grid size={12} className={styles.joinList}>
                  <List dense={true}>
                    <ListItem>
                      <ListItemIcon>
                        <IconGroups />
                      </ListItemIcon>
                      <ListItemText
                        primary={t("pages.home-join.list.item-1.title")}
                        secondary={
                          t("pages.home-join.list.item-1.subtitle")
                            ? t("pages.home-join.list.item-1.subtitle")
                            : null
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <IconSportsGymnastics />
                      </ListItemIcon>
                      <ListItemText
                        primary={t("pages.home-join.list.item-2.title")}
                        secondary={
                          t("pages.home-join.list.item-2.subtitle")
                            ? t("pages.home-join.list.item-2.subtitle")
                            : null
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <IconEmergency />
                      </ListItemIcon>
                      <ListItemText
                        primary={t("pages.home-join.list.item-3.title")}
                        secondary={
                          t("pages.home-join.list.item-3.subtitle")
                            ? t("pages.home-join.list.item-3.subtitle")
                            : null
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <IconLoyalty />
                      </ListItemIcon>
                      <ListItemText
                        primary={t("pages.home-join.list.item-4.title")}
                        secondary={
                          t("pages.home-join.list.item-4.subtitle")
                            ? t("pages.home-join.list.item-4.subtitle")
                            : null
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <IconCreditCardOff />
                      </ListItemIcon>
                      <ListItemText
                        primary={t("pages.home-join.list.item-5.title")}
                        secondary={
                          t("pages.home-join.list.item-5.subtitle")
                            ? t("pages.home-join.list.item-5.subtitle")
                            : null
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid size={12}>
                  <Typography
                    variant="h5"
                    fontWeight="700"
                    className={styles.joinListTitle}
                  >
                    {t("pages.home-join.list-like.title")}
                  </Typography>
                </Grid>
                <Grid size={12} className={styles.joinList}>
                  <List dense={true}>
                    <ListItem>
                      <ListItemIcon>
                        <IconCheckroom />
                      </ListItemIcon>
                      <ListItemText
                        primary={t("pages.home-join.list-like.item-1.title")}
                        secondary={
                          t("pages.home-join.list-like.item-1.subtitle")
                            ? t("pages.home-join.list-like.item-1.subtitle")
                            : null
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <IconPayment />
                      </ListItemIcon>
                      <ListItemText
                        primary={t("pages.home-join.list-like.item-2.title")}
                        secondary={
                          t("pages.home-join.list-like.item-2.subtitle")
                            ? t("pages.home-join.list-like.item-2.subtitle")
                            : null
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>
                {!user && (
                  <Grid size={12}>
                    <Stack
                      direction="row"
                      spacing={2}
                      className={styles.joinButtons}
                    >
                      <Button
                        variant="contained"
                        href={ROUTES["external-form-membership"].path}
                        target={"_blank"}
                        disableElevation
                      >
                        {t("pages.home-join.list.button-join")}
                        <IconArrowOutward className={styles.externalIcon} />
                      </Button>
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box component="section" className={styles.timeline}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight="700"
            className={styles.timelineTitle}
          >
            {t("pages.home-timeline.title")}
          </Typography>
          <Grid container spacing={4} className={styles.timelineGrid}>
            <Timeline position={timelineMatches ? "alternate" : "left"}>
              <TimelineItem>
                <TimelineOppositeContent
                  sx={{ m: "auto 0" }}
                  align="right"
                  variant="body2"
                  color="text.secondary"
                >
                  {t("pages.home-timeline.item-1.time")}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineConnector />
                  <TimelineDot color="primary">
                    <IconGroups className={styles.timelineIcon} />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ py: "12px", px: 2 }}>
                  <Typography variant="h6" component="span">
                    {t("pages.home-timeline.item-1.title")}
                  </Typography>
                  <Typography>
                    {t("pages.home-timeline.item-1.subtitle")}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineOppositeContent
                  sx={{ m: "auto 0" }}
                  variant="body2"
                  color="text.secondary"
                >
                  {t("pages.home-timeline.item-2.time")}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineConnector />
                  <TimelineDot color="primary">
                    <IconVisibility className={styles.timelineIcon} />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ py: "12px", px: 2 }}>
                  <Typography variant="h6" component="span">
                    {t("pages.home-timeline.item-2.title")}
                  </Typography>
                  <Typography>
                    {t("pages.home-timeline.item-2.subtitle")}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineOppositeContent
                  sx={{ m: "auto 0" }}
                  align="right"
                  variant="body2"
                  color="text.secondary"
                >
                  {t("pages.home-timeline.item-3.time")}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineConnector />
                  <TimelineDot color="primary">
                    <IconNaturePeople className={styles.timelineIcon} />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ py: "12px", px: 2 }}>
                  <Typography variant="h6" component="span">
                    {t("pages.home-timeline.item-3.title")}
                  </Typography>
                  <Typography>
                    {t("pages.home-timeline.item-3.subtitle")}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineOppositeContent
                  sx={{ m: "auto 0" }}
                  variant="body2"
                  color="text.secondary"
                >
                  {t("pages.home-timeline.item-4.time")}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineConnector />
                  <TimelineDot color="primary">
                    <IconFitnessCenter className={styles.timelineIcon} />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ py: "12px", px: 2 }}>
                  <Typography variant="h6" component="span">
                    {t("pages.home-timeline.item-4.title")}
                  </Typography>
                  <Typography>
                    {t("pages.home-timeline.item-4.subtitle")}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineOppositeContent
                  sx={{ m: "auto 0" }}
                  align="right"
                  variant="body2"
                  color="text.secondary"
                >
                  {t("pages.home-timeline.item-5.time")}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineConnector />
                  <TimelineDot color="primary">
                    <IconLocalActivity className={styles.timelineIcon} />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ py: "12px", px: 2 }}>
                  <Typography variant="h6" component="span">
                    {t("pages.home-timeline.item-5.title")}
                  </Typography>
                  <Typography>
                    {t("pages.home-timeline.item-5.subtitle")}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineOppositeContent
                  sx={{ m: "auto 0" }}
                  variant="body2"
                  color="text.secondary"
                >
                  {t("pages.home-timeline.item-6.time")}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineConnector />
                  <TimelineDot color="primary">
                    <IconAcUnit className={styles.timelineIcon} />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ py: "12px", px: 2 }}>
                  <Typography variant="h6" component="span">
                    {t("pages.home-timeline.item-6.title")}
                  </Typography>
                  <Typography>
                    {t("pages.home-timeline.item-6.subtitle")}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineOppositeContent
                  sx={{ m: "auto 0" }}
                  align="right"
                  variant="body2"
                  color="text.secondary"
                >
                  {t("pages.home-timeline.item-7.time")}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineConnector />
                  <TimelineDot color="primary">
                    <IconMic className={styles.timelineIcon} />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ py: "12px", px: 2 }}>
                  <Typography variant="h6" component="span">
                    {t("pages.home-timeline.item-7.title")}
                  </Typography>
                  <Typography>
                    {t("pages.home-timeline.item-7.subtitle")}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            </Timeline>
          </Grid>
        </Container>
      </Box>
      <Box
        component="section"
        sx={{ height: { xs: "300px", md: "750px" } }}
        className={styles.mapBox}
      >
        <Map
          location={
            rehearsal && rehearsal.location ? rehearsal.location : undefined
          }
          coordinates={
            rehearsal && rehearsal.location
              ? [
                  rehearsal.location.coordinate_lat,
                  rehearsal.location.coordinate_lon,
                ]
              : [59.3576, 17.9941]
          }
          zoom={12}
        />
      </Box>
    </>
  );
}

export default HomePage;
