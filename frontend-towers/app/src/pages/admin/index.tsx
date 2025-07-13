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
  Typography,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import PageAdmin from "../../components/PageAdmin/PageAdmin";
import { apiEventList, apiProductList, apiUserList } from "../../api";
import { EVENT_TYPE_ICON, EventType, RegistrationStatus } from "../../enums";
import { capitalizeFirstLetter } from "../../utils/string";
import IconKeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import IcconPerson from "@mui/icons-material/Person";
import IconEscalatorWarning from "@mui/icons-material/EscalatorWarning";
import IconHideImage from "@mui/icons-material/HideImage";
import { LineChart } from "@mui/x-charts";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_API_BASE_URL).origin;

function AdminPage() {
  const theme = useTheme();

  const [t, i18n] = useTranslation("common");

  const { user } = useAppContext();
  let navigate = useNavigate();

  const [events, setEvents] = React.useState(undefined);
  const [users, setUsers] = React.useState(undefined);
  const [statEvents, setStatEvents] = React.useState(undefined);
  const [products, setProducts] = React.useState(undefined);

  React.useEffect(() => {
    apiEventList(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true,
    ).then((response) => {
      if (response.status === 200) {
        setEvents(response.data);
      }
    });
  }, [setEvents]);

  React.useEffect(() => {
    apiEventList(
      1,
      50,
      undefined,
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        .toISOString()
        .substring(0, 10),
      undefined,
      true,
    ).then((response) => {
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
    apiProductList().then((response) => {
      if (response.status === 200) {
        setProducts(response.data);
      }
    });
  }, [setProducts, i18n.resolvedLanguage]);

  const userChildren: any[] =
    users && users.filter((user: any) => !user.can_manage);

  const userAdults: any[] =
    users && users.filter((user: any) => user.can_manage);

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
                        <Stack
                          direction="row"
                          spacing={2}
                          marginLeft={{ xs: "0", lg: "16px" }}
                          marginTop={{ xs: "8px", lg: "0" }}
                          marginBottom={{ xs: "8px", lg: "0" }}
                          whiteSpace="nowrap"
                        >
                          <Box className={styles.eventCountBox}>
                            <IcconPerson
                              className={styles.eventCountIcon}
                              color={
                                event.registration_counts.adults.active >= 10 ||
                                event.registration_counts.adults.active >=
                                  event.registration_counts.adults.total / 2
                                  ? "success"
                                  : event.registration_counts.adults.total -
                                        event.registration_counts.adults
                                          .active -
                                        event.registration_counts.adults
                                          .cancelled >=
                                      event.registration_counts.adults.total / 2
                                    ? "secondary"
                                    : "error"
                              }
                            />
                            <Typography variant="body2" color="textSecondary">
                              {[
                                event.registration_counts.adults.active,
                                event.registration_counts.adults.cancelled,
                                event.registration_counts.adults.total -
                                  event.registration_counts.adults.active -
                                  event.registration_counts.adults.cancelled,
                              ].join("/")}
                            </Typography>
                          </Box>
                          <Box className={styles.eventCountBox}>
                            <IconEscalatorWarning
                              className={styles.eventCountIcon}
                              color={
                                event.registration_counts.children.active >=
                                  2 ||
                                event.registration_counts.children.active >=
                                  event.registration_counts.children.total / 2
                                  ? "success"
                                  : event.registration_counts.children.total -
                                        event.registration_counts.children
                                          .active -
                                        event.registration_counts.children
                                          .cancelled >=
                                      event.registration_counts.children.total / 2
                                    ? "secondary"
                                    : "error"
                              }
                            />
                            <Typography variant="body2" color="textSecondary">
                              {[
                                event.registration_counts.children.active,
                                event.registration_counts.children.cancelled,
                                event.registration_counts.children.total -
                                  event.registration_counts.children.active -
                                  event.registration_counts.children.cancelled,
                              ].join("/")}
                            </Typography>
                          </Box>
                        </Stack>
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
              {/*<IconKeyboardArrowRight className={styles.adminTitleIcon} />*/}
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
              {/*<IconKeyboardArrowRight className={styles.adminTitleIcon} />*/}
            </Box>
          </Link>
          <Box>
            <List className={styles.adminList}>
              {products &&
                products.results.length > 0 &&
                products.results.map((product: any, i: number, row: any) => {
                  return (
                    <>
                      <ListItemButton disableTouchRipple dense>
                        <ListItemIcon className={styles.eventCardIcon}>
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={BACKEND_BASE_URL + product.images[0].picture}
                              alt={product.name}
                              className={styles.eventCardImage}
                            />
                          ) : (
                            <IconHideImage />
                          )}
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
                                {product.name}
                              </Typography>
                            }
                          ></ListItemText>
                        </Box>
                        <Stack
                          direction="row"
                          spacing={2}
                          marginLeft={{ xs: "0", lg: "16px" }}
                          marginTop={{ xs: "8px", lg: "0" }}
                          marginBottom={{ xs: "8px", lg: "0" }}
                          whiteSpace="nowrap"
                        >
                          <Box className={styles.eventCountNoTextBox}>
                            <Typography variant="body2" color="textSecondary">
                              {product.stock}
                            </Typography>
                          </Box>
                        </Stack>
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
                {t("pages.admin.users-table.title")}
              </Typography>
              {/*<IconKeyboardArrowRight className={styles.adminTitleIcon} />*/}
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
              {/*<IconKeyboardArrowRight className={styles.adminTitleIcon} />*/}
            </Box>
          </Link>
          <Box className={styles.adminBox}>
            {statEvents && statEvents.results.length > 0 && (
              <Box mt={1}>
                <Typography
                  variant="body1"
                  fontWeight="600"
                  component="div"
                  textAlign="center"
                >
                  {t("pages.admin.stats-table.attendance-title")}
                </Typography>
                <LineChart
                  xAxis={[
                    {
                      data: statEvents.results.map(
                        (event: any) => new Date(event.time_from),
                      ),
                      valueFormatter: (date: string) =>
                        new Date(date).toISOString().substring(0, 10),
                      min: new Date(statEvents.results[0].time_from),
                      max: new Date(
                        statEvents.results[
                          statEvents.results.length - 1
                        ].time_from,
                      ),
                    },
                  ]}
                  series={[
                    {
                      id: RegistrationStatus.CANCELLED,
                      label: t("enums.registration-status.30"),
                      data: statEvents.results.map(
                        (event: any) =>
                          event.registration_counts.adults.cancelled +
                          event.registration_counts.children.cancelled,
                      ),
                      area: true,
                      showMark: false,
                      stack: "expand",
                      color: theme.palette.error.main,
                    },
                    {
                      id: 0,
                      label: t("enums.registration-status.0"),
                      data: statEvents.results.map(
                        (event: any) =>
                          event.registration_counts.adults.total +
                          event.registration_counts.children.total -
                          event.registration_counts.adults.active -
                          event.registration_counts.children.active -
                          event.registration_counts.adults.cancelled -
                          event.registration_counts.children.cancelled,
                      ),
                      area: true,
                      showMark: false,
                      stack: "expand",
                      color: theme.palette.secondary.main,
                    },
                    {
                      id: RegistrationStatus.ACTIVE,
                      label: t("enums.registration-status.20"),
                      data: statEvents.results.map(
                        (event: any) =>
                          event.registration_counts.adults.active +
                          event.registration_counts.children.active,
                      ),
                      area: true,
                      showMark: false,
                      stack: "expand",
                      color: theme.palette.success.main,
                    },
                  ]}
                  height={300}
                />
              </Box>
            )}
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
