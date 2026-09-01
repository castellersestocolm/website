import styles from "./styles.module.css";
import {
  Typography,
  Link,
  ListItem,
  List,
  ListItemText,
  Card,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { apiEventPage, apiMembershipList } from "../../api";
import markdown from "@wcj/markdown-to-html";
import PageBase from "../../components/PageBase/PageBase";
import { useAppContext } from "../../components/AppContext/AppContext";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import FormEventPrices from "../../components/FormEventPrices/FormEventPrices";
import FormEventRegister from "../../components/FormEventRegister/FormEventRegister";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { datetimeToLongString } from "../../utils/datetime";
import { compareEventSignup } from "../../utils/sort";
import { ROUTES } from "../../routes";
import IconEast from "@mui/icons-material/East";
import Alert from "@mui/material/Alert";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_ORG_API_URL).origin;

function CalendarEventPage() {
  const [t, i18n] = useTranslation("common");
  const { year, month, day, code, token } = useParams();

  const [event, setEvent] = React.useState(undefined);
  const [membership, setMembership] = React.useState(undefined);

  const { user } = useAppContext();

  React.useEffect(() => {
    if (token) {
      apiEventPage(undefined, undefined, token).then((response) => {
        if (response.status === 200) {
          setEvent(response.data);
        }
      });
    } else {
      const date = new Date(year + "-" + month + "-" + day);
      apiEventPage(date.toISOString().substring(0, 10), code).then(
        (response) => {
          if (response.status === 200) {
            setEvent(response.data);
          }
        },
      );
    }
  }, [setEvent, year, month, day, code, token, i18n.resolvedLanguage]);

  React.useEffect(() => {
    if (user) {
      apiMembershipList().then((response) => {
        if (response.status === 200) {
          const currentMembership = response.data.results.find(
            (membership: any) => {
              return membership.is_active;
            },
          );
          setMembership(currentMembership);
        }
      });
    }
  }, [user, i18n.resolvedLanguage, setMembership, t]);

  const userMembershipModules =
    membership &&
    membership.modules.map((membershipModule: any) => membershipModule.module);
  const eventSignup =
    event &&
    event.signups
      .sort(compareEventSignup)
      .find(
        (eventSignup: any) =>
          !eventSignup.module ||
          (userMembershipModules &&
            userMembershipModules.includes(eventSignup.module)),
      );

  const eventSubtitle = event && (
    <>
      <Typography
        variant="h6"
        fontWeight={700}
        align="center"
        color="white"
        mb={event.location ? 0 : 3}
      >
        {datetimeToLongString(i18n.resolvedLanguage, event.time_from)}
      </Typography>
      {event.location && (
        <Typography
          variant="h6"
          fontWeight={700}
          color="white"
          align="center"
          mb={3}
        >
          <Link
            color="white"
            underline="none"
            href={
              "http://google.com/maps/place/" +
              event.location.coordinate_lat +
              "," +
              event.location.coordinate_lon
            }
            target="_blank"
          >
            {event.location.name}
          </Link>
        </Typography>
      )}
    </>
  );

  const content = (
    <>
      {event && (
        <Box className={styles.pressContainerBox}>
          {!token &&
            (event.description ||
              (event.agenda_items && event.agenda_items.length > 0)) && (
              <Box>
                <Typography
                  variant="body1"
                  component="div"
                  className={styles.calendarEventDescription}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: markdown(event.description).toString(),
                    }}
                  ></div>
                </Typography>
                {event.agenda_items && event.agenda_items.length > 0 && (
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      textAlign="center"
                    >
                      {t("pages.calendar-event.agenda.title")}
                    </Typography>

                    <List dense={true}>
                      {event.agenda_items.map((agendaItem: any) => (
                        <ListItem className={styles.calendarEventListItem}>
                          <ListItemText
                            primary={
                              <Typography variant="body1" fontWeight={700}>
                                {new Date(
                                  agendaItem.time_from,
                                ).toLocaleTimeString(i18n.resolvedLanguage, {
                                  hour12: false,
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }) +
                                  " — " +
                                  agendaItem.name}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" component="div">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: markdown(
                                      agendaItem.description,
                                    ).toString(),
                                  }}
                                ></div>
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}

          {!token && event.prices && event.prices.length > 0 && (
            <Box mt={5}>
              <Box mb={3}>
                <Typography variant="h5" fontWeight="600" align="center" mb={1}>
                  {t("pages.calendar-event.register.prices.title")}
                </Typography>
                <Typography variant="body1" align="center">
                  {t("pages.calendar-event.register.prices.description")}
                </Typography>
              </Box>
              <FormEventPrices event={event} />
            </Box>
          )}

          {event.require_signup && (
            <Box mt={token ? 0 : 5}>
              <Box mb={3}>
                <Typography variant="h4" fontWeight="700" align="center">
                  {t("pages.calendar-event.register")}
                </Typography>
                {event.has_token && (
                  <Grid container spacing={3} justifyContent="center">
                    <Grid size={{ xs: 12, sm: 10, md: 7, lg: 10, xl: 8 }}>
                      <Alert severity="warning" className={styles.alert}>
                        {t("pages.calendar-event.register.description-token")}
                      </Alert>
                    </Grid>
                  </Grid>
                )}
              </Box>
              {eventSignup ? (
                eventSignup.is_open ? (
                  <FormEventRegister event={event} />
                ) : (
                  <>
                    <Typography variant="body1" align="center" mb={1}>
                      {eventSignup.time_from && eventSignup.time_to
                        ? t("pages.calendar-event.register-opening-dates-1") +
                          " " +
                          datetimeToLongString(
                            i18n.resolvedLanguage,
                            new Date(eventSignup.time_from),
                          ) +
                          " " +
                          t("pages.calendar-event.register-opening-dates-2") +
                          " " +
                          datetimeToLongString(
                            i18n.resolvedLanguage,
                            new Date(eventSignup.time_to),
                          ) +
                          "."
                        : eventSignup.time_from
                          ? t(
                              "pages.calendar-event.register-opening-future-1",
                            ) +
                            " " +
                            datetimeToLongString(
                              i18n.resolvedLanguage,
                              new Date(eventSignup.time_from),
                            ) +
                            "."
                          : eventSignup.time_to
                            ? t(
                                "pages.calendar-event.register-opening-past-1",
                              ) +
                              " " +
                              datetimeToLongString(
                                i18n.resolvedLanguage,
                                new Date(eventSignup.time_to),
                              ) +
                              "."
                            : t("pages.calendar-event.register-closed")}{" "}
                      {t("pages.calendar-event.register-opening-login")}
                    </Typography>
                    <Typography variant="body1" align="center">
                      <Link
                        color="secondary"
                        underline="none"
                        href={
                          user
                            ? ROUTES.membership.path
                            : ROUTES["user-login"].path
                        }
                        className={styles.link}
                      >
                        {user
                          ? t(
                              "pages.calendar-event.register-opening-login.text-login-membership",
                            )
                          : t(
                              "pages.activity-kids.content.section-register.text-login-link",
                            )}
                        <IconEast className={styles.iconEast} />
                      </Link>
                    </Typography>
                  </>
                )
              ) : (
                <Typography variant="body2">
                  {t("pages.calendar-event.register-closed")}
                </Typography>
              )}
            </Box>
          )}

          {!token &&
            ((event.poster && event.poster.large) || event.location) && (
              <Grid container spacing={{ xs: 3, md: 4 }} mt={6}>
                {event.poster && event.poster.large && (
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 4,
                    }}
                  >
                    <Link href={BACKEND_BASE_URL + event.poster.large}>
                      <img
                        src={BACKEND_BASE_URL + event.poster.large}
                        className={styles.calendarEventPoster}
                        alt="poster"
                      />
                    </Link>
                  </Grid>
                )}
                {event.location && (
                  <Grid
                    size={{
                      xs: 12,
                      sm: event.poster && event.poster.large ? 6 : 12,
                      md: event.poster && event.poster.large ? 8 : 12,
                    }}
                  >
                    {" "}
                    <Card
                      variant="outlined"
                      className={styles.mapCard}
                      sx={{
                        minHeight:
                          event.poster && event.poster.large
                            ? "300px"
                            : "500px !important",
                      }}
                    >
                      <iframe
                        src={
                          "https://maps.google.com/maps?q=" +
                          event.location.coordinate_lat +
                          "," +
                          event.location.coordinate_lon +
                          "&t=&z=13&ie=UTF8&iwloc=&output=embed"
                        }
                        width="100%"
                        height="300"
                        loading="lazy"
                        frameBorder="0"
                        referrerPolicy="strict-origin-when-cross-origin"
                        style={{
                          minHeight:
                            event.poster && event.poster.large
                              ? "300px"
                              : "500px !important",
                        }}
                      ></iframe>
                    </Card>
                  </Grid>
                )}
              </Grid>
            )}
        </Box>
      )}
    </>
  );

  return event && event.picture ? (
    <PageImageHero
      title={event.title}
      subtitle={eventSubtitle}
      content={content}
      hero={event.picture && BACKEND_BASE_URL + event.picture.medium}
    />
  ) : (
    <PageBase
      title={event && event.title}
      subtitle={eventSubtitle}
      content={content}
      loading={!event}
    />
  );
}

export default CalendarEventPage;
