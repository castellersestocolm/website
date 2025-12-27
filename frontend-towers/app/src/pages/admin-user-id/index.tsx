import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../components/AppContext/AppContext";
import Grid from "@mui/material/Grid";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { getEnumLabel } from "../../enums";
import {
  apiAdminTowersStatsPositionList,
  apiAdminUserRetrieve,
} from "../../api";
import { Card, Divider, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import PageAdmin from "../../components/PageAdmin/PageAdmin";
import { useParams } from "react-router-dom";

function AdminUserIdPage() {
  const [t, i18n] = useTranslation("common");
  const { id } = useParams();

  console.log("idddd", id);

  const { user } = useAppContext();

  const [currentUser, setCurrentUser] = React.useState(undefined);

  React.useEffect(() => {
    apiAdminUserRetrieve(id).then((response) => {
      if (response.status === 200) {
        setCurrentUser(response.data);
      }
    });
  }, [id, setCurrentUser]);

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
          <Box p={2}>
            <Typography variant="body1" component="div">
              Work in progress...
            </Typography>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <PageAdmin
      title={
        currentUser &&
        (currentUser.lastname
          ? currentUser.firstname + " " + currentUser.lastname
          : currentUser.firstname)
      }
      content={content}
      finishedRegistration={true}
      loading={!currentUser}
    />
  );
}

export default AdminUserIdPage;
