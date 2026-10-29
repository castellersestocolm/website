import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../components/AppContext/AppContext";
import Grid from "@mui/material/Grid";
import {
  Button,
  Card,
  Divider,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import PageAdmin from "../../components/PageAdmin/PageAdmin";
import { apiAdminEventList } from "../../api";
import { EventType } from "../../enums";
import { capitalizeFirstLetter } from "../../utils/string";
import { ROUTES } from "../../routes";
import { getEventIcon } from "../../utils/event";
import { LoaderClip } from "../../components/LoaderClip/LoaderClip";
import Pagination from "@mui/material/Pagination";

function AdminPage() {
  const [t, i18n] = useTranslation("common");

  const { user } = useAppContext();

  const [eventPage, setEventPage] = React.useState(1);
  const [events, setEvents] = React.useState(undefined);

  React.useEffect(() => {
    apiAdminEventList(
      eventPage,
      5,
      new Date().toISOString().substring(0, 10),
    ).then((response) => {
      if (response.status === 200) {
        setEvents(response.data);
      }
    });
  }, [eventPage, setEvents]);

  const content = user && (
    <Grid container spacing={4} className={styles.adminGrid}>
      <Grid
        container
        size={12}
        spacing={2}
        direction="column"
        justifyContent="center"
      >
        <Card variant="outlined" className={styles.adminCard}>
          <Link
            color="textPrimary"
            underline="none"
            component="button"
            className={styles.adminTitleLink}
            // onClick={handleAdminEventSubmit}
          >
            <Box className={styles.adminTopBoxLink}>
              <Typography variant="h6" fontWeight="600" component="div">
                {t("pages.admin.events-table.title")}
              </Typography>
              {/* <IconKeyboardArrowRight className={styles.adminTitleIcon} /> */}
            </Box>
          </Link>
          {events && events.results.length > 0 ? (
            <Box>
              <List className={styles.adminList}>
                {events.results.map((event: any, i: number, row: any) => {
                  return (
                    <>
                      <ListItemButton disableTouchRipple dense>
                        <ListItemIcon className={styles.eventCardIcon}>
                          {getEventIcon(event.type, event.modules, event.theme)}
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
                                  ((event.type === EventType.REHEARSAL ||
                                    event.type === EventType.WORKSHOP) &&
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
                                  " ➔ " +
                                  new Date(event.time_to)
                                    .toTimeString()
                                    .slice(0, 5)}
                              </Typography>
                            }
                          ></ListItemText>
                          {event.require_signup && event.require_approve && (
                            <Stack
                              direction="row"
                              spacing={2}
                              marginLeft={{ xs: "0", lg: "16px" }}
                              marginTop={{ xs: "8px", lg: "0" }}
                              marginBottom={{ xs: "8px", lg: "0" }}
                              whiteSpace="nowrap"
                            >
                              <Button
                                variant="contained"
                                type="submit"
                                style={{ width: "auto" }}
                                disableElevation
                                href={ROUTES[
                                  "admin-event-attendance"
                                ].path.replace(":id", event.id)}
                              >
                                {t("pages.admin.events-table.attendance")}
                              </Button>
                            </Stack>
                          )}
                        </Box>
                      </ListItemButton>
                      {i + 1 < row.length && <Divider />}
                    </>
                  );
                })}
              </List>
            </Box>
          ) : (
            <Box className={styles.providerLoader}>
              <LoaderClip />
            </Box>
          )}
        </Card>
        {events &&
          events.results.length > 0 &&
          (eventPage !== 1 || events.count > events.results.length) && (
            <Stack alignItems="center">
              <Pagination
                count={Math.ceil(events.count / 5)}
                onChange={(e: any, value: number) => setEventPage(value)}
              />
            </Stack>
          )}
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
