import * as React from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import { Divider, Icon, Link, Typography } from "@mui/material";
import styles from "./styles.module.css";
import Grid from "@mui/material/Grid";
import {
  EVENT_TYPE_ICON,
  getEnumLabel,
  RegistrationStatus,
  Weekday,
} from "../../enums";
import { useCallback } from "react";
import IconChevronLeft from "@mui/icons-material/ChevronLeft";
import IconChevronRight from "@mui/icons-material/ChevronRight";
import IconButton from "@mui/material/IconButton";
import { apiEventCalendarList } from "../../api";
import { useAppContext } from "../AppContext/AppContext";

export default function EventCalendar({ compact, lastChanged }: any) {
  const [t, i18n] = useTranslation("common");

  const { user } = useAppContext();

  const [month, setMonth] = React.useState(new Date().getMonth() + 1);
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [dateFrom, setDateFrom] = React.useState(undefined);
  const [dateTo, setDateTo] = React.useState(undefined);
  const [events, setEvents] = React.useState(undefined);

  const handlePreviousMonth = useCallback(() => {
    if (month <= 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }, [month, year]);

  const handleNextMonth = useCallback(() => {
    if (month >= 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }, [month, year]);

  function getMonday(d: Date) {
    d = new Date(d);
    const day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  React.useEffect(() => {
    const dateMonthFrom = new Date(year, month - 1, 1);
    const dateFrom = getMonday(dateMonthFrom);

    const dateMonthTo = new Date(year, month, 0);
    const dateTo = getMonday(dateMonthTo);
    dateTo.setDate(dateTo.getDate() + 6);

    setDateFrom(dateFrom);
    setDateTo(dateTo);
  }, [setDateFrom, setDateTo, month, year]);

  const getDatesArray = function (start: Date, end: Date) {
    const arr = [];
    let currArr: Date[] = [];
    for (
      const dt = new Date(start);
      dt <= new Date(end);
      dt.setDate(dt.getDate() + 1)
    ) {
      const currDate = new Date(dt);
      currArr.push(currDate);
      if (currDate.getDay() === 0) {
        arr.push(currArr);
        currArr = [];
      }
    }
    return arr;
  };

  const dateWeeks = getDatesArray(dateFrom, dateTo);

  React.useEffect(() => {
    if (dateFrom && dateTo) {
      apiEventCalendarList(
        dateFrom.toISOString().slice(0, 10),
        dateTo.toISOString().slice(0, 10),
      ).then((response) => {
        if (response.status === 200) {
          setEvents(response.data);
        }
      });
    }
  }, [setEvents, lastChanged, dateFrom, dateTo]);

  return (
    <Box key={i18n.resolvedLanguage} sx={{ flexGrow: 1 }}>
      <Grid container className={styles.calendarRow}>
        <IconButton
          onClick={handlePreviousMonth}
          rel="nofollow"
          aria-label="previous"
        >
          <IconChevronLeft />
        </IconButton>
        <Box className={styles.calendarMonthYear}>
          <Typography variant="body1">
            {getEnumLabel(t, "month-long", month)} {year}
          </Typography>
        </Box>
        <IconButton
          onClick={handleNextMonth}
          rel="nofollow"
          aria-label="previous"
        >
          <IconChevronRight />
        </IconButton>
      </Grid>
      <Divider />
      <Grid container className={styles.calendarRow}>
        {(Object.keys(Weekday) as Array<keyof typeof Weekday>)
          .filter((weekday) => !isNaN(Number(weekday)))
          .map((weekday) => {
            return (
              <Grid
                size={12 / 7}
                key={weekday}
                className={styles.calendarWeekday}
              >
                <Typography variant="body2">
                  {getEnumLabel(t, "weekday-short", weekday)}
                </Typography>
              </Grid>
            );
          })}
      </Grid>
      {dateWeeks.map((dateWeek: Date[]) => {
        return (
          <>
            <Divider />
            <Grid container className={styles.calendarRow}>
              {dateWeek.map((date: Date) => {
                const dateInMonth = date.getMonth() + 1 === month;
                const dateString = date.toDateString();
                return (
                  <Grid
                    size={12 / 7}
                    key={date.toDateString()}
                    className={
                      dateInMonth
                        ? styles.calendarDay
                        : styles.calendarDayInvisible
                    }
                  >
                    <Typography
                      variant="body2"
                      className={styles.calendarDayNumber}
                    >
                      {date.getDate()}
                    </Typography>
                    {events &&
                      events
                        .filter(
                          (event: any) =>
                            new Date(event.time_to).toDateString() ===
                            dateString,
                        )
                        .map((event: any) => {
                          const isUserAttending =
                            user &&
                            event.registrations.filter(
                              (registration: any) =>
                                registration.user.id === user.id &&
                                registration.status ===
                                  RegistrationStatus.ACTIVE,
                            ).length > 0;
                          const isOtherFamilyAllAttending =
                            user && user.family && user.family.members
                              ? event.registrations.filter(
                                  (registration: any) =>
                                    registration.user.id !== user.id &&
                                    registration.status ===
                                      RegistrationStatus.ACTIVE,
                                ).length ===
                                user.family.members.length - 1
                              : true;

                          return (
                            <Box
                              className={
                                user && event.require_signup
                                  ? [
                                      styles.calendarEvent,
                                      isUserAttending &&
                                        isOtherFamilyAllAttending &&
                                        styles.calendarEventAllAttending,
                                      !isUserAttending &&
                                        !isOtherFamilyAllAttending &&
                                        styles.calendarEventNoneAttending,
                                      isUserAttending &&
                                        !isOtherFamilyAllAttending &&
                                        styles.calendarEventSomeAttending,
                                      !isUserAttending &&
                                        isOtherFamilyAllAttending &&
                                        styles.calendarEventSomeNotAttending,
                                    ].join(" ")
                                  : styles.calendarEvent
                              }
                            >
                              <Icon className={styles.calendarIcon}>
                                {EVENT_TYPE_ICON[event.type]}
                              </Icon>
                              <Typography variant="caption" fontWeight={600}>
                                {event.title}
                              </Typography>
                              {event.location && (
                                <Typography variant="caption">
                                  <Link
                                    color="textPrimary"
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
                              <Typography variant="caption">
                                {new Date(event.time_from).toLocaleTimeString(
                                  i18n.resolvedLanguage,
                                  {
                                    hour12: false,
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                ) +
                                  (compact
                                    ? ""
                                    : " → " +
                                      new Date(
                                        event.time_to,
                                      ).toLocaleTimeString(
                                        i18n.resolvedLanguage,
                                        {
                                          hour12: false,
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        },
                                      ))}
                              </Typography>
                            </Box>
                          );
                        })}
                  </Grid>
                );
              })}
            </Grid>
          </>
        );
      })}
    </Box>
  );
}
