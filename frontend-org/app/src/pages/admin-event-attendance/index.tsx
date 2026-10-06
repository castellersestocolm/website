import * as React from "react";
import PageAdmin from "../../components/PageAdmin/PageAdmin";
import { useParams } from "react-router-dom";
import {
  apiAdminEventGet,
  apiAdminEventRegistrationsGet,
  apiAdminEventRegistrationsSearch,
  apiAdminEventRegistrationUpdate,
} from "../../api";
import styles from "./styles.module.css";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { LoaderClip } from "../../components/LoaderClip/LoaderClip";
import {
  Card,
  Divider,
  Typography,
  Stack,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import Box from "@mui/material/Box";
import {
  RegistrationStatus,
  getEnumLabel,
  REGISTRATION_STATUS_ICON,
} from "../../enums";
import { getEventQuestionAnswer } from "../../utils/event";
import { getAge } from "../../utils/datetime";
import { isMobile } from "react-device-detect";
import IconQrCode from "@mui/icons-material/QrCode";
import IconExpandLess from "@mui/icons-material/ExpandLess";
import IconExpandMore from "@mui/icons-material/ExpandMore";
import ScannerQR from "../../components/ScannerQR/ScannerQR";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

function AdminEventAttendancePage() {
  const { id } = useParams();

  const [event, setEvent] = React.useState(undefined);
  const [registrations, setRegistrations] = React.useState(undefined);
  const [foundRegistrations, setFoundRegistrations] = React.useState(undefined);
  const [searchLoading, setSearchLoading] = React.useState(false);

  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [searchText, setSearchText] = React.useState(undefined);

  const [t, i18n] = useTranslation("common");

  React.useEffect(() => {
    if (id) {
      apiAdminEventGet(id).then((response) => {
        if (response.status === 200) {
          setEvent(response.data);
        }
      });
    }
  }, [id, setEvent]);

  React.useEffect(() => {
    if (id) {
      apiAdminEventRegistrationsGet(id).then((response) => {
        if (response.status === 200) {
          setRegistrations(response.data);
        }
      });
    }
  }, [id, setRegistrations]);

  React.useEffect(() => {
    if (searchText) {
      setSearchLoading(true);
      apiAdminEventRegistrationsSearch(id, searchText).then((response) => {
        if (response.status === 200) {
          setFoundRegistrations(response.data);
        }
        setSearchLoading(false);
      });
    } else {
      setFoundRegistrations(undefined);
    }
  }, [id, searchText, setFoundRegistrations, setSearchLoading]);

  function handleSetAttendance(registrationId: string, hasAttended: boolean) {
    apiAdminEventRegistrationUpdate(registrationId, hasAttended).then(
      (response) => {
        if (response.status === 200) {
          setRegistrations({
            ...registrations,
            results: registrations.results.map((registration: any) =>
              registration.id === response.data.id
                ? response.data
                : registration,
            ),
          });
          setFoundRegistrations({
            ...foundRegistrations,
            results: foundRegistrations.results.map((registration: any) =>
              registration.id === response.data.id
                ? response.data
                : registration,
            ),
          });
        }
      },
    );
  }

  function scannerOnDetected(text: string) {
    setSearchText(text);
    setScannerOpen(false);
  }

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", cellClassName: styles.adminCell },
    { field: "sort", headerName: "ST", cellClassName: styles.adminCell },
    {
      field: "firstname",
      headerName: t("pages.admin-event-attendance.table.firstname"),
      minWidth: 150,
      cellClassName: styles.adminCell,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-event-attendance.table.firstname")}
        </Typography>
      ),
    },
    {
      field: "lastname",
      headerName: t("pages.admin-attendance.events-table.lastname"),
      minWidth: 150,
      cellClassName: styles.adminCell,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-event-attendance.table.lastname")}
        </Typography>
      ),
    },
    {
      field: "owner",
      headerName: t("pages.admin-attendance.events-table.owner"),
      minWidth: 200,
      cellClassName: styles.adminCell,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-event-attendance.table.owner")}
        </Typography>
      ),
    },
    {
      field: "questions",
      headerName: t("pages.admin-event-attendance.table.questions"),
      sortable: false,
      minWidth: 200,
      flex: 1,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-event-attendance.table.questions")}
        </Typography>
      ),
      renderCell: (params: any) => {
        return (
          <Box pt={1}>
            {event &&
              event.questions &&
              event.questions.length > 0 &&
              event.questions.map((eventQuestion: any) => {
                const registrationAnswer =
                  params.row["data"].questions &&
                  params.row["data"].questions[eventQuestion.order.toString()];
                const eventQuestionAnswer = getEventQuestionAnswer(
                  t,
                  i18n.resolvedLanguage,
                  eventQuestion,
                  registrationAnswer,
                );
                return (
                  eventQuestionAnswer != null && (
                    <Box pb={1}>
                      <Typography variant="body2" fontWeight={600}>
                        {eventQuestion.title}
                      </Typography>
                      <Typography variant="body2">
                        {eventQuestionAnswer}
                      </Typography>
                    </Box>
                  )
                );
              })}
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: t("pages.admin-event-attendance.table.actions"),
      sortable: false,
      headerAlign: "right",
      align: "right",
      minWidth: 150,
      cellClassName: styles.adminButtonsCell,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-event-attendance.table.actions")}
        </Typography>
      ),
      renderCell: (params: any) => {
        return (
          <Stack direction="row" spacing={2} className={styles.buttons}>
            <Button
              variant="contained"
              type="button"
              onClick={() =>
                handleSetAttendance(
                  params.row["id"],
                  params.row["status"] !== RegistrationStatus.ATTENDED,
                )
              }
              disableElevation
            >
              {params.row["status"] === RegistrationStatus.ATTENDED
                ? t(
                    "pages.admin-event-attendance.table.actions.button-not-attend",
                  )
                : t("pages.admin-event-attendance.table.actions.button-attend")}
            </Button>
          </Stack>
        );
      },
    },
    {
      field: "status",
      headerName: t("pages.admin-attendance.events-table.status"),
      sortable: false,
      ...(event && event.questions && event.questions.length > 0
        ? {}
        : { flex: 1 }),
      minWidth: 150,
      cellClassName: styles.adminGridCell,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-event-attendance.table.status")}
        </Typography>
      ),
      renderCell: (params: any) => {
        return (
          <Box
            className={
              params.row["status"] === RegistrationStatus.ATTENDED
                ? styles.adminTableCellAttended
                : params.row["status"] === RegistrationStatus.ACTIVE
                  ? styles.adminTableCellAttending
                  : params.row["status"] === RegistrationStatus.CANCELLED
                    ? styles.adminTableCellNotAttending
                    : styles.adminTableCellUnknown
            }
          >
            {getEnumLabel(t, "registration-status", params.row["status"])}
          </Box>
        );
      },
    },
  ];

  const rows =
    registrations && registrations.results && registrations.results.length > 0
      ? registrations.results.map((registration: any) => {
          return {
            id: registration.id,
            firstname: registration.entity.firstname,
            lastname: registration.entity.lastname,
            owner: registration.owner
              ? registration.owner.firstname + " " + registration.owner.lastname
              : registration.entity.firstname +
                " " +
                registration.entity.lastname,
            sort:
              (registration.owner
                ? registration.owner.firstname +
                  " " +
                  registration.owner.lastname
                : registration.entity.firstname +
                  registration.entity.lastname) +
              " — " +
              (registration.entity.firstname +
                " " +
                registration.entity.lastname),
            status: registration.status,
            data: registration.data,
          };
        })
      : [];

  const content = (
    <Grid container spacing={4} className={styles.adminGrid}>
      {isMobile && (
        <Card variant="outlined" className={styles.adminCard}>
          <Box className={styles.adminTopBox}>
            <Typography variant="h6" fontWeight="600" component="div">
              {t("pages.admin-event-attendance.scan.title")}
            </Typography>
          </Box>
          <Divider />
          <Box>
            <List className={styles.userFamilyList}>
              <ListItemButton
                onClick={() => setScannerOpen(!scannerOpen)}
                dense
              >
                <ListItemIcon>
                  <IconQrCode />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" component="span">
                      {t("pages.admin-event-attendance.scan.action")}
                    </Typography>
                  }
                />
                {scannerOpen ? <IconExpandLess /> : <IconExpandMore />}
              </ListItemButton>
              <Collapse in={scannerOpen} timeout="auto" unmountOnExit>
                <Divider />
                <ScannerQR onDetected={scannerOnDetected} />
              </Collapse>
              <Divider />
              <Box className={styles.adminSearchBox}>
                <FormGrid size={12}>
                  <FormLabel htmlFor="firstname" required>
                    {t("pages.admin-event-attendance.scan.search")}
                  </FormLabel>
                  <OutlinedInput
                    id="search"
                    name="search"
                    type="text"
                    placeholder="Test Testsson"
                    size="small"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </FormGrid>
              </Box>
              {((foundRegistrations &&
                foundRegistrations.results &&
                foundRegistrations.results.length > 0) ||
                searchLoading) && (
                <>
                  <Divider />
                  {searchLoading ? (
                    <Box className={styles.providerLoader}>
                      <LoaderClip />
                    </Box>
                  ) : (
                    foundRegistrations &&
                    foundRegistrations.results &&
                    foundRegistrations.results.length > 0 && (
                      <Box>
                        {foundRegistrations.results.map(
                          (registration: any, i: number, row: any) => {
                            return (
                              <>
                                <Box className={styles.registrationsDetailsBox}>
                                  <List className={styles.userFamilyList}>
                                    <ListItemButton disableTouchRipple dense>
                                      <ListItemIcon
                                        className={
                                          registration.status ===
                                          RegistrationStatus.ATTENDED
                                            ? styles.adminIconRegistrationAttended
                                            : registration.status ===
                                                RegistrationStatus.ACTIVE
                                              ? styles.adminIconRegistrationAttending
                                              : registration.status ===
                                                  RegistrationStatus.CANCELLED
                                                ? styles.adminIconRegistrationNotAttending
                                                : styles.adminIconRegistrationUnknown
                                        }
                                      >
                                        {
                                          REGISTRATION_STATUS_ICON[
                                            registration.status
                                          ]
                                        }
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={
                                          registration.entity.firstname +
                                          " " +
                                          registration.entity.lastname
                                        }
                                        secondary={
                                          registration.entity.id ===
                                          registration.owner.id
                                            ? t(
                                                "pages.admin-event-attendance.scan.table.owner",
                                              )
                                            : !registration.entity.can_manage &&
                                              registration.entity.birthday &&
                                              getAge(
                                                registration.entity.birthday,
                                              ) +
                                                " " +
                                                t("common.integer.years")
                                        }
                                      />
                                      <Stack
                                        direction="row"
                                        spacing={2}
                                        className={styles.buttons}
                                      >
                                        <Button
                                          variant="contained"
                                          type="button"
                                          onClick={() =>
                                            handleSetAttendance(
                                              registration.id,
                                              registration.status !==
                                                RegistrationStatus.ATTENDED,
                                            )
                                          }
                                          disableElevation
                                        >
                                          {registration.status ===
                                          RegistrationStatus.ATTENDED
                                            ? t(
                                                "pages.admin-event-attendance.table.actions.button-not-attend",
                                              )
                                            : t(
                                                "pages.admin-event-attendance.table.actions.button-attend",
                                              )}
                                        </Button>
                                      </Stack>
                                    </ListItemButton>
                                    <Box
                                      className={
                                        styles.registrationQuestionsBox
                                      }
                                    >
                                      {event &&
                                        event.questions &&
                                        event.questions.length > 0 &&
                                        event.questions.map(
                                          (eventQuestion: any) => {
                                            const registrationAnswer =
                                              registration.data.questions &&
                                              registration.data.questions[
                                                eventQuestion.order.toString()
                                              ];
                                            const eventQuestionAnswer =
                                              getEventQuestionAnswer(
                                                t,
                                                i18n.resolvedLanguage,
                                                eventQuestion,
                                                registrationAnswer,
                                              );
                                            return (
                                              eventQuestionAnswer != null && (
                                                <Box pb={1}>
                                                  <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                  >
                                                    {eventQuestion.title}
                                                  </Typography>
                                                  <Typography variant="body2">
                                                    {eventQuestionAnswer}
                                                  </Typography>
                                                </Box>
                                              )
                                            );
                                          },
                                        )}
                                    </Box>
                                  </List>
                                </Box>
                                {i + 1 < row.length && <Divider />}
                              </>
                            );
                          },
                        )}
                      </Box>
                    )
                  )}
                </>
              )}
            </List>
          </Box>
        </Card>
      )}
      <Card variant="outlined" className={styles.adminCard}>
        <Box className={styles.adminTopBox}>
          <Typography variant="h6" fontWeight="600" component="div">
            {t("pages.admin-event-attendance.table.title")}
          </Typography>
        </Box>
        <Divider />
        <Box>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 100,
                },
              },
              columns: {
                ...columns,
                columnVisibilityModel: {
                  id: false,
                  sort: false,
                  ...(event && event.questions && event.questions.length > 0
                    ? { questions: false }
                    : {}),
                },
              },
              density: "compact",
              sorting: {
                sortModel: [{ field: "sort", sort: "asc" }],
              },
            }}
            autosizeOptions={{
              columns: ["actions"],
              includeOutliers: true,
              includeHeaders: false,
            }}
            columnHeaderHeight={40}
            getRowHeight={() => "auto"}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50, 100]}
            sx={{
              border: 0,
            }}
            loading={!registrations}
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
      title={event && event.title}
      content={content}
      loading={!event}
    />
  );
}

export default AdminEventAttendancePage;
