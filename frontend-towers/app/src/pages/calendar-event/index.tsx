import styles from "./styles.module.css";
import {
  Typography,
  Link,
  ListItem,
  List,
  ListItemText,
  ListItemIcon,
  ListItemButton,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { apiEventPage } from "../../api";
import markdown from "@wcj/markdown-to-html";
import { capitalizeFirstLetter } from "../../utils/string";
import PageBase from "../../components/PageBase/PageBase";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Map from "../../components/Map/Map";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_API_BASE_URL).origin;

function CalendarEventPage() {
  const [t, i18n] = useTranslation("common");
  const { year, month, day, code } = useParams();

  const [event, setEvent] = React.useState(undefined);

  React.useEffect(() => {
    const date = new Date(year + "-" + month + "-" + day);
    apiEventPage(date.toISOString().substring(0, 10), code).then((response) => {
      if (response.status === 200) {
        setEvent(response.data);
      }
    });
  }, [setEvent, year, month, day, code, i18n.resolvedLanguage]);

  const content = (
    <>
      {event && (
        <Box className={styles.pressContainerBox} mt={3}>
          <Typography
            variant="h6"
            fontWeight={700}
            align="center"
            color="textSecondary"
            mb={event.location ? 0 : 3}
          >
            {capitalizeFirstLetter(
              new Date(event.time_from).toLocaleDateString(
                i18n.resolvedLanguage,
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              ),
            )}
          </Typography>
          {event.location && (
            <Typography
              variant="h6"
              fontWeight={700}
              color="textSecondary"
              align="center"
              mb={3}
            >
              <Link
                color="textSecondary"
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

          {(event.description ||
            (event.agenda_items && event.agenda_items.length > 0)) &&
            event.poster &&
            event.poster.large && (
              <Grid
                container
                spacing={{ xs: 2, md: 4 }}
                className={styles.calendarEventGrid}
                mb={3}
              >
                {(event.description ||
                  (event.agenda_items && event.agenda_items.length > 0)) && (
                  <Grid
                    size={{
                      xs: 12,
                      md: event.poster && event.poster.large ? 6 : 12,
                    }}
                    order={{ xs: 1, md: 2 }}
                  >
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
                                    ).toLocaleTimeString(
                                      i18n.resolvedLanguage,
                                      {
                                        hour12: false,
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    ) +
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
                  </Grid>
                )}
                {event.poster && event.poster.large && (
                  <Grid
                    size={{
                      xs: 12,
                      md:
                        event.description ||
                        (event.agenda_items && event.agenda_items.length > 0)
                          ? 6
                          : 12,
                    }}
                    order={{ xs: 2, md: 1 }}
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
              </Grid>
            )}

          {event.location && (
            <Box className={styles.calenderEventMap}>
              <Map
                location={event.location}
                coordinates={[
                  event.location.coordinate_lat,
                  event.location.coordinate_lon,
                ]}
                connections={event.location.connections}
              />
            </Box>
          )}
        </Box>
      )}
    </>
  );

  return (
    <PageBase title={event && event.title} content={content} loading={!event} />
  );
}

export default CalendarEventPage;
