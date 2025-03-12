import { Scheduler } from "@aldabil/react-scheduler";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { languageToLocale } from "../../utils/locale";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import styles from "./styles.module.css";

export default function EventCalendar({ events, compact }: any) {
  const [t, i18n] = useTranslation("common");

  const calendarEvents =
    events && events.length > 0
      ? events.map((event: any) => {
          return {
            event_id: event.id,
            title: (
              <Typography fontWeight={600} variant="caption" lineHeight={1}>
                {event.title}
              </Typography>
            ),
            subtitle: !compact && (
              <>
                {event.location ? (
                  <>
                    {event.location.name}
                    <br />
                  </>
                ) : undefined}
                {new Date(event.time_from).toTimeString().slice(0, 5)}
                {" → "}
                {new Date(event.time_to).toTimeString().slice(0, 5)}
              </>
            ),
            start: new Date(event.time_from),
            end: new Date(event.time_to),
            sx: {
              margin: "4px",
              width: "calc(100% - 8px)",
              height: "auto",
              boxShadow: "none",
            },
          };
        })
      : [];

  return (
    <Box key={i18n.resolvedLanguage} className={styles.calendarBox}>
      <Scheduler
        height={compact ? 450 : 600}
        events={calendarEvents}
        view="month"
        navigation={true}
        disableViewNavigator={false}
        day={null}
        week={null}
        agenda={false}
        month={{
          weekDays: [0, 1, 2, 3, 4, 5, 6],
          weekStartOn: 1,
          startHour: 0,
          endHour: 24,
          navigation: true,
          disableGoToDay: true,
        }}
        locale={languageToLocale(i18n.resolvedLanguage)}
        timeZone="CET"
        hourFormat="24"
        editable={false}
        deletable={false}
        draggable={false}
        translations={{
          navigation: {
            month: "Month",
            week: "Week",
            day: "Day",
            today: t("components.event-calendar.navigation.today"),
            agenda: "Agenda",
          },
          form: {
            addTitle: "Add Event",
            editTitle: "Edit Event",
            confirm: "Confirm",
            delete: "Delete",
            cancel: "Cancel",
          },
          event: {
            title: "Title",
            subtitle: "Subtitle",
            start: "Start",
            end: "End",
            allDay: "All Day",
          },
          validation: {
            required: "Required",
            invalidEmail: "Invalid Email",
            onlyNumbers: "Only Numbers Allowed",
            min: "Minimum {{min}} letters",
            max: "Maximum {{max}} letters",
          },
          moreEvents: "More...",
          noDataToDisplay: "No data to display",
          loading: "Loading...",
        }}
      />
    </Box>
  );
}
