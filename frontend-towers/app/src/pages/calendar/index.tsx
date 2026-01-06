import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { apiEventList, apiTowersCastleList, apiUserFamily } from "../../api";
import ImageHeroCalendar from "../../assets/images/heros/calendar.jpg";
import Grid from "@mui/material/Grid";
import {
  Button,
  Card,
  Collapse,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import IconAttachFile from "@mui/icons-material/AttachFile";
import {
  EventType,
  REGISTRATION_STATUS_ICON,
  RegistrationStatus,
} from "../../enums";
import FormCalendarRegistrationCreate from "../../components/FormCalendarRegistrationCreate/FormCalendarRegistrationCreate";
import EventCalendar from "../../components/EventCalendar/EventCalendar";
import { useAppContext } from "../../components/AppContext/AppContext";
import { capitalizeFirstLetter } from "../../utils/string";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import { useParams, useSearchParams } from "react-router-dom";
import { useCallback } from "react";
import Pagination from "@mui/material/Pagination";
import PinyatorIframe from "../../components/PinyatorIframe/PinyatorIframe";
import { API_EVENTS_LIST_PAGE_SIZE } from "../../consts";
import Map from "../../components/Map/Map";
import { get_event_icon, getEventUsers } from "../../utils/event";

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

function CalendarPage() {
  const [t, i18n] = useTranslation("common");
  const { token } = useParams();

  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");

  const { user } = useAppContext();

  const [eventPage, setEventPage] = React.useState(1);
  const [events, setEvents] = React.useState(undefined);
  const [family, setFamily] = React.useState(undefined);

  const [lastChanged, setLastChanged] = React.useState(Date.now());
  const [isFirstLoad, setIsFirstLoad] = React.useState(true);

  const [eventsRegistrationsOpen, setEventsRegistrationsOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [eventsCastlesOpen, setEventsCastlesOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [eventsMapOpen, setEventsMapOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [eventsCastles, setEventsCastles] = React.useState<{
    [key: string]: any;
  }>({});

  const [castlePinya, setCastlePinya] = React.useState(0);

  const handleCastlePinyaChange = (
    event: React.SyntheticEvent,
    newValue: number,
  ) => {
    setCastlePinya(newValue);
  };

  const handleEventRegistrationsClick = useCallback(
    (eventId: string) => {
      setEventsRegistrationsOpen((eventsRegistrationsOpen) => ({
        ...Object.fromEntries(
          Object.entries(eventsRegistrationsOpen).map(([k, v], i) => [
            k,
            false,
          ]),
        ),
        [eventId]: !eventsRegistrationsOpen[eventId],
      }));
      setEventsCastlesOpen({});
      setEventsMapOpen({});
    },
    [setEventsRegistrationsOpen, setEventsCastlesOpen, setEventsMapOpen],
  );

  const handleEventCastlesClick = useCallback(
    (eventId: string) => {
      setEventsCastlesOpen((eventsCastlesOpen) => ({
        ...Object.fromEntries(
          Object.entries(eventsCastlesOpen).map(([k, v], i) => [k, false]),
        ),
        [eventId]: !eventsCastlesOpen[eventId],
      }));
      setEventsRegistrationsOpen({});
      setEventsMapOpen({});
    },
    [setEventsCastlesOpen, setEventsRegistrationsOpen, setEventsMapOpen],
  );

  const handleEventMapClick = useCallback(
    (eventId: string) => {
      setEventsMapOpen((eventsMapOpen) => ({
        ...Object.fromEntries(
          Object.entries(eventsMapOpen).map(([k, v], i) => [k, false]),
        ),
        [eventId]: !eventsMapOpen[eventId],
      }));
      setEventsRegistrationsOpen({});
      setEventsCastlesOpen({});
    },
    [setEventsMapOpen, setEventsCastlesOpen, setEventsRegistrationsOpen],
  );

  React.useEffect(() => {
    apiEventList(eventPage, undefined, token).then((response) => {
      if (response.status === 200) {
        setEvents(response.data);
      }
    });
  }, [setEvents, lastChanged, eventPage, token]);

  React.useEffect(() => {
    if (user && events && events.count > 0) {
      for (let i = 0; i < events.results.length; i++) {
        const event = events.results[i];
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
  }, [user, events, setEventsCastles]);

  React.useEffect(() => {
    if (user) {
      setFamily(user.family);
    } else if (token !== undefined) {
      apiUserFamily(token).then((response) => {
        if (response.status === 200) {
          setFamily(response.data);
        }
      });
    }
  }, [user, setFamily, handleEventMapClick, token, events, eventId]);

  React.useEffect(() => {
    if (isFirstLoad && events && events.results.length > 0) {
      setIsFirstLoad(false);
      handleEventMapClick(eventId ? eventId : events.results[0].id);
    }
  }, [handleEventMapClick, events, eventId, isFirstLoad]);

  const theme = useTheme();
  const calendarMatchesSm = useMediaQuery(theme.breakpoints.up("sm"));
  const calendarMatchesLg = useMediaQuery(theme.breakpoints.up("lg"));

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
          size={{ xs: 12, md: 6 }}
          order={{ xs: 1, md: 2 }}
          spacing={4}
          direction="column"
        >
          {events && events.count > 0 && (
            <>
              <Grid container spacing={2} maxWidth="100%">
                {events.results.map((event: any, i: number, row: any) => {
                  const castles = eventsCastles[event.id];
                  const castlesPublished = castles
                    ? castles.filter((castle: any) => castle.is_published)
                    : undefined;

                  const registrationByUserId = Object.fromEntries(
                    event.registrations.map((registration: any) => [
                      registration.user.id,
                      registration,
                    ]),
                  );

                  const eventUsers =
                    family &&
                    getEventUsers(
                      event,
                      family.members.map((member: any) => member.user),
                    );

                  return (
                    <Grid
                      key={event.id}
                      className={styles.eventGrid}
                      display="flex"
                      alignItems="stretch"
                    >
                      <Card variant="outlined" className={styles.eventCard}>
                        <ListItemButton
                          onClick={() => {
                            if (!eventsMapOpen[event.id]) {
                              handleEventMapClick(event.id);
                            } else {
                              setEventsRegistrationsOpen({});
                              setEventsCastlesOpen({});
                              setEventsMapOpen({});
                            }
                          }}
                          dense
                        >
                          <ListItemIcon className={styles.eventCardIcon}>
                            {get_event_icon(event.type, event.modules)}
                          </ListItemIcon>
                          <Box
                            className={styles.eventCardInner}
                            flexDirection={{ xs: "column", lg: "row" }}
                            alignItems={{ xs: "start", lg: "center" }}
                          >
                            <ListItemText
                              className={styles.eventCardListItem}
                              disableTypography
                              primary={
                                <Typography variant="body2">
                                  {event.title +
                                    ((event.type === EventType.REHEARSAL ||
                                      event.type === EventType.WORKSHOP) &&
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
                                    <Box className={styles.eventCastlesBox}>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        display="inline-flex"
                                      >
                                        {t(
                                          "pages.calendar.section.agenda.castles",
                                        )}
                                        {": "}
                                      </Typography>
                                      {castles.map(
                                        (castle: any, i: number, row: any) => {
                                          return (
                                            <Typography
                                              variant="body2"
                                              color="textSecondary"
                                              className={styles.eventCastleBox}
                                              key={i}
                                            >
                                              <span>{castle.name}</span>
                                              {castle.is_published && (
                                                <>
                                                  {" ("}
                                                  <IconAttachFile />
                                                  {")"}
                                                </>
                                              )}
                                              {i + 1 < row.length && ", "}
                                            </Typography>
                                          );
                                        },
                                      )}
                                    </Box>
                                  )}
                                  {eventUsers &&
                                    eventUsers.length > 0 &&
                                    event.require_signup && (
                                      <Collapse
                                        in={!eventsRegistrationsOpen[event.id]}
                                        timeout="auto"
                                        unmountOnExit
                                      >
                                        <Box
                                          className={
                                            styles.eventRegistrationsBox
                                          }
                                        >
                                          {eventUsers.map((eventUser: any) => {
                                            const registration =
                                              registrationByUserId[
                                                eventUser.id
                                              ];
                                            return (
                                              <Box
                                                key={eventUser.id}
                                                className={
                                                  styles.eventRegistrationBox
                                                }
                                                style={{
                                                  color: registration
                                                    ? registration.status ===
                                                      RegistrationStatus.ACTIVE
                                                      ? "var(--mui-palette-success-main)"
                                                      : "var(--mui-palette-error-main)"
                                                    : "var(--mui-palette-secondary-main)",
                                                  whiteSpace: "nowrap",
                                                }}
                                              >
                                                {
                                                  REGISTRATION_STATUS_ICON[
                                                    registration
                                                      ? registration.status
                                                      : RegistrationStatus.REQUESTED
                                                  ]
                                                }
                                                <Typography variant="body2">
                                                  {family.members.length > 1
                                                    ? eventUser.lastname
                                                      ? eventUser.firstname +
                                                        " " +
                                                        eventUser.lastname
                                                      : eventUser.firstname
                                                    : registration &&
                                                        registration.status ===
                                                          RegistrationStatus.ACTIVE
                                                      ? t(
                                                          "pages.calendar.section.agenda.event.attendance-attending",
                                                        )
                                                      : t(
                                                          "pages.calendar.section.agenda.event.attendance-not-attending",
                                                        )}
                                                </Typography>
                                              </Box>
                                            );
                                          })}{" "}
                                        </Box>
                                      </Collapse>
                                    )}
                                </>
                              }
                            />
                            {((family && event.require_signup) ||
                              (user &&
                                castlesPublished &&
                                castlesPublished.length > 0)) && (
                              <Stack
                                direction={
                                  calendarMatchesSm
                                    ? calendarMatchesLg
                                      ? "column"
                                      : "row"
                                    : "column"
                                }
                                spacing={2}
                                marginLeft={{ xs: "0", lg: "16px" }}
                                marginTop="8px"
                                marginBottom="8px"
                                whiteSpace="nowrap"
                              >
                                {eventUsers &&
                                  eventUsers.length > 0 &&
                                  event.require_signup &&
                                  !event.require_approve && (
                                    <Button
                                      variant="contained"
                                      type="submit"
                                      style={{ width: "auto" }}
                                      color={
                                        eventsRegistrationsOpen[event.id]
                                          ? "secondary"
                                          : "primary"
                                      }
                                      disableElevation
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEventRegistrationsClick(event.id);
                                      }}
                                    >
                                      {eventsRegistrationsOpen[event.id]
                                        ? t(
                                            "pages.calendar.section.agenda.event.attendance-hide",
                                          )
                                        : t(
                                            "pages.calendar.section.agenda.event.attendance-show",
                                          )}
                                    </Button>
                                  )}
                                {eventUsers &&
                                  eventUsers.length > 0 &&
                                  user &&
                                  castlesPublished &&
                                  castlesPublished.length > 0 && (
                                    <Button
                                      variant="contained"
                                      type="submit"
                                      style={{ width: "auto" }}
                                      color={
                                        eventsCastlesOpen[event.id]
                                          ? "secondary"
                                          : "primary"
                                      }
                                      disableElevation
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEventCastlesClick(event.id);
                                      }}
                                    >
                                      {eventsCastlesOpen[event.id]
                                        ? t(
                                            "pages.calendar.section.agenda.event.castles-hide",
                                          )
                                        : t(
                                            "pages.calendar.section.agenda.event.castles-show",
                                          )}
                                    </Button>
                                  )}
                              </Stack>
                            )}
                          </Box>
                        </ListItemButton>
                        {eventUsers &&
                          eventUsers.length > 0 &&
                          event.require_signup && (
                            <Collapse
                              in={eventsRegistrationsOpen[event.id]}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Divider />
                              <Box className={styles.calendarAttendanceUpdate}>
                                <Typography fontWeight={600}>
                                  {t("pages.calendar.agenda.attendance")}
                                </Typography>
                                <FormCalendarRegistrationCreate
                                  event={event}
                                  users={eventUsers}
                                  token={token}
                                  setLastChanged={setLastChanged}
                                />
                              </Box>
                            </Collapse>
                          )}
                        {eventUsers &&
                          eventUsers.length > 0 &&
                          castles &&
                          castles.length > 0 && (
                            <Collapse
                              in={eventsCastlesOpen[event.id]}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Divider />
                              <Tabs
                                value={castlePinya}
                                onChange={handleCastlePinyaChange}
                                variant="scrollable"
                                scrollButtons={false}
                                allowScrollButtonsMobile
                                indicatorColor="primary"
                                TabIndicatorProps={{
                                  style: { display: "none" },
                                }}
                                sx={{
                                  ".Mui-selected": {
                                    backgroundColor:
                                      "var(--mui-palette-primary-main)",
                                    color:
                                      "var(--mui-palette-primary-contrastText) !important",
                                  },
                                }}
                              >
                                {castlesPublished.map((castle: any) => (
                                  <Tab label={castle.name} />
                                ))}
                              </Tabs>
                              <Divider />
                              {castlesPublished.map(
                                (castle: any, ix: number) => (
                                  <TabPanel value={castlePinya} index={ix}>
                                    <PinyatorIframe castle={castle} />
                                  </TabPanel>
                                ),
                              )}
                            </Collapse>
                          )}
                        {event.location !== null && (
                          <Collapse
                            in={eventsMapOpen[event.id]}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Divider />
                            <Box className={styles.calendarMap}>
                              <Map
                                location={event.location}
                                coordinates={[
                                  event.location.coordinate_lat,
                                  event.location.coordinate_lon,
                                ]}
                                connections={event.location.connections}
                              />
                            </Box>
                          </Collapse>
                        )}
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
              {events &&
                events.results.length > 0 &&
                (eventPage !== 1 || events.count > events.results.length) && (
                  <Stack alignItems="center">
                    <Pagination
                      count={Math.ceil(
                        events.count / API_EVENTS_LIST_PAGE_SIZE,
                      )}
                      onChange={(e: any, value: number) => setEventPage(value)}
                    />
                  </Stack>
                )}
            </>
          )}
        </Grid>
        <Grid
          container
          size={{ xs: 12, md: 6 }}
          display={{ xs: "none", md: "initial" }}
          spacing={4}
          direction="column"
        >
          <Grid>
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
              <Box>
                <EventCalendar compact={false} lastChanged={lastChanged} />
              </Box>
            </Card>
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
      loading={!events}
    />
  );
}

export default CalendarPage;
