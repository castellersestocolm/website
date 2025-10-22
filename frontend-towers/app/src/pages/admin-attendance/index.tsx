import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { getEnumLabel, RegistrationStatus, TeamType } from "../../enums";
import {
  apiEventRegistrationList,
  apiAdminUserList,
  apiAdminEventList,
} from "../../api";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  Divider,
  Typography,
} from "@mui/material";
import { capitalizeFirstLetter } from "../../utils/string";
import Box from "@mui/material/Box";
import PageAdmin from "../../components/PageAdmin/PageAdmin";
import { getEventsCount } from "../../utils/admin";
import IconArrowDownward from "@mui/icons-material/ArrowDownward";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

function AdminAttendancePage() {
  const { t } = useTranslation("common");

  const [events, setEvents] = React.useState(undefined);
  const [eventMusicians, setEventMusicians] = React.useState(undefined);
  const [eventIdsSelected, setEventIdsSelected] = React.useState(undefined);
  const [eventMusicianIdsSelected, setEventMusicianIdsSelected] =
    React.useState(undefined);
  const [eventsById, setEventsById] = React.useState(undefined);
  const [eventMusiciansById, setEventMusiciansById] = React.useState(undefined);
  const [userEvents, setUserEvents] = React.useState(undefined);
  const [userEventsMusicians, setUserEventsMusicians] =
    React.useState(undefined);
  const [users, setUsers] = React.useState(undefined);
  const [registrations, setRegistrations] = React.useState(undefined);
  const [registrationsMusicians, setRegistrationsMusicians] =
    React.useState(undefined);

  const handleEventCheckbox = (
    event: React.ChangeEvent<HTMLInputElement>,
    eventId: string,
  ) => {
    if (event.target.checked) {
      if (eventIdsSelected.length < 5) {
        const eventIds = [...eventIdsSelected, eventId];
        setEventIdsSelected(eventIds);
        setUserEvents({
          results: eventIds
            .map((eventId: string) => eventsById[eventId])
            .sort(
              (a: any, b: any) =>
                new Date(a.time_from).getDate() -
                new Date(b.time_from).getDate(),
            ),
        });
      }
    } else {
      if (eventIdsSelected.length > 1) {
        const eventIds = eventIdsSelected.filter(
          (currentEventId: string) => currentEventId !== eventId,
        );
        setEventIdsSelected(eventIds);
        setUserEvents({
          results: eventIds
            .map((eventId: string) => eventsById[eventId])
            .sort(
              (a: any, b: any) =>
                new Date(a.time_from).getDate() -
                new Date(b.time_from).getDate(),
            ),
        });
      }
    }
  };

  const handleEventMusicianCheckbox = (
    event: React.ChangeEvent<HTMLInputElement>,
    eventId: string,
  ) => {
    if (event.target.checked) {
      if (eventMusicianIdsSelected.length < 5) {
        const eventIds = [...eventMusicianIdsSelected, eventId];
        setEventMusicianIdsSelected(eventIds);
        setUserEventsMusicians({
          results: eventIds
            .map((eventId: string) => eventMusiciansById[eventId])
            .sort(
              (a: any, b: any) =>
                new Date(a.time_from).getDate() -
                new Date(b.time_from).getDate(),
            ),
        });
      }
    } else {
      if (eventMusicianIdsSelected.length > 1) {
        const eventIds = eventMusicianIdsSelected.filter(
          (currentEventId: string) => currentEventId !== eventId,
        );
        setEventMusicianIdsSelected(eventIds);
        setUserEventsMusicians({
          results: eventIds
            .map((eventId: string) => eventMusiciansById[eventId])
            .sort(
              (a: any, b: any) =>
                new Date(a.time_from).getDate() -
                new Date(b.time_from).getDate(),
            ),
        });
      }
    }
  };

  React.useEffect(() => {
    apiAdminEventList(
      1,
      50,
      new Date().toISOString().slice(0, 10),
      undefined,
      undefined,
    ).then((response) => {
      if (response.status === 200) {
        setEvents(response.data);
        setEventsById(
          Object.fromEntries(
            response.data.results.map((event: any) => [event.id, event]),
          ),
        );
        setEventIdsSelected(
          response.data.results.slice(0, 5).map((event: any) => event.id),
        );
        setUserEvents({ results: response.data.results.slice(0, 5) });
      }
    });
    apiAdminEventList(
      1,
      50,
      new Date().toISOString().slice(0, 10),
      undefined,
      true,
    ).then((response) => {
      if (response.status === 200) {
        setEventMusicians(response.data);
        setEventMusiciansById(
          Object.fromEntries(
            response.data.results.map((event: any) => [event.id, event]),
          ),
        );
        setEventMusicianIdsSelected(
          response.data.results.slice(0, 5).map((event: any) => event.id),
        );
        setUserEventsMusicians({ results: response.data.results.slice(0, 5) });
      }
    });
  }, [
    setEvents,
    setEventsById,
    setEventIdsSelected,
    setUserEvents,
    setEventMusicians,
    setEventMusiciansById,
    setEventMusicianIdsSelected,
    setUserEventsMusicians,
  ]);

  React.useEffect(() => {
    // TODO: Fix pagination
    apiAdminUserList(1, 100).then((response) => {
      if (response.status === 200) {
        setUsers(response.data.results);
      }
    });
  }, [setUsers]);

  React.useEffect(() => {
    if (userEvents && userEvents.results.length > 0) {
      for (let i = 0; i < userEvents.results.length; i++) {
        const event = userEvents.results[i];
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
  }, [userEvents, setRegistrations]);

  React.useEffect(() => {
    if (userEventsMusicians && userEventsMusicians.results.length > 0) {
      for (let i = 0; i < userEventsMusicians.results.length; i++) {
        const event = userEventsMusicians.results[i];
        apiEventRegistrationList(event.id, true).then((response) => {
          if (response.status === 200) {
            setRegistrationsMusicians((registrations: any) => ({
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
  }, [userEventsMusicians, setRegistrationsMusicians]);

  const userChildren: any[] =
    users && users.filter((user: any) => !user.can_manage);

  const userAdults: any[] =
    users && users.filter((user: any) => user.can_manage);

  const userMusicians: any[] =
    users &&
    users.filter(
      (user: any) =>
        user.members &&
        user.members.filter(
          (member: any) => member.team.type === TeamType.MUSICIANS,
        ).length > 0,
    );

  const eventsCountAdults = getEventsCount(
    userEvents,
    registrations,
    userAdults,
  );

  const eventsCountMusicians = getEventsCount(
    userEventsMusicians,
    registrations,
    userMusicians,
  );

  const eventsCountChildren = getEventsCount(
    userEvents,
    registrations,
    userChildren,
  );

  const columnsAdults: GridColDef[] = [
    { field: "id", headerName: "ID" },
    {
      field: "name",
      headerName: t("pages.admin-attendance.events-table.user"),
      width: 200,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-attendance.events-table.user")}
        </Typography>
      ),
    },
    {
      field: "heightShoulder",
      headerName: t("pages.admin-attendance.events-table.height-shoulders"),
      width: 100,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-attendance.events-table.height-shoulders")}
        </Typography>
      ),
      renderCell: (params: GridRenderCellParams<any, string>) => (
        <Typography
          variant="body2"
          component="span"
          className={styles.adminMono}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "heightArms",
      headerName: t("pages.admin-attendance.events-table.height-arms"),
      width: 100,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-attendance.events-table.height-arms")}
        </Typography>
      ),
      renderCell: (params: GridRenderCellParams<any, string>) => (
        <Typography
          variant="body2"
          component="span"
          className={styles.adminMono}
        >
          {params.value}
        </Typography>
      ),
    },
    ...(userEvents && userEvents.results.length > 0
      ? userEvents.results
          .filter((event: any) => event.require_signup)
          .map((event: any) => {
            return {
              field: "event-" + event.id,
              headerName:
                capitalizeFirstLetter(
                  new Date(event.time_from).toISOString().slice(0, 10),
                ) +
                " " +
                new Date(event.time_from).toTimeString().slice(0, 5),
              sortable: false,
              flex: 1,
              minWidth: 200,
              headerClassName: styles.adminGridHeader,
              cellClassName: styles.adminGridCell,
              renderHeader: () => (
                <Box my={1}>
                  <Typography variant="body2" fontWeight={600}>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {capitalizeFirstLetter(
                      new Date(event.time_from).toISOString().slice(0, 10),
                    ) +
                      " " +
                      new Date(event.time_from).toTimeString().slice(0, 5)}
                  </Typography>
                  {eventsCountAdults && event.id in eventsCountAdults && (
                    <Typography variant="body2" color="textSecondary">
                      {t("pages.admin-attendance.events-table.attendance")}
                      {": "}
                      {
                        <Typography
                          variant="body2"
                          component="span"
                          className={styles.adminMono}
                        >
                          {eventsCountAdults[event.id].join("/")}
                        </Typography>
                      }
                    </Typography>
                  )}
                </Box>
              ),
              renderCell: (params: any) => {
                const registration = params.row["event-" + event.id];
                return (
                  <Box
                    className={
                      registration
                        ? registration.status === RegistrationStatus.ACTIVE
                          ? styles.adminTableCellAttending
                          : registration.status === RegistrationStatus.CANCELLED
                            ? styles.adminTableCellNotAttending
                            : styles.adminTableCellUnknown
                        : styles.adminTableCellUnknown
                    }
                  >
                    {getEnumLabel(
                      t,
                      "registration-status",
                      registration ? registration.status : 0,
                    )}
                  </Box>
                );
              },
            };
          })
      : []),
  ];

  const columnsMusicians: GridColDef[] = [
    { field: "id", headerName: "ID" },
    {
      field: "name",
      headerName: t("pages.admin-attendance.events-table.user"),
      width: 200,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-attendance.events-table.user")}
        </Typography>
      ),
    },
    ...(userEventsMusicians && userEventsMusicians.results.length > 0
      ? userEventsMusicians.results
          .filter((event: any) => event.require_signup)
          .map((event: any) => {
            return {
              field: "event-" + event.id,
              headerName:
                capitalizeFirstLetter(
                  new Date(event.time_from).toISOString().slice(0, 10),
                ) +
                " " +
                new Date(event.time_from).toTimeString().slice(0, 5),
              sortable: false,
              flex: 1,
              minWidth: 200,
              headerClassName: styles.adminGridHeader,
              cellClassName: styles.adminGridCell,
              renderHeader: () => (
                <Box my={1}>
                  <Typography variant="body2" fontWeight={600}>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {capitalizeFirstLetter(
                      new Date(event.time_from).toISOString().slice(0, 10),
                    ) +
                      " " +
                      new Date(event.time_from).toTimeString().slice(0, 5)}
                  </Typography>
                  {eventsCountMusicians && event.id in eventsCountMusicians && (
                    <Typography variant="body2" color="textSecondary">
                      {t("pages.admin-attendance.events-table.attendance")}
                      {": "}
                      {
                        <Typography
                          variant="body2"
                          component="span"
                          className={styles.adminMono}
                        >
                          {eventsCountMusicians[event.id].join("/")}
                        </Typography>
                      }
                    </Typography>
                  )}
                </Box>
              ),
              renderCell: (params: any) => {
                const registration = params.row["event-" + event.id];
                return (
                  <Box
                    className={
                      registration
                        ? registration.status === RegistrationStatus.ACTIVE
                          ? styles.adminTableCellAttending
                          : registration.status === RegistrationStatus.CANCELLED
                            ? styles.adminTableCellNotAttending
                            : styles.adminTableCellUnknown
                        : styles.adminTableCellUnknown
                    }
                  >
                    {getEnumLabel(
                      t,
                      "registration-status",
                      registration ? registration.status : 0,
                    )}
                  </Box>
                );
              },
            };
          })
      : []),
  ];

  const columnsChildren: GridColDef[] = [
    { field: "id", headerName: "ID" },
    {
      field: "name",
      headerName: t("pages.admin-attendance.events-table.user"),
      width: 200,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-attendance.events-table.user")}
        </Typography>
      ),
    },
    {
      field: "family",
      headerName: t("pages.admin-attendance.events-table.family"),
      width: 200,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-attendance.events-table.family")}
        </Typography>
      ),
    },
    ...(userEvents && userEvents.results.length > 0
      ? userEvents.results
          .filter((event: any) => event.require_signup)
          .map((event: any) => {
            return {
              field: "event-" + event.id,
              headerName:
                capitalizeFirstLetter(
                  new Date(event.time_from).toISOString().slice(0, 10),
                ) +
                " " +
                new Date(event.time_from).toTimeString().slice(0, 5),
              sortable: false,
              flex: 1,
              minWidth: 200,
              headerClassName: styles.adminGridHeader,
              cellClassName: styles.adminGridCell,
              renderHeader: () => (
                <Box my={1}>
                  <Typography variant="body2" fontWeight={600}>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {capitalizeFirstLetter(
                      new Date(event.time_from).toISOString().slice(0, 10),
                    ) +
                      " " +
                      new Date(event.time_from).toTimeString().slice(0, 5)}
                  </Typography>
                  {eventsCountChildren && event.id in eventsCountChildren && (
                    <Typography variant="body2" color="textSecondary">
                      {t("pages.admin-attendance.events-table.attendance")}
                      {": "}
                      {
                        <Typography
                          variant="body2"
                          component="span"
                          className={styles.adminMono}
                        >
                          {eventsCountChildren[event.id].join("/")}
                        </Typography>
                      }
                    </Typography>
                  )}
                </Box>
              ),
              renderCell: (params: any) => {
                const registration = params.row["event-" + event.id];
                return (
                  <Box
                    className={
                      registration
                        ? registration.status === RegistrationStatus.ACTIVE
                          ? styles.adminTableCellAttending
                          : registration.status === RegistrationStatus.CANCELLED
                            ? styles.adminTableCellNotAttending
                            : styles.adminTableCellUnknown
                        : styles.adminTableCellUnknown
                    }
                  >
                    {getEnumLabel(
                      t,
                      "registration-status",
                      registration ? registration.status : 0,
                    )}
                  </Box>
                );
              },
            };
          })
      : []),
  ];

  const rowsAdults =
    userAdults && userAdults.length > 0
      ? userAdults.map((user: any, i: number, row: any) => {
          return {
            id: user.id,
            name: user.firstname + " " + user.lastname,
            heightShoulder: user.towers && user.towers.height_shoulders,
            heightArms: user.towers && user.towers.height_arms,
            ...(userEvents && userEvents.results.length > 0 && registrations
              ? Object.fromEntries(
                  userEvents.results
                    .filter((event: any) => event.require_signup)
                    .map((event: any) => {
                      const registration =
                        event.id in registrations &&
                        user.id in registrations[event.id] &&
                        registrations[event.id][user.id];
                      return ["event-" + event.id, registration];
                    }),
                )
              : {}),
          };
        })
      : [];

  const rowsMusicians =
    userMusicians && userMusicians.length > 0
      ? userMusicians.map((user: any, i: number, row: any) => {
          return {
            id: user.id,
            name: user.firstname + " " + user.lastname,
            ...(userEventsMusicians &&
            userEventsMusicians.results.length > 0 &&
            registrationsMusicians
              ? Object.fromEntries(
                  userEventsMusicians.results
                    .filter((event: any) => event.require_signup)
                    .map((event: any) => {
                      const registration =
                        event.id in registrationsMusicians &&
                        user.id in registrationsMusicians[event.id] &&
                        registrationsMusicians[event.id][user.id];
                      return ["event-" + event.id, registration];
                    }),
                )
              : {}),
          };
        })
      : [];

  const rowsChildren =
    userChildren && userChildren.length > 0
      ? userChildren.map((user: any, i: number, row: any) => {
          return {
            id: user.id,
            name: user.firstname + " " + user.lastname,
            family: Array.from(
              new Set(
                user.family.members
                  .filter((member: any) => member.user.can_manage)
                  .map((member: any) => member.user.lastname.split(" ")[0]),
              ),
            ).join("-"),
            ...(userEvents && userEvents.results.length > 0 && registrations
              ? Object.fromEntries(
                  userEvents.results
                    .filter((event: any) => event.require_signup)
                    .map((event: any) => {
                      const registration =
                        event.id in registrations &&
                        user.id in registrations[event.id] &&
                        registrations[event.id][user.id];
                      return ["event-" + event.id, registration];
                    }),
                )
              : {}),
          };
        })
      : [];

  const content = (
    <Grid container spacing={4} className={styles.adminGrid}>
      <Card variant="outlined" className={styles.adminCard}>
        <Box className={styles.adminTopBox}>
          <Typography variant="h6" fontWeight="600" component="div">
            {t("pages.admin-attendance.events-table.title-adults")}
          </Typography>
        </Box>
        <Divider />
        {events && events.results.length > 0 && (
          <Box>
            <Accordion elevation={0} className={styles.accordion}>
              <AccordionSummary
                expandIcon={<IconArrowDownward />}
                aria-controls="event-choose-users-content"
                id="event-choose-users-header"
                className={styles.accordionSummary}
              >
                <Typography component="span">
                  {t("pages.admin-attendance.events-table.settings")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <FormGroup>
                  {events.results.map((event: any) => {
                    return (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={
                              eventIdsSelected &&
                              eventIdsSelected.includes(event.id)
                            }
                            onChange={(e) => handleEventCheckbox(e, event.id)}
                          />
                        }
                        label={
                          event.title +
                          " — " +
                          capitalizeFirstLetter(
                            new Date(event.time_from)
                              .toISOString()
                              .slice(0, 10),
                          ) +
                          " " +
                          new Date(event.time_from).toTimeString().slice(0, 5)
                        }
                      />
                    );
                  })}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
            <Divider />
          </Box>
        )}
        <Box>
          <DataGrid
            rows={rowsAdults}
            columns={columnsAdults}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 100,
                },
              },
              columns: {
                ...columnsAdults,
                columnVisibilityModel: {
                  id: false,
                },
              },
              density: "compact",
              sorting: {
                sortModel: [{ field: "name", sort: "asc" }],
              },
            }}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50, 100]}
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders > div": {
                height: "fit-content !important",
              },
            }}
            loading={!userAdults}
            slotProps={{
              loadingOverlay: {
                variant: "circular-progress",
                noRowsVariant: "circular-progress",
              },
            }}
          />
        </Box>
      </Card>
      <Card variant="outlined" className={styles.adminCard}>
        <Box className={styles.adminTopBox}>
          <Typography variant="h6" fontWeight="600" component="div">
            {t("pages.admin-attendance.events-table.title-musicians")}
          </Typography>
        </Box>
        <Divider />
        {eventMusicians && eventMusicians.results.length > 0 && (
          <Box>
            <Accordion elevation={0} className={styles.accordion}>
              <AccordionSummary
                expandIcon={<IconArrowDownward />}
                aria-controls="event-choose-musicians-content"
                id="event-choose-musicians-header"
                className={styles.accordionSummary}
              >
                <Typography component="span">
                  {t("pages.admin-attendance.events-table.settings")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <FormGroup>
                  {eventMusicians.results.map((event: any) => {
                    return (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={
                              eventMusicianIdsSelected &&
                              eventMusicianIdsSelected.includes(event.id)
                            }
                            onChange={(e) =>
                              handleEventMusicianCheckbox(e, event.id)
                            }
                          />
                        }
                        label={
                          event.title +
                          " — " +
                          capitalizeFirstLetter(
                            new Date(event.time_from)
                              .toISOString()
                              .slice(0, 10),
                          ) +
                          " " +
                          new Date(event.time_from).toTimeString().slice(0, 5)
                        }
                      />
                    );
                  })}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
            <Divider />
          </Box>
        )}

        <Box>
          <DataGrid
            rows={rowsMusicians}
            columns={columnsMusicians}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 100,
                },
              },
              columns: {
                ...columnsAdults,
                columnVisibilityModel: {
                  id: false,
                },
              },
              density: "compact",
              sorting: {
                sortModel: [{ field: "name", sort: "asc" }],
              },
            }}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50, 100]}
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders > div": {
                height: "fit-content !important",
              },
            }}
            loading={!userMusicians}
            slotProps={{
              loadingOverlay: {
                variant: "circular-progress",
                noRowsVariant: "circular-progress",
              },
            }}
          />
        </Box>
      </Card>
      <Card variant="outlined" className={styles.adminCard}>
        <Box className={styles.adminTopBox}>
          <Typography variant="h6" fontWeight="600" component="div">
            {t("pages.admin-attendance.events-table.title-families")}
          </Typography>
        </Box>
        <Divider />

        <Box>
          <DataGrid
            rows={rowsChildren}
            columns={columnsChildren}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 25,
                },
              },
              columns: {
                ...columnsChildren,
                columnVisibilityModel: {
                  id: false,
                },
              },
              density: "compact",
              sorting: {
                sortModel: [
                  { field: "family", sort: "asc" },
                  { field: "name", sort: "asc" },
                ],
              },
            }}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50, 100]}
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders > div": {
                height: "fit-content !important",
              },
            }}
            loading={!userChildren}
            slotProps={{
              loadingOverlay: {
                variant: "circular-progress",
                noRowsVariant: "circular-progress",
              },
            }}
          />
        </Box>
      </Card>
    </Grid>
  );

  return (
    <PageAdmin
      title={t("pages.admin-attendance.title")}
      content={content}
      finishedRegistration={true}
      loading={!events}
    />
  );
}

export default AdminAttendancePage;
