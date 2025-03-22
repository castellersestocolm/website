import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { apiEventList } from "../../api";
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

function CalendarPage() {
  const [t, i18n] = useTranslation("common");

  const { user, rehearsal, setRehearsal } = useAppContext();

  const [eventsOpen, setEventsOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [events, setEvents] = React.useState(undefined);
  const [nextEvents, setNextEvents] = React.useState(undefined);

  const handleEventClick = (eventId: string) => {
    setEventsOpen({
      ...Object.fromEntries(
        Object.entries(eventsOpen).map(([k, v], i) => [k, false]),
      ),
      [eventId]: !eventsOpen[eventId],
    });
  };

  React.useEffect(() => {
    apiEventList().then((response) => {
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
  }, [setEvents, setNextEvents, setRehearsal]);

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
                    {nextEvents.map((event: any, i: number, row: any) => (
                      <Box key={event.id}>
                        <ListItemButton
                          onClick={() => handleEventClick(event.id)}
                          dense={true}
                        >
                          <ListItemIcon>
                            {EVENT_TYPE_ICON[event.type]}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              event.title +
                              (event.type === EventType.REHEARSAL &&
                              event.location !== null
                                ? " — " + event.location.name
                                : "")
                            }
                            secondary={
                              capitalizeFirstLetter(
                                new Date(event.time_from).toLocaleDateString(
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
                              new Date(event.time_to).toTimeString().slice(0, 5)
                            }
                          />
                          {user &&
                            event.require_signup &&
                            (eventsOpen[event.id] ? (
                              <IconExpandLess />
                            ) : (
                              <IconExpandMore />
                            ))}
                        </ListItemButton>
                        {user && event.require_signup && (
                          <Collapse
                            in={eventsOpen[event.id]}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box className={styles.calendarAttendanceUpdate}>
                              <Typography fontWeight={600} marginBottom="4px">
                                {t("pages.calendar.agenda.attendance")}
                              </Typography>
                              <FormCalendarRegistrationCreate event={event} />
                            </Box>
                          </Collapse>
                        )}

                        {i + 1 < row.length && <Divider />}
                      </Box>
                    ))}
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
