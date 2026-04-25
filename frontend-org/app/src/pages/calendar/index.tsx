import { Container, useTheme, useMediaQuery } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import ImageHeroCalendar from "../../assets/images/heros/calendar.jpeg";

function CalendarPage() {
  const { t } = useTranslation("common");

  const theme = useTheme();
  const calendarMatchesMd = useMediaQuery(theme.breakpoints.up("md"));

  const content = (
    <Container maxWidth="xl">
      {calendarMatchesMd ? (
        <iframe
          src="https://calendar.google.com/calendar/embed?height=600&wkst=2&ctz=Europe%2FBerlin&showPrint=0&showTitle=0&showTz=0&showCalendars=0&showTabs=0&hl=ca&src=Y185NmVkMjc2MGNkOGRjMjljMmJkNWQ5NWUxZTMzMTUzZTQ0ODBiYTBiMTE3OWRkMjg0N2QyZTk5NWY0MjFjZjVhQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y19jMzM5YTdmZWI1YzA5YzEyNTE2OTU1ODMwNjg3ZmI3MDY1YTVmODgzYTZiZGNiYTc0Y2U1NzgxMTIzYjJjN2Y2QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23009688&color=%238e24aa"
          width="100%"
          height="800"
          frameBorder="0"
          scrolling="no"
        ></iframe>
      ) : (
        <iframe
          src="https://calendar.google.com/calendar/embed?height=600&wkst=2&ctz=Europe%2FBerlin&showPrint=0&showTitle=0&showTz=0&showCalendars=0&showTabs=0&hl=ca&mode=AGENDA&src=Y185NmVkMjc2MGNkOGRjMjljMmJkNWQ5NWUxZTMzMTUzZTQ0ODBiYTBiMTE3OWRkMjg0N2QyZTk5NWY0MjFjZjVhQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y19jMzM5YTdmZWI1YzA5YzEyNTE2OTU1ODMwNjg3ZmI3MDY1YTVmODgzYTZiZGNiYTc0Y2U1NzgxMTIzYjJjN2Y2QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23009688&color=%238e24aa"
          width="100%"
          height="800"
          frameBorder="0"
          scrolling="no"
        ></iframe>
      )}
    </Container>
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
