import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { apiEventList, apiTowersCastleList, apiUserFamily } from "../../api";
import ImageHeroCalendar from "../../assets/images/heros/calendar.jpg";
import Grid from "@mui/material/Grid";
import Modal from "@mui/material/Modal";
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
import IconClose from "@mui/icons-material/Close";
import IconAttachFile from "@mui/icons-material/AttachFile";
import IconVisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  EventType,
  PermissionLevel,
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
import { API_EVENTS_LIST_PAGE_SIZE } from "../../consts";
import Map from "../../components/Map/Map";
import { get_event_icon, getEventUsers } from "../../utils/event";
import CastleBase from "../../components/CastleBase/CastleBase";
import EventAgenda from "../../components/EventAgenda/EventAgenda";

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

  const theme = useTheme();
  const calendarMatchesSm = useMediaQuery(theme.breakpoints.up("sm"));
  const calendarMatchesMd = useMediaQuery(theme.breakpoints.up("md"));
  const calendarMatchesLg = useMediaQuery(theme.breakpoints.up("lg"));

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
  const [eventsCastlesModalOpen, setEventsCastlesModalOpen] =
    React.useState<string>(undefined);

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
      if (calendarMatchesMd) {
        setEventsCastlesOpen((eventsCastlesOpen) => ({
          ...Object.fromEntries(
            Object.entries(eventsCastlesOpen).map(([k, v], i) => [k, false]),
          ),
          [eventId]: !eventsCastlesOpen[eventId],
        }));
        setEventsCastlesModalOpen(undefined);
      } else {
        setEventsCastlesModalOpen((eventsCastlesModalOpen) =>
          eventsCastlesModalOpen != null ? undefined : eventId,
        );
        setEventsCastlesOpen({});
      }
      setEventsRegistrationsOpen({});
      setEventsMapOpen({});
    },
    [
      setEventsCastlesOpen,
      setEventsRegistrationsOpen,
      setEventsCastlesModalOpen,
      setEventsMapOpen,
      calendarMatchesMd,
    ],
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
  }, [setEvents, i18n.resolvedLanguage, lastChanged, eventPage, token]);

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

  const castlesModal =
    eventsCastlesModalOpen != null &&
    eventsCastles &&
    eventsCastles[eventsCastlesModalOpen];
  const castlesPublishedModal = castlesModal
    ? castlesModal.filter(
        (castle: any) =>
          castle.is_published ||
          (user && user.permission_level >= PermissionLevel.ADMIN),
      )
    : undefined;

  const content = (
    <>
      {castlesPublishedModal && castlesPublishedModal.length > 0 && (
        <Modal
          open={eventsCastlesModalOpen != null}
          onClose={handleEventCastlesClick}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box className={styles.modalBox}>
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
              className={styles.modelTabs}
              sx={{
                ".Mui-selected": {
                  backgroundColor: "var(--mui-palette-primary-main)",
                  color: "var(--mui-palette-primary-contrastText) !important",
                },
              }}
            >
              {castlesPublishedModal.map((castle: any) => (
                <Tab label={castle.name} className={styles.modalTabLabel} />
              ))}
              <Button
                variant="contained"
                type="submit"
                color="primary"
                disableElevation
                className={styles.modalClose}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventCastlesClick(eventsCastlesModalOpen);
                }}
              >
                <IconClose />
              </Button>
            </Tabs>
            {castlesPublishedModal.map((castle: any, ix: number) => (
              <TabPanel value={castlePinya} index={ix}>
                <Box className={styles.modalTabContent}>
                  <CastleBase castle={castle} />
                </Box>
              </TabPanel>
            ))}
          </Box>
        </Modal>
      )}
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
          <EventAgenda />
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
