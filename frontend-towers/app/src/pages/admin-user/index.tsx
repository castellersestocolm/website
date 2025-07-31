import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridEventListener,
  GridRenderCellParams,
  GridRowEditStopReasons,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
} from "@mui/x-data-grid";
import { apiAdminUserList, apiAdminUserUpdate } from "../../api";
import { Card, Divider, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import PageAdmin from "../../components/PageAdmin/PageAdmin";
import { getEnumLabel, MembershipStatus } from "../../enums";
import IconEdit from "@mui/icons-material/Edit";
import IconSave from "@mui/icons-material/Save";
import IconCancel from "@mui/icons-material/Close";

function AdminUserPage() {
  const { t } = useTranslation("common");

  const [users, setUsers] = React.useState(undefined);
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 100,
    page: 0,
  });
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {},
  );

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

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event,
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const processRowUpdate = (newUser: GridRowModel) => {
    if (users && users.results.length > 0) {
      const oldUser = users.results.find((user: any) => user.id === newUser.id);
      const newFixedUser = {
        ...oldUser,
        towers: {
          ...oldUser.towers,
          height_shoulders: newUser.heightShoulder,
          height_arms: newUser.heightArms,
          alias: newUser.alias,
        },
      };
      const newUsers = {
        ...users,
        results: users.results.map((user: any) =>
          user.id === newUser.id ? newFixedUser : user,
        ),
      };

      apiAdminUserUpdate(
        newUser.id,
        newUser.alias,
        newUser.heightShoulder,
        newUser.heightArms,
      ).then((response) => {
        if (response.status === 202) {
          setUsers(newUsers);
        }
      });

      return newFixedUser;
    }
  };

  const gridColumns: GridColDef[] = [
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
      type: "number",
      headerName: t("pages.admin-user.users-table.height-shoulders"),
      width: 100,
      editable: true,
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
      type: "number",
      headerName: t("pages.admin-user.users-table.height-arms"),
      width: 100,
      editable: true,
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
      field: "alias",
      type: "string",
      headerName: t("pages.admin-user.users-table.alias"),
      minWidth: 100,
      flex: 1,
      editable: true,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600}>
          {t("pages.admin-user.users-table.alias")}
        </Typography>
      ),
    },
    {
      field: "membershipStatus",
      headerName: t("pages.admin-user.users-table.membership-status"),
      width: 125,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: "right",
      cellClassName: styles.adminGridCell,
      headerClassName: styles.adminGridHeaderRight,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600} textAlign="right">
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
      filterable: false,
      disableColumnMenu: true,
      align: "right",
      headerClassName: styles.adminGridHeaderRight,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600} textAlign="right">
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
    {
      field: "actions",
      type: "actions",
      headerName: t("pages.admin-user.users-table.actions"),
      width: 100,
      align: "right",
      cellClassName: "actions",
      headerClassName: styles.adminGridHeaderRight,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600} textAlign="right">
          {t("pages.admin-user.users-table.actions")}
        </Typography>
      ),
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<IconSave />}
              label="Save"
              className="textPrimary"
              onClick={handleSaveClick(id)}
              color="inherit"
            />,
            <GridActionsCellItem
              icon={<IconCancel />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<IconEdit />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const gridRows =
    users && users.results.length > 0
      ? users.results.map((user: any, i: number, row: any) => {
          return {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            heightShoulder: user.towers && user.towers.height_shoulders,
            heightArms: user.towers && user.towers.height_arms,
            alias: user.towers && user.towers.alias,
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
            rows={gridRows}
            columns={gridColumns}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
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
                ...gridColumns,
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
