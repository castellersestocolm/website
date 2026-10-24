import {
  Typography,
  Grid,
  Card,
  Box,
  Divider,
  List,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Link,
  Collapse,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import ImageHeroLunches from "../../assets/images/heros/lunches.jpg";
import styles from "./styles.module.css";
import { useState } from "react";
import { apiEventSeriesPage } from "../../api";
import { datetimeToLongString } from "../../utils/datetime";
import IconCalendarMonth from "@mui/icons-material/CalendarMonth";
import { ROUTES } from "../../routes";
import IconEast from "@mui/icons-material/East";
import IconExpandMore from "@mui/icons-material/ExpandMore";
import IconExpandLess from "@mui/icons-material/ExpandLess";
import Map from "../../components/Map/Map";

function ActivityLunchesPage() {
  const [t, i18n] = useTranslation("common");

  const [eventSeries, setEventSeries] = useState(undefined);

  const [eventsMapOpen, setEventsMapOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const handleEventMapClick = React.useCallback(
    (eventId: string) => {
      setEventsMapOpen((eventsMapOpen) => ({
        ...Object.fromEntries(
          Object.entries(eventsMapOpen).map(([k, v], i) => [k, false]),
        ),
        [eventId]: !eventsMapOpen[eventId],
      }));
    },
    [setEventsMapOpen],
  );

  React.useEffect(() => {
    apiEventSeriesPage("dinars", new Date().toISOString().slice(0, 10), null, [
      "time_from",
    ]).then((response) => {
      if (response.status === 200) {
        setEventSeries(response.data);
      }
    });
  }, [setEventSeries, i18n.resolvedLanguage]);

  const content = (
    <>
      <Typography variant="body1" mb={1}>
        {t("pages.activity-lunches.content.section-1.text-1")}
      </Typography>
      {eventSeries && eventSeries.events && eventSeries.events.length > 0 && (
        <Grid container gap={3} mt={4} mb={4} justifyContent="center">
          <Grid size={{ xs: 12, sm: 10, md: 7, lg: 5, xl: 4 }}>
            <Card variant="outlined">
              <Box className={styles.userTopBox}>
                <Typography variant="h6" fontWeight="600" component="div">
                  {t(
                    "pages.activity-kids.content.section-register.title-events",
                  )}
                </Typography>
              </Box>
              <Divider />
              <Box className={styles.userFamilyBox}>
                <List className={styles.userFamilyList}>
                  {eventSeries.events
                    .slice(0, 5)
                    .map((event: any, i: number, row: any) => (
                      <>
                        <Box key={event.id}>
                          <ListItemButton
                            onClick={() => {
                              if (!eventsMapOpen[event.id]) {
                                handleEventMapClick(event.id);
                              } else {
                                setEventsMapOpen({});
                              }
                            }}
                            dense
                          >
                            <ListItemIcon className={styles.userFamilyListIcon}>
                              <IconCalendarMonth />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" component="span">
                                  {datetimeToLongString(
                                    i18n.resolvedLanguage,
                                    event.time_from,
                                  )}
                                </Typography>
                              }
                              secondary={event.location && event.location.name}
                            ></ListItemText>
                            {event.location &&
                              (eventsMapOpen[event.id] ? (
                                <IconExpandLess />
                              ) : (
                                <IconExpandMore />
                              ))}
                          </ListItemButton>
                        </Box>
                        {event.location && (
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
                                eventType={event.type}
                                eventTheme={event.theme}
                              />
                            </Box>
                          </Collapse>
                        )}
                        {i + 1 < row.length && <Divider />}
                      </>
                    ))}
                </List>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.activity-lunches.content.section-register.title")}
      </Typography>
      <Typography variant="body1" mb={1}>
        <Link
          color="secondary"
          underline="none"
          href={ROUTES["about-contact"].path}
          className={styles.link}
        >
          {t("pages.activity-lunches.content.section-register.text-consent")}
          <IconEast className={styles.iconEast} />
        </Link>
      </Typography>
    </>
  );

  return (
    <PageImageHero
      title={t("pages.activity-lunches.title")}
      content={content}
      hero={ImageHeroLunches}
      loading={!eventSeries}
    />
  );
}

export default ActivityLunchesPage;
