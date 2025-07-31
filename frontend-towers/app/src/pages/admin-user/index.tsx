import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { apiAdminUserList } from "../../api";
import { Card, Divider, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import PageAdmin from "../../components/PageAdmin/PageAdmin";
import {
  getEnumLabel,
  MembershipStatus,
  RegistrationStatus,
} from "../../enums";

function AdminUserPage() {
  const [t, i18n] = useTranslation("common");

  const [users, setUsers] = React.useState(undefined);
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 100,
    page: 0,
  });

  React.useEffect(() => {
    apiAdminUserList(
      paginationModel.page + 1,
      paginationModel.pageSize,
      "firstname,lastname",
    ).then((response) => {
      if (response.status === 200) {
        setUsers(response.data);
      }
    });
  }, [setUsers, paginationModel.page, paginationModel.pageSize]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID" },
    {
      field: "firstname",
      headerName: t("pages.admin-user.users-table.firstname"),
      width: 100,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-user.users-table.firstname")}
        </Typography>
      ),
    },
    {
      field: "lastname",
      headerName: t("pages.admin-user.users-table.lastname"),
      width: 150,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-user.users-table.lastname")}
        </Typography>
      ),
    },
    {
      field: "heightShoulder",
      headerName: t("pages.admin-user.users-table.height-shoulders"),
      width: 100,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-user.users-table.height-shoulders")}
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
      headerName: t("pages.admin-user.users-table.height-arms"),
      width: 100,
      flex: 1,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-user.users-table.height-arms")}
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
      field: "membershipStatus",
      headerName: t("pages.admin-user.users-table.membership-status"),
      width: 125,
      sortable: false,
      cellClassName: styles.adminGridCell,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-user.users-table.membership-status")}
        </Typography>
      ),
      renderCell: (params: any) => {
        const membershipStatus = params.row.membershipStatus;
        return (
          <Box
            className={
              membershipStatus === MembershipStatus.ACTIVE
                ? styles.adminTableCellActive
                : [
                      MembershipStatus.REQUESTED,
                      MembershipStatus.PROCESSING,
                    ].includes(membershipStatus)
                  ? styles.adminTableCellProcessing
                  : styles.adminTableCellExpired
            }
          >
            {getEnumLabel(t, "membership-status", membershipStatus)}
          </Box>
        );
      },
    },
    {
      field: "membershipDateTo",
      headerName: t("pages.admin-user.users-table.membership-date-to"),
      width: 125,
      sortable: false,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-user.users-table.membership-date-to")}
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
  ];

  const rows =
    users && users.results.length > 0
      ? users.results.map((user: any, i: number, row: any) => {
          return {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            heightShoulder: user.towers && user.towers.height_shoulders,
            heightArms: user.towers && user.towers.height_arms,
            membershipStatus: user.membership && user.membership.status,
            membershipDateTo:
              user.membership &&
              new Date(user.membership.date_to).toISOString().substring(0, 10),
          };
        })
      : [];

  const content = (
    <Grid container spacing={4} className={styles.adminGrid}>
      <Card variant="outlined" className={styles.adminCard}>
        <Box className={styles.adminTopBox}>
          <Typography variant="h6" fontWeight="600" component="div">
            {t("pages.admin-user.users-table.title")}
          </Typography>
        </Box>
        <Divider />

        <Box>
          <DataGrid
            rows={rows}
            columns={columns}
            rowCount={users && users.count}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={paginationModel}
            paginationMode="server"
            onPaginationModelChange={setPaginationModel}
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
                },
              },
              density: "compact",
              sorting: {
                sortModel: [{ field: "name", sort: "asc" }],
              },
            }}
            disableRowSelectionOnClick
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
    <PageAdmin
      title={t("pages.admin-user.title")}
      content={content}
      finishedRegistration={true}
    />
  );
}

export default AdminUserPage;
