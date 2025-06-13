import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../components/AppContext/AppContext";
import Grid from "@mui/material/Grid";
import { DataGrid, GridColDef, GridColumnHeaderParams } from "@mui/x-data-grid";
import PageBase from "../../components/PageBase/PageBase";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import { getEnumLabel, PermissionLevel, RegistrationStatus } from "../../enums";
import { apiEventList, apiEventRegistrationList, apiUserList } from "../../api";
import { Card, Divider, Typography } from "@mui/material";
import { capitalizeFirstLetter } from "../../utils/string";
import Box from "@mui/material/Box";

function AdminPage() {
  const { t } = useTranslation("common");

  let navigate = useNavigate();

  const { user } = useAppContext();

  const [events, setEvents] = React.useState(undefined);
  const [users, setUsers] = React.useState(undefined);
  const [registrations, setRegistrations] = React.useState(undefined);

  React.useEffect(() => {
    apiEventList(1).then((response) => {
      if (response.status === 200) {
        setEvents(response.data);
      }
    });
  }, [setEvents]);

  React.useEffect(() => {
    apiUserList().then((response) => {
      if (response.status === 200) {
        setUsers(response.data);
      }
    });
  }, [setUsers]);

  React.useEffect(() => {
    if (events && events.results.length > 0) {
      for (let i = 0; i < events.results.length; i++) {
        const event = events.results[i];
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
  }, [events, setRegistrations]);

  if (!user || user.permission_level < PermissionLevel.ADMIN) {
    navigate(ROUTES["user-login"].path, { replace: true });
  }

  const userAdults =
    users &&
    users.filter(
      (user: any) =>
        !user.family ||
        user.family.members.filter((member: any) => !member.user.can_manage)
          .length <= 0,
    );
  const userFamilies: any[] =
    users &&
    users.filter(
      (user: any) =>
        user.family &&
        user.family.members.filter((member: any) => !member.user.can_manage)
          .length > 0,
    );

  const eventsCounts =
    events && events.results.length > 0 && registrations && users
      ? Object.fromEntries(
          events.results
            .filter(
              (event: any) => event.require_signup && event.id in registrations,
            )
            .map((event: any) => {
              const registrationsActive = Object.values(
                registrations[event.id],
              ).filter(
                (registration: any) =>
                  registration.status === RegistrationStatus.ACTIVE,
              ).length;
              const registrationsCancelled = Object.values(
                registrations[event.id],
              ).filter(
                (registration: any) =>
                  registration.status === RegistrationStatus.CANCELLED,
              ).length;
              const registrationsUnknown =
                users.length - registrationsActive - registrationsCancelled;
              return [
                event.id,
                [
                  registrationsActive,
                  registrationsCancelled,
                  registrationsUnknown,
                ],
              ];
            }),
        )
      : undefined;

  const columnsAdults: GridColDef[] = [
    { field: "id", headerName: "ID" },
    {
      field: "name",
      headerName: t("pages.admin.events-table.user"),
      width: 200,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin.events-table.user")}
        </Typography>
      ),
    },
    {
      field: "heightShoulder",
      headerName: t("pages.admin.events-table.height-shoulders"),
      width: 100,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin.events-table.height-shoulders")}
        </Typography>
      ),
    },
    {
      field: "heightArms",
      headerName: t("pages.admin.events-table.height-arms"),
      width: 100,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin.events-table.height-arms")}
        </Typography>
      ),
    },
    ...(events && events.results.length > 0
      ? events.results
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
                  {eventsCounts && event.id in eventsCounts && (
                    <Typography variant="body2" color="textSecondary">
                      {t("pages.admin.events-table.attendance")}
                      {": "}
                      {eventsCounts[event.id].join("/")}
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

  const columnsFamilies: GridColDef[] = [
    { field: "id", headerName: "ID" },
    {
      field: "name",
      headerName: t("pages.admin.events-table.user"),
      width: 200,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin.events-table.user")}
        </Typography>
      ),
    },
    {
      field: "family",
      headerName: t("pages.admin.events-table.family"),
      width: 200,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin.events-table.family")}
        </Typography>
      ),
    },
    ...(events && events.results.length > 0
      ? events.results
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
    users && users.length > 0
      ? users.map((user: any, i: number, row: any) => {
          return {
            id: user.id,
            name: user.firstname + " " + user.lastname,
            heightShoulder: user.towers && user.towers.height_shoulders,
            heightArms: user.towers && user.towers.height_arms,
            ...(events && events.results.length > 0 && registrations
              ? Object.fromEntries(
                  events.results
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

  const rowsFamilies =
    userFamilies && userFamilies.length > 0
      ? userFamilies.map((user: any, i: number, row: any) => {
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
            ...(events && events.results.length > 0 && registrations
              ? Object.fromEntries(
                  events.results
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

  const content = user && (
    <Grid container spacing={4} className={styles.adminGrid}>
      <Card variant="outlined" className={styles.adminCard}>
        <Box className={styles.adminTopBox}>
          <Typography variant="h6" fontWeight="600" component="div">
            {t("pages.admin.events-table.title-adults")}
          </Typography>
        </Box>
        <Divider />

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
          />
        </Box>
      </Card>
      <Card variant="outlined" className={styles.adminCard}>
        <Box className={styles.adminTopBox}>
          <Typography variant="h6" fontWeight="600" component="div">
            {t("pages.admin.events-table.title-families")}
          </Typography>
        </Box>
        <Divider />

        <Box>
          <DataGrid
            rows={rowsFamilies}
            columns={columnsFamilies}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 25,
                },
              },
              columns: {
                ...columnsFamilies,
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
          />
        </Box>
      </Card>
    </Grid>
  );

  return (
    <PageBase
      title={t("pages.admin.title")}
      content={content}
      finishedRegistration={true}
    />
  );
}

export default AdminPage;
