import Box from "@mui/material/Box";
import ImageHero from "../../assets/images/hero.jpg";
import ImageJoin from "../../assets/images/join3.jpg";
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
import Grid from "@mui/material/Grid";
import IconSchedule from "@mui/icons-material/Schedule";
import IconPlace from "@mui/icons-material/Place";
import IconGroups from "@mui/icons-material/Groups";
import IconSportsGymnastics from "@mui/icons-material/SportsGymnastics";
import IconEmergency from "@mui/icons-material/Emergency";
import IconLoyalty from "@mui/icons-material/Loyalty";
import IconCreditCardOff from "@mui/icons-material/CreditCardOff";
import IconCheckroom from "@mui/icons-material/Checkroom";
import IconPayment from "@mui/icons-material/Payment";
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
import { apiEventList, apiHistoryEventGroupList } from "../../api";
import { EventType, TRANSPORT_MODE_ICON } from "../../enums";
import { capitalizeFirstLetter } from "../../utils/string";
import EventCalendar from "../../components/EventCalendar/EventCalendar";
import Map from "../../components/Map/Map";
import { LoaderClip } from "../../components/LoaderClip/LoaderClip";
import markdown from "@wcj/markdown-to-html";
import Pagination from "@mui/material/Pagination";
import { API_HISTORY_EVENT_LIST_PAGE_SIZE } from "../../consts";
import { DynamicIcon } from "../../components/DynamicIcon/DynamicIcon";

function HomePage() {
  const [t, i18n] = useTranslation("common");

  const { user, messages, rehearsal, setRehearsal } = useAppContext();

  const theme = useTheme();
  const timelineMatches = useMediaQuery(theme.breakpoints.up("md"));

  const [historyEventsPage, setHistoryEventsPage] = React.useState(1);
  const [historyEvents, setHistoryEvents] = React.useState(undefined);

  React.useEffect(() => {
    apiHistoryEventGroupList(historyEventsPage).then((response) => {
      if (response.status === 200) {
        setHistoryEvents(response.data);
      }
    });
  }, [setHistoryEvents, historyEventsPage, i18n.resolvedLanguage]);

  React.useEffect(() => {
    apiEventList().then((response) => {
      if (response.status === 200) {
        setRehearsal(
          response.data.results.find((event: any) => {
            return (
              (event.type === EventType.REHEARSAL ||
                event.type === EventType.PERFORMANCE) &&
              new Date(event.time_to) >= new Date()
            );
          }),
        );
      }
    });
  }, [setRehearsal, i18n.resolvedLanguage]);

  return (
    <>
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
          <Container
            maxWidth="xl"
            sx={{
              position: "relative",
            }}
          >
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
                    href={ROUTES["user-join"].path}
                    target={"_self"}
                    className={styles.heroButton}
                    disableElevation
                  >
                    {t("pages.home-join.list.button-join")}
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
      {/*<Hero
        title={t("pages.calendar-2025-09-07-diada-performance.title")}
        hero={ImageHeroCalendarDiada}
        content={
          <Box>
            <Typography
              variant="h4"
              className={styles.heroSectionSubtitle}
              marginTop="12px"
            >
              {t("pages.home-311-diada.description")}
            </Typography>
            <Grid size={12} marginTop="24px">
              <Stack direction="row" spacing={2} className={styles.joinButtons}>
                <Button
                  variant="contained"
                  href={ROUTES["calendar-event"].path
                    .replace(":year", "2025")
                    .replace(":month", "09")
                    .replace(":day", "07")
                    .replace(":code", "diada-performance")}
                  disableElevation
                >
                  {t("pages.home-berlin.button-diada")}
                </Button>
                <Button
                  variant="contained"
                  href={ROUTES.calendar.path}
                  disableElevation
                >
                  {t("pages.calendar.title")}
                </Button>
              </Stack>
            </Grid>
          </Box>
        }
      />*/}
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
                <EventCalendar compact={true} />
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
                        href={ROUTES["user-join"].path}
                        target={"_self"}
                        disableElevation
                      >
                        {t("pages.home-join.list.button-join")}
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
          <Grid
            container
            spacing={2}
            direction="column"
            className={styles.timelineGrid}
          >
            {historyEvents && historyEvents.results.length > 0 ? (
              <Timeline position={timelineMatches ? "alternate" : "left"}>
                {historyEvents.results.map((historyEvent: any) => {
                  return (
                    <TimelineItem key={historyEvent.id}>
                      <TimelineOppositeContent
                        sx={{ m: "auto 0" }}
                        align="right"
                        variant="body2"
                        color="textSecondary"
                      >
                        {capitalizeFirstLetter(
                          new Date(historyEvent.date).toLocaleDateString(
                            i18n.resolvedLanguage,
                            {
                              month: "long",
                              year: "numeric",
                            },
                          ),
                        )}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineConnector />
                        <TimelineDot
                          color="primary"
                          style={{ boxShadow: "none" }}
                          className={styles.timetableIcon}
                        >
                          <DynamicIcon iconName={historyEvent.icon} />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent sx={{ py: "12px", px: 2 }}>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          className={styles.timelineItemTitle}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: markdown(historyEvent.title).toString(),
                            }}
                          ></div>
                        </Typography>
                        <Typography
                          variant="body1"
                          className={styles.timelineItemDescription}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: markdown(
                                historyEvent.description,
                              ).toString(),
                            }}
                          ></div>
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  );
                })}
              </Timeline>
            ) : (
              <Box className={styles.loader}>
                <LoaderClip />
              </Box>
            )}
            {historyEvents &&
              historyEvents.results.length > 0 &&
              (historyEventsPage !== 1 ||
                historyEvents.count > historyEvents.results.length) && (
                <Stack
                  alignItems="center"
                  className={styles.timelinePagination}
                >
                  <Pagination
                    page={historyEventsPage}
                    count={Math.ceil(
                      historyEvents.count / API_HISTORY_EVENT_LIST_PAGE_SIZE,
                    )}
                    onChange={(e: any, value: number) =>
                      setHistoryEventsPage(value)
                    }
                  />
                </Stack>
              )}
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
