import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../components/AppContext/AppContext";
import Grid from "@mui/material/Grid2";
import PageBase from "../../components/PageBase/PageBase";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import { getEnumLabel, PermissionLevel, RegistrationStatus } from "../../enums";
import { apiEventList, apiEventRegistrationList, apiUserList } from "../../api";
import {
  Card,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
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
        console.log(event);
      }
    }
  }, [events, setRegistrations]);

  if (!user || user.permission_level < PermissionLevel.ADMIN) {
    navigate(ROUTES["user-login"].path, { replace: true });
  }

  const content = user && (
    <Grid container spacing={4} className={styles.adminGrid}>
      <Card variant="outlined" className={styles.adminCard}>
        <Box className={styles.adminTopBox}>
          <Typography variant="h6" fontWeight="600" component="div">
            {t("pages.admin.events-table.title")}
          </Typography>
        </Box>
        <Divider />

        <Box>
          <TableContainer>
            <Table sx={{ minWidth: 700 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {t("pages.admin.events-table.user")}
                    </Typography>
                  </TableCell>
                  {events &&
                    events.results.length > 0 &&
                    events.results
                      .filter((event: any) => event.require_signup)
                      .map((event: any) => {
                        return (
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {event.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {capitalizeFirstLetter(
                                new Date(event.time_from)
                                  .toISOString()
                                  .slice(0, 10),
                              ) +
                                " " +
                                new Date(event.time_from)
                                  .toTimeString()
                                  .slice(0, 5)}
                            </Typography>
                          </TableCell>
                        );
                      })}
                </TableRow>
              </TableHead>
              <TableBody>
                {users &&
                  users.length > 0 &&
                  users.map((user: any, i: number, row: any) => {
                    return (
                      <TableRow
                        key={user.id}
                        className={
                          i + 1 >= row.length && styles.adminTableRowLast
                        }
                      >
                        <TableCell component="th" scope="row">
                          {user.firstname} {user.lastname}
                        </TableCell>
                        {events &&
                          events.results.length > 0 &&
                          registrations &&
                          events.results
                            .filter((event: any) => event.require_signup)
                            .map((event: any) => {
                              const registration =
                                event.id in registrations &&
                                user.id in registrations[event.id] &&
                                registrations[event.id][user.id];
                              return (
                                <TableCell
                                  className={
                                    registration
                                      ? registration.status ===
                                        RegistrationStatus.ACTIVE
                                        ? styles.adminTableCellAttending
                                        : registration.status ===
                                            RegistrationStatus.CANCELLED
                                          ? styles.adminTableCellNotAttending
                                          : styles.adminTableCellUnknown
                                      : styles.adminTableCellUnknown
                                  }
                                >
                                  {getEnumLabel(
                                    t,
                                    "registration-status",
                                    registration
                                      ? registration.status
                                      : RegistrationStatus.CANCELLED,
                                  )}
                                </TableCell>
                              );
                            })}
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
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
