import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import ImageHeroCalendar from "../../assets/images/heros/calendar.jpg";
import Grid from "@mui/material/Grid";
import { Card, Divider, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import EventCalendar from "../../components/EventCalendar/EventCalendar";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import EventAgenda from "../../components/EventAgenda/EventAgenda";

function CalendarPage() {
  const { t } = useTranslation("common");

  const [sharedDateFrom, setSharedDateFrom] = React.useState(undefined);
  const [sharedRegistrations, setSharedRegistrations] = React.useState<{
    [key: string]: any;
  }>({});

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
          <EventAgenda
            sharedDateFrom={sharedDateFrom}
            setSharedDateFrom={setSharedDateFrom}
            sharedRegistrations={sharedRegistrations}
            setSharedRegistrations={setSharedRegistrations}
          />
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
                <EventCalendar
                  compact={false}
                  sharedDateFrom={sharedDateFrom}
                  setSharedDateFrom={setSharedDateFrom}
                  sharedRegistrations={sharedRegistrations}
                  setSharedRegistrations={setSharedRegistrations}
                />
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
    />
  );
}

export default CalendarPage;
