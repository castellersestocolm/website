import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridEventListener,
  GridRenderCellParams,
  GridRowEditStopReasons,
  GridRowHeightParams,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  gridStringOrNumberComparator,
} from "@mui/x-data-grid";
import { apiAdminUserList, apiAdminUserUpdate } from "../../api";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { getEnumLabel, MembershipStatus, OrderStatus } from "../../enums";
import IconEdit from "@mui/icons-material/Edit";
import IconSave from "@mui/icons-material/Save";
import IconCancel from "@mui/icons-material/Close";
import { filterProductsForUser } from "../../utils/product";
import AlertsInline from "../AlertsInline/AlertsInline";

export const TableUsers = ({ isAdult, products }: any) => {
  const { t } = useTranslation("common");

  const [users, setUsers] = React.useState(undefined);
  const [usersById, setUsersById] = React.useState(undefined);
  const [messages, setMessages] = React.useState(undefined);
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
      isAdult ? "firstname,lastname" : "family_name,firstname,lastname",
      isAdult,
    ).then((response) => {
      if (response.status === 200) {
        setUsers(response.data);
        setUsersById(
          Object.fromEntries(
            response.data.results.map((user: any) => [user.id, user]),
          ),
        );
      }
    });
  }, [
    setUsers,
    setUsersById,
    paginationModel.page,
    paginationModel.pageSize,
    isAdult,
  ]);

  const allProducts =
    products &&
    products.results.length > 0 &&
    filterProductsForUser(products.results, undefined);

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
        towers: isAdult
          ? {
              ...oldUser.towers,
              height_shoulders: newUser.heightShoulder,
              height_arms: newUser.heightArms,
              alias: newUser.alias,
            }
          : {
              ...oldUser.towers,
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
        isAdult ? newUser.heightShoulder : undefined,
        isAdult ? newUser.heightArms : undefined,
      ).then((response) => {
        if (response.status === 202) {
          setUsers(newUsers);
          setMessages([
            {
              userId: newUser.id,
              message: t("pages.admin-user.users-table.update.success"),
              type: "success",
            },
          ]);
          setTimeout(() => setMessages(undefined), 5000);
        } else {
          try {
            // TODO: Fix this for all values not just "towers"
            setMessages([
              {
                userId: newUser.id,
                message: Object.entries(response.data.towers)
                  .map(
                    ([field, errors]: [string, Array<any>]) =>
                      t(
                        "pages.admin-user.users-table." +
                          field.replace("_", "-"),
                      ) +
                      ": " +
                      errors.map((error: any) => error.detail).join(" "),
                  )
                  .join("\n"),
                type: "error",
              },
            ]);
          } catch {
            setMessages([
              {
                userId: newUser.id,
                message: t("pages.admin-user.users-table.update.error"),
                type: "error",
              },
            ]);
          }
          setTimeout(() => setMessages(undefined), 5000);
        }
      });

      return newFixedUser;
    }
  };

  const initGridColumns: GridColDef[] = [
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
      colSpan: (value, row) => (row.id.endsWith("-message") ? 10 : 1),
      renderCell: (params: GridRenderCellParams<any, string>) =>
        params.row.id.endsWith("-message") ? (
          <Box sx={{ margin: "0 -10px" }}>
            <AlertsInline messages={params.value} />
          </Box>
        ) : (
          params.value
        ),
      getSortComparator: (sortDirection) => {
        const modifier = sortDirection === "desc" ? -1 : 1;
        return (value1, value2, cellParams1, cellParams2) => {
          console.log(cellParams1, cellParams2, value1, value2);
          const realValue1 = usersById
            ? usersById[cellParams1.id.toString().replace("-message", "")][
                cellParams1.field
              ]
            : value1;
          const realValue2 = usersById
            ? usersById[cellParams2.id.toString().replace("-message", "")][
                cellParams2.field
              ]
            : value2;

          if (realValue1 === null) {
            return 1;
          }
          if (realValue2 === null) {
            return -1;
          }
          return (
            modifier *
            gridStringOrNumberComparator(
              realValue1,
              realValue2,
              cellParams1,
              cellParams2,
            )
          );
        };
      },
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
  ];

  const midGridColumns: GridColDef[] = isAdult
    ? initGridColumns.concat([
        {
          field: "heightShoulder",
          type: "number",
          headerName: t("pages.admin-user.users-table.height-shoulders"),
          width: 100,
          editable: isAdult,
          align: "left",
          headerAlign: "left",
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
          editable: isAdult,
          align: "left",
          headerAlign: "left",
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
      ])
    : initGridColumns.concat([
        {
          field: "family",
          type: "string",
          headerName: t("pages.admin-user.users-table.family"),
          width: 150,
          align: "left",
          headerAlign: "left",
          renderHeader: () => (
            <Typography variant="body2" fontWeight={600}>
              {t("pages.admin-user.users-table.family")}
            </Typography>
          ),
        },
      ]);

  // @ts-ignore
  const gridColumns: GridColDef[] = midGridColumns.concat([
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
    ...(allProducts && allProducts.length > 0
      ? allProducts.map((product: any) => {
          return {
            field: "product-" + product.id,
            headerName: product.name,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            width: 100,
            align: "right",
            headerAlign: "right",
            cellClassName: styles.adminGridCell,
            headerClassName: styles.adminGridHeaderRight,
            renderHeader: () => (
              <Typography variant="body2" fontWeight={600}>
                {product.name}
              </Typography>
            ),
            renderCell: (params: any) => {
              const orderStatus = params.row["product-" + product.id];
              return (
                <Box
                  className={
                    orderStatus !== undefined
                      ? orderStatus === OrderStatus.COMPLETED
                        ? styles.adminTableCellActive
                        : orderStatus === OrderStatus.PROCESSING
                          ? styles.adminTableCellProcessing
                          : styles.adminTableCellExpired
                      : undefined
                  }
                >
                  {orderStatus !== undefined
                    ? orderStatus === OrderStatus.COMPLETED
                      ? t("pages.admin-user.users-table.product.yes")
                      : orderStatus === OrderStatus.PROCESSING
                        ? t("pages.admin-user.users-table.product.ordered")
                        : t("pages.admin-user.users-table.product.no")
                    : undefined}
                </Box>
              );
            },
          };
        })
      : []),
    {
      field: "membershipStatus",
      headerName: t("pages.admin-user.users-table.membership-status"),
      width: 125,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: "right",
      headerAlign: "right",
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
      headerAlign: "right",
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
      headerAlign: "right",
      cellClassName: "actions",
      headerClassName: styles.adminGridHeaderRight,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600} textAlign="right">
          {t("pages.admin-user.users-table.actions")}
        </Typography>
      ),
      getActions: ({ id }: any) => {
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
  ]);

  const gridRows =
    users && users.results.length > 0
      ? users.results
          .map((user: any, i: number, row: any) => {
            const userTeamIds = user.members
              ? user.members.map((member: any) => member.team.id)
              : [];
            const userProducts =
              products &&
              products.results.length > 0 &&
              filterProductsForUser(products.results, userTeamIds);
            const userProdcutIds =
              userProducts && userProducts.map((product: any) => product.id);
            const currentMessages =
              messages &&
              messages.filter((message: any) => message.userId === user.id);

            return [
              {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                ...(isAdult
                  ? {
                      heightShoulder:
                        user.towers && user.towers.height_shoulders,
                      heightArms: user.towers && user.towers.height_arms,
                    }
                  : {
                      family: Array.from(
                        new Set(
                          user.family.members
                            .filter((member: any) => member.user.can_manage)
                            .map(
                              (member: any) =>
                                member.user.lastname.split(" ")[0],
                            ),
                        ),
                      ).join("-"),
                    }),
                alias: user.towers && user.towers.alias,
                ...(allProducts &&
                allProducts.length > 0 &&
                userProducts &&
                userProducts.length > 0 &&
                userProdcutIds
                  ? Object.fromEntries(
                      allProducts.map((product: any) => {
                        const order =
                          user.orders &&
                          user.orders.find(
                            (order: any) =>
                              order.products.filter(
                                (orderProduct: any) =>
                                  orderProduct.size.product.id === product.id,
                              ).length > 0,
                          );

                        const orderProductGiven =
                          user.orders &&
                          user.orders.filter(
                            (order: any) =>
                              order.products.filter(
                                (orderProduct: any) =>
                                  orderProduct.size.product.id === product.id &&
                                  orderProduct.quantity_given > 0,
                              ).length > 0,
                          ).length > 0;

                        const userProduct =
                          user.products &&
                          user.products.find(
                            (userProduct: any) =>
                              userProduct.product.id === product.id,
                          );

                        const orderStatus =
                          userProduct || orderProductGiven
                            ? OrderStatus.COMPLETED
                            : order
                              ? order.status
                              : OrderStatus.CANCELED;

                        return [
                          "product-" + product.id,
                          userProdcutIds.includes(product.id)
                            ? orderStatus
                            : undefined,
                        ];
                      }),
                    )
                  : {}),
                membershipStatus: user.membership && user.membership.status,
                membershipDateTo:
                  user.membership &&
                  new Date(user.membership.date_to)
                    .toISOString()
                    .substring(0, 10),
              },
              ...(messages && currentMessages.length > 0
                ? [
                    {
                      id: user.id + "-message",
                      firstname: currentMessages,
                    },
                  ]
                : []),
            ];
          })
          .flat()
          .filter((user: any) => user)
      : [];

  return (
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
            heightShoulder: isAdult,
            heightArms: isAdult,
          },
        },
        density: "compact",
        sorting: {
          sortModel: isAdult
            ? [
                { field: "firstname", sort: "asc" },
                { field: "lastname", sort: "asc" },
              ]
            : [
                { field: "family", sort: "asc" },
                { field: "firstname", sort: "asc" },
                { field: "lastname", sort: "asc" },
              ],
        },
      }}
      disableRowSelectionOnClick
      sx={{
        border: 0,
        "& .MuiDataGrid-columnHeaders > div": {
          height: "fit-content !important",
        },
      }}
      loading={!users}
      slotProps={{
        loadingOverlay: {
          variant: "circular-progress",
          noRowsVariant: "circular-progress",
        },
      }}
      getRowHeight={({ id, densityFactor }: GridRowHeightParams) => {
        return id.toString().endsWith("-message") ? "auto" : null;
      }}
    />
  );
};
