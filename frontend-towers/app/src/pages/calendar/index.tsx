import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { apiEventList, apiTowersCastleList, apiUserFamily } from "../../api";
import ImageHeroCalendar from "../../assets/images/heros/calendar.jpg";
import Grid from "@mui/material/Grid2";
import {
  Card,
  Collapse,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import IconExpandLess from "@mui/icons-material/ExpandLess";
import IconExpandMore from "@mui/icons-material/ExpandMore";
import { EVENT_TYPE_ICON, EventType } from "../../enums";
import FormCalendarRegistrationCreate from "../../components/FormCalendarRegistrationCreate/FormCalendarRegistrationCreate";
import EventCalendar from "../../components/EventCalendar/EventCalendar";
import Map from "../../components/Map/Map";
import { useAppContext } from "../../components/AppContext/AppContext";
import { capitalizeFirstLetter } from "../../utils/string";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import { useParams, useSearchParams } from "react-router-dom";
import { useCallback } from "react";

function CalendarPage() {
  const [t, i18n] = useTranslation("common");
  const { token } = useParams();

  const { user, rehearsal, setRehearsal } = useAppContext();

  const [eventsOpen, setEventsOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [events, setEvents] = React.useState(undefined);
  const [family, setFamily] = React.useState(undefined);
  const [nextEvents, setNextEvents] = React.useState(undefined);

  const [eventsCastles, setEventsCastles] = React.useState<{
    [key: string]: any;
  }>({});

  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");

  const handleEventClick = useCallback(
    (eventId: string) => {
      setEventsOpen((eventsOpen) => ({
        ...Object.fromEntries(
          Object.entries(eventsOpen).map(([k, v], i) => [k, false]),
        ),
        [eventId]: !eventsOpen[eventId],
      }));
    },
    [setEventsOpen],
  );

  React.useEffect(() => {
    apiEventList(token).then((response) => {
      if (response.status === 200) {
        setEvents(response.data.results);
        setNextEvents(
          response.data.results
            .filter((event: any) => {
              return new Date(event.time_to) >= new Date();
            })
            .slice(0, 5),
        );
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
  }, [setEvents, setNextEvents, setRehearsal, token]);

  React.useEffect(() => {
    if (events) {
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        apiTowersCastleList(event.id).then((response) => {
          if (response.status === 200) {
            setEventsCastles((eventsCastles) => ({
              ...eventsCastles,
              [event.id]: response.data.results,
            }));
          }
        });
      }
    }
  }, [events, setEventsCastles]);

  console.log(eventsCastles);

  React.useEffect(() => {
    if (user) {
      setFamily(user.family);
      if (nextEvents) {
        handleEventClick(eventId || nextEvents[0].id);
      }
    } else if (token !== undefined) {
      apiUserFamily(token).then((response) => {
        if (response.status === 200) {
          setFamily(response.data);
          if (nextEvents) {
            handleEventClick(eventId || nextEvents[0].id);
          }
        }
      });
    }
  }, [user, setFamily, eventId, handleEventClick, nextEvents, token]);

  const content = (
    <>
      <Typography
        variant="h4"
        fontWeight="700"
        align="center"
        marginBottom="48px"
      >
        {t("pages.calendar.subtitle")}
      </Typography>
      <Grid
        container
        spacing={4}
        className={styles.dashboardGrid}
        display="flex"
        alignItems="stretch"
      >
        <Grid
          container
          size={{ xs: 12, md: 8 }}
          order={{ xs: 2, md: 1 }}
          display={{ xs: "none", md: "initial" }}
          spacing={4}
          direction="column"
        >
          <Card
            variant="outlined"
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Box className={styles.userTopBox}>
              <Typography variant="h6" fontWeight="600" component="div">
                {t("pages.calendar.section.calendar.month")}
              </Typography>
            </Box>
            <Divider />
            <Box className={styles.calendarBox}>
              <EventCalendar events={events} compact={false} />
            </Box>
          </Card>
        </Grid>
        <Grid
          container
          size={{ xs: 12, md: 4 }}
          order={{ xs: 1, md: 2 }}
          spacing={4}
          direction="column"
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Grid>
            <Card variant="outlined">
              <Box className={styles.userTopBox}>
                <Typography variant="h6" fontWeight="600" component="div">
                  {t("pages.calendar.section.agenda.title")}
                </Typography>
              </Box>
              <Divider />
              <Box className={styles.userFamilyBox}>
                {nextEvents && nextEvents.length > 0 ? (
                  <List className={styles.userFamilyList}>
                    {nextEvents.map((event: any, i: number, row: any) => {
                      const castles = eventsCastles[event.id];

                      return (
                        <Box key={event.id}>
                          <ListItemButton
                            onClick={() => handleEventClick(event.id)}
                            dense={true}
                          >
                            <ListItemIcon>
                              {EVENT_TYPE_ICON[event.type]}
                            </ListItemIcon>
                            <ListItemText
                              disableTypography
                              primary={
                                <Typography variant="body2">
                                  {event.title +
                                    (event.type === EventType.REHEARSAL &&
                                    event.location !== null
                                      ? " — " + event.location.name
                                      : "")}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    {capitalizeFirstLetter(
                                      new Date(
                                        event.time_from,
                                      ).toLocaleDateString(
                                        i18n.resolvedLanguage,
                                        {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                        },
                                      ),
                                    ) +
                                      " " +
                                      new Date(event.time_from)
                                        .toTimeString()
                                        .slice(0, 5) +
                                      " → " +
                                      new Date(event.time_to)
                                        .toTimeString()
                                        .slice(0, 5)}
                                  </Typography>
                                  {castles && castles.length > 0 && (
                                    <Typography
                                      variant="body2"
                                      color="textSecondary"
                                    >
                                      {t(
                                        "pages.calendar.section.agenda.castles",
                                      )}
                                      {": "}
                                      {castles
                                        .map((castle: any) => castle.name)
                                        .join(", ")}
                                    </Typography>
                                  )}
                                </>
                              }
                            />
                            {family &&
                              event.require_signup &&
                              (eventsOpen[event.id] ? (
                                <IconExpandLess />
                              ) : (
                                <IconExpandMore />
                              ))}
                          </ListItemButton>
                          {family && event.require_signup && (
                            <Collapse
                              in={eventsOpen[event.id]}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box className={styles.calendarAttendanceUpdate}>
                                <Typography fontWeight={600} marginBottom="4px">
                                  {t("pages.calendar.agenda.attendance")}
                                </Typography>
                                <FormCalendarRegistrationCreate
                                  event={event}
                                  family={family}
                                  token={token}
                                />
                              </Box>
                            </Collapse>
                          )}

                          {i + 1 < row.length && <Divider />}
                        </Box>
                      );
                    })}
                  </List>
                ) : (
                  <Box className={styles.userFamilyEmpty}>
                    <Typography component="div">
                      {t("pages.calendar.section.agenda.empty")}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
          <Grid className={styles.mapCard}>
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
              connections={
                rehearsal &&
                rehearsal.location &&
                rehearsal.location.connections
              }
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );

  return (
    <PageImageHero
      title={t("pages.calendar.title")}
      content={content}
      hero={ImageHeroCalendar}
    />
  );
}

export default CalendarPage;
