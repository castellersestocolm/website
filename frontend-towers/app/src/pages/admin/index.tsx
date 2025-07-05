import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../components/AppContext/AppContext";
import Grid from "@mui/material/Grid";
import {
  Card,
  Divider,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography, useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import PageAdmin from "../../components/PageAdmin/PageAdmin";
import { apiEventList, apiEventRegistrationList, apiUserList } from "../../api";
import { getEventsCount } from "../../utils/admin";
import {EVENT_TYPE_ICON, EventType, RegistrationStatus} from "../../enums";
import { capitalizeFirstLetter } from "../../utils/string";
import IconKeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import IcconPerson from "@mui/icons-material/Person";
import IconEscalatorWarning from "@mui/icons-material/EscalatorWarning";
import {LineChart} from "@mui/x-charts";

function AdminPage() {
  const theme = useTheme();

  const [t, i18n] = useTranslation("common");

  const { user } = useAppContext();
  let navigate = useNavigate();

  const [events, setEvents] = React.useState(undefined);
  const [users, setUsers] = React.useState(undefined);
  const [registrations, setRegistrations] = React.useState(undefined);
  const [statEvents, setStatEvents] = React.useState(undefined);
  const [statRegistrations, setStatRegistrations] = React.useState(undefined);

  React.useEffect(() => {
    apiEventList().then((response) => {
      if (response.status === 200) {
        setEvents(response.data);
      }
    });
  }, [setEvents]);

  React.useEffect(() => {
    apiEventList(1, 10, undefined, (new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).toISOString().substring(0, 10)).then((response) => {
      if (response.status === 200) {
        setStatEvents(response.data);
      }
    });
  }, [setStatEvents]);

  React.useEffect(() => {
    apiUserList().then((response) => {
      if (response.status === 200) {
        setUsers(response.data);
      }
    });
  }, [setUsers]);

  React.useEffect(() => {
    if (events && events.results.length > 0) {
      for (let i = 0; i < events.results.length; i++) {
        const event = events.results[i];
        apiEventRegistrationList(event.id, true).then((response) => {
          if (response.status === 200) {
            setRegistrations((registrations: any) => ({
              ...registrations,
              [event.id]: Object.fromEntries(
                response.data.map((registration: any) => [
                  registration.user.id,
                  registration,
                ]),
              ),
            }));
          }
        });
      }
    }
  }, [events, setRegistrations]);

  React.useEffect(() => {
    if (statEvents && statEvents.results.length > 0) {
      for (let i = 0; i < statEvents.results.length; i++) {
        const event = statEvents.results[i];
        apiEventRegistrationList(event.id, true).then((response) => {
          if (response.status === 200) {
            setStatRegistrations((registrations: any) => ({
              ...registrations,
              [event.id]: Object.fromEntries(
                response.data.map((registration: any) => [
                  registration.user.id,
                  registration,
                ]),
              ),
            }));
          }
        });
      }
    }
  }, [statEvents, setStatRegistrations]);

  const userChildren: any[] =
    users && users.filter((user: any) => !user.can_manage);

  const userAdults: any[] =
    users && users.filter((user: any) => user.can_manage);

  const eventsCountAdults = getEventsCount(events, registrations, userAdults);
  const eventsCountChildren = getEventsCount(
    events,
    registrations,
    userChildren,
  );
  const statEventsCount = getEventsCount(statEvents, statRegistrations, users);

  function handleAdminAttendanceSubmit() {
    navigate(ROUTES["admin-attendance"].path, { replace: true });
  }

  const content = user && (
    <Grid container spacing={4} className={styles.adminGrid}>
      <Grid container size={{ xs: 12, md: 6 }} spacing={4} direction="row">
        <Card variant="outlined" className={styles.adminCard}>
          <Link
            color="textPrimary"
            underline="none"
            component="button"
            onClick={handleAdminAttendanceSubmit}
            className={styles.adminTitleLink}
          >
            <Box className={styles.adminTopBoxLink}>
              <Typography variant="h6" fontWeight="600" component="div">
                {t("pages.admin.attendance-table.title")}
              </Typography>
              <IconKeyboardArrowRight className={styles.adminTitleIcon} />
            </Box>
          </Link>
          <Box>
            <List className={styles.adminList}>
              {events &&
                events.results.length > 0 &&
                events.results.map((event: any, i: number, row: any) => {
                  return (
                    <>
                      <ListItemButton disableTouchRipple dense>
                        <ListItemIcon className={styles.eventCardIcon}>
                          {EVENT_TYPE_ICON[event.type]}
                        </ListItemIcon>
                        <Box
                          className={styles.userFamilyListInner}
                          flexDirection={{ xs: "column", lg: "row" }}
                          alignItems={{ xs: "start", lg: "center" }}
                        >
                          <ListItemText
                            className={styles.userFamilyListItem}
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
                              <Typography variant="body2" color="textSecondary">
                                {capitalizeFirstLetter(
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
                                  new Date(event.time_to)
                                    .toTimeString()
                                    .slice(0, 5)}
                              </Typography>
                            }
                          ></ListItemText>
                        </Box>
                        {users && (
                          <Stack
                            direction="row"
                            spacing={2}
                            marginLeft={{ xs: "0", lg: "16px" }}
                            marginTop={{ xs: "8px", lg: "0" }}
                            marginBottom={{ xs: "8px", lg: "0" }}
                            whiteSpace="nowrap"
                          >
                            {eventsCountAdults &&
                              event.id in eventsCountAdults && (
                                <Box className={styles.eventCountBox}>
                                  <IcconPerson
                                    className={styles.eventCountIcon}
                                    color={
                                      eventsCountAdults[event.id][0] >= 10 ||
                                      eventsCountAdults[event.id][0] >=
                                        userAdults.length / 2
                                        ? "success"
                                        : eventsCountAdults[event.id][2] >=
                                            userAdults.length / 2
                                          ? "secondary"
                                          : "error"
                                    }
                                  />
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    {eventsCountAdults[event.id].join("/")}
                                  </Typography>
                                </Box>
                              )}
                            {eventsCountChildren &&
                              event.id in eventsCountChildren && (
                                <Box className={styles.eventCountBox}>
                                  <IconEscalatorWarning
                                    className={styles.eventCountIcon}
                                    color={
                                      eventsCountChildren[event.id][0] >= 2 ||
                                      eventsCountChildren[event.id][0] >=
                                        userChildren.length / 2
                                        ? "success"
                                        : eventsCountChildren[event.id][2] >=
                                            userChildren.length / 2
                                          ? "secondary"
                                          : "error"
                                    }
                                  />
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    {eventsCountChildren[event.id].join("/")}
                                  </Typography>
                                </Box>
                              )}
                          </Stack>
                        )}
                      </ListItemButton>
                      {i + 1 < row.length && <Divider />}
                    </>
                  );
                })}
            </List>
          </Box>
        </Card>
      </Grid>
      <Grid container size={{ xs: 12, md: 6 }} spacing={4} direction="row">
        <Card variant="outlined" className={styles.adminCard}>
          <Link
            color="textPrimary"
            underline="none"
            component="button"
            className={styles.adminTitleLink}
          >
            <Box className={styles.adminTopBoxLink}>
              <Typography variant="h6" fontWeight="600" component="div">
                {t("pages.admin.events-table.title")}
              </Typography>
              <IconKeyboardArrowRight className={styles.adminTitleIcon} />
            </Box>
          </Link>
          <Box className={styles.adminBox}>
            <Typography variant="body2" component="div">
              Coming soon...
            </Typography>
          </Box>
        </Card>
      </Grid>
      <Grid container size={{ xs: 12, md: 6 }} spacing={4} direction="row">
        <Card variant="outlined" className={styles.adminCard}>
          <Link
            color="textPrimary"
            underline="none"
            component="button"
            className={styles.adminTitleLink}
          >
            <Box className={styles.adminTopBoxLink}>
              <Typography variant="h6" fontWeight="600" component="div">
                {t("pages.admin.equipment-table.title")}
              </Typography>
              <IconKeyboardArrowRight className={styles.adminTitleIcon} />
            </Box>
          </Link>
          <Box className={styles.adminBox}>
            <Typography variant="body2" component="div">
              Coming soon...
            </Typography>
          </Box>
        </Card>
      </Grid>
      <Grid container size={{ xs: 12, md: 6 }} spacing={4} direction="row">
        <Card variant="outlined" className={styles.adminCard}>
          <Link
            color="textPrimary"
            underline="none"
            component="button"
            className={styles.adminTitleLink}
          >
            <Box className={styles.adminTopBoxLink}>
              <Typography variant="h6" fontWeight="600" component="div">
                {t("pages.admin.users-table.title")}
              </Typography>
              <IconKeyboardArrowRight className={styles.adminTitleIcon} />
            </Box>
          </Link>
          <Box className={styles.adminBox}>
            <Typography variant="body2" component="div">
              Coming soon...
            </Typography>
          </Box>
        </Card>
      </Grid>
      <Grid container size={{ xs: 12, md: 12 }} spacing={4} direction="row">
        <Card variant="outlined" className={styles.adminCard}>
          <Link
            color="textPrimary"
            underline="none"
            component="button"
            className={styles.adminTitleLink}
          >
            <Box className={styles.adminTopBoxLink}>
              <Typography variant="h6" fontWeight="600" component="div">
                {t("pages.admin.stats-table.title")}
              </Typography>
              <IconKeyboardArrowRight className={styles.adminTitleIcon} />
            </Box>
          </Link>
          <Box className={styles.adminBox}>
            {statEvents && statEvents.results.length > 0 && statEventsCount && <Box mt={1}>
            <Typography variant="body1" fontWeight="600" component="div" textAlign="center">
              {t("pages.admin.stats-table.attendance-title")}
            </Typography>
              <LineChart
              xAxis={[{
                data: statEvents.results.map((event: any) => new Date(event.time_from)),
                valueFormatter: (date: string) => (new Date(date)).toISOString().substring(0, 10),
              }]}
              series={[
                {
                  id: RegistrationStatus.CANCELLED,
                  label: t("enums.registration-status.30"),
                  data: statEvents.results.map((event: any) => event.id in statEventsCount ? statEventsCount[event.id][1] : 0),
                  area: true,
                  showMark: false,
                  stack: "total",
                  color: theme.palette.error.main,
                },
                {
                  id: 0,
                  label: t("enums.registration-status.0"),
                  data: statEvents.results.map((event: any) => event.id in statEventsCount ? statEventsCount[event.id][2] : 0),
                  area: true,
                  showMark: false,
                  stack: "total",
                  color: theme.palette.secondary.main,
                },
                {
                  id: RegistrationStatus.ACTIVE,
                  label: t("enums.registration-status.20"),
                  data: statEvents.results.map((event: any) => event.id in statEventsCount ? statEventsCount[event.id][0] : 0),
                  area: true,
                  showMark: false,
                  stack: "total",
                  color: theme.palette.success.main,
                },
              ]}
              height={300}
            /></Box>}
          </Box>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <PageAdmin
      title={t("pages.admin.title")}
      content={content}
      finishedRegistration={true}
    />
  );
}

export default AdminPage;
