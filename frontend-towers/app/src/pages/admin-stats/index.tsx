import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../components/AppContext/AppContext";
import Grid from "@mui/material/Grid";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { getEnumLabel } from "../../enums";
import { apiAdminTowersStatsPositionList } from "../../api";
import { Card, Divider, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import PageAdmin from "../../components/PageAdmin/PageAdmin";

function AdminStatsPage() {
  const [t, i18n] = useTranslation("common");

  const { user } = useAppContext();

  const [positions, setPositions] = React.useState(undefined);

  React.useEffect(() => {
    apiAdminTowersStatsPositionList().then((response) => {
      if (response.status === 200) {
        setPositions(response.data);
      }
    });
  }, [setPositions]);

  const positionColumns: GridColDef[] = [
    { field: "type", headerName: t("pages.admin-stats.position-table.type") },
    {
      field: "name",
      headerName: t("pages.admin-stats.position-table.name"),
      width: 150,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-stats.position-table.name")}
        </Typography>
      ),
    },
    {
      field: "position1",
      headerName: t("pages.admin-stats.position-table.position-1"),
      minWidth: 150,
      flex: 1,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-stats.position-table.position-1")}
        </Typography>
      ),
    },
    {
      field: "position2",
      headerName: t("pages.admin-stats.position-table.position-2"),
      minWidth: 150,
      flex: 1,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-stats.position-table.position-2")}
        </Typography>
      ),
    },
    {
      field: "position3",
      headerName: t("pages.admin-stats.position-table.position-3"),
      minWidth: 150,
      flex: 1,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-stats.position-table.position-3")}
        </Typography>
      ),
    },
    {
      field: "position4",
      headerName: t("pages.admin-stats.position-table.position-4"),
      minWidth: 150,
      flex: 1,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-stats.position-table.position-4")}
        </Typography>
      ),
    },
    {
      field: "position5",
      headerName: t("pages.admin-stats.position-table.position-5"),
      minWidth: 150,
      flex: 1,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-stats.position-table.position-5")}
        </Typography>
      ),
    },
  ];

  const positionRows =
    positions && positions.results.length > 0
      ? positions.results.map((position: any, i: number, row: any) => {
          return {
            id: position.type,
            name: getEnumLabel(t, "towers-position-type", position.type),
            position1:
              position.users.length > 0
                ? position.users[0].times +
                  " — " +
                  position.users[0].user.firstname +
                  " " +
                  position.users[0].user.lastname
                : undefined,
            position2:
              position.users.length > 1
                ? position.users[1].times +
                  " — " +
                  position.users[1].user.firstname +
                  " " +
                  position.users[1].user.lastname
                : undefined,
            position3:
              position.users.length > 2
                ? position.users[2].times +
                  " — " +
                  position.users[2].user.firstname +
                  " " +
                  position.users[2].user.lastname
                : undefined,
            position4:
              position.users.length > 3
                ? position.users[3].times +
                  " — " +
                  position.users[3].user.firstname +
                  " " +
                  position.users[3].user.lastname
                : undefined,
            position5:
              position.users.length > 4
                ? position.users[4].times +
                  " — " +
                  position.users[4].user.firstname +
                  " " +
                  position.users[4].user.lastname
                : undefined,
          };
        })
      : [];

  const content = user && (
    <Grid container spacing={4} className={styles.adminGrid}>
      <Grid container size={12} spacing={4} direction="row">
        <Card variant="outlined" className={styles.adminCard}>
          <Box className={styles.adminTopBox}>
            <Typography variant="h6" fontWeight="600" component="div">
              {t("pages.admin-stats.position-table.title")}
            </Typography>
          </Box>
          <Divider />

          <Box>
            <DataGrid
              rows={positionRows}
              columns={positionColumns}
              initialState={{
                columns: {
                  ...positionColumns,
                  columnVisibilityModel: {
                    type: false,
                  },
                },
                density: "compact",
                sorting: {
                  sortModel: [{ field: "name", sort: "asc" }],
                },
              }}
              hideFooter
              disableRowSelectionOnClick
              sx={{
                border: 0,
                "& .MuiDataGrid-columnHeaders > div": {
                  height: "fit-content !important",
                },
              }}
              loading={!positions}
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
    </Grid>
  );

  return (
    <PageAdmin
      title={t("pages.admin-stats.title")}
      content={content}
      finishedRegistration={true}
    />
  );
}

export default AdminStatsPage;
