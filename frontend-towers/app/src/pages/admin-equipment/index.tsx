import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../components/AppContext/AppContext";
import Grid from "@mui/material/Grid";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { getEnumLabel } from "../../enums";
import { apiProductList } from "../../api";
import { Card, Divider, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import PageAdmin from "../../components/PageAdmin/PageAdmin";

function AdminEquipmentPage() {
  const [t, i18n] = useTranslation("common");

  const { user } = useAppContext();

  const [products, setProducts] = React.useState(undefined);

  React.useEffect(() => {
    apiProductList().then((response) => {
      if (response.status === 200) {
        setProducts(response.data);
      }
    });
  }, [setProducts, i18n.resolvedLanguage]);

  const content = user && (
    <Grid container spacing={4} className={styles.adminGrid}>
      {products &&
        products.results.length > 0 &&
        products.results.map((product: any, i: number, row: any) => {
          const columns: GridColDef[] = [
            { field: "id", headerName: "ID" },
            {
              field: "category",
              headerName: t("pages.admin-equipment.equipment-table.category"),
              width: 100,
              renderHeader: () => (
                <Typography variant="body2" fontWeight={600}>
                  {t("pages.admin-equipment.equipment-table.category")}
                </Typography>
              ),
            },
            {
              field: "size",
              headerName: t("pages.admin-equipment.equipment-table.size"),
              minWidth: 75,
              flex: 1,
              renderHeader: () => (
                <Typography variant="body2" fontWeight={600}>
                  {t("pages.admin-equipment.equipment-table.size")}
                </Typography>
              ),
            },
            {
              field: "stock",
              headerName: t("pages.admin-equipment.equipment-table.stock"),
              minWidth: 75,
              flex: 1,
              renderHeader: () => (
                <Typography variant="body2" fontWeight={600}>
                  {t("pages.admin-equipment.equipment-table.stock")}
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
            product.sizes && product.sizes.length > 0
              ? product.sizes.map((productSize: any, i: number, row: any) => {
                  return {
                    id: productSize.id,
                    category: getEnumLabel(
                      t,
                      "product-size-category",
                      productSize.category ? productSize.category : 0,
                    ),
                    size: productSize.size,
                    stock:
                      productSize.stock +
                      (productSize.stock_out_pending
                        ? " (" + productSize.stock_out_pending + ")"
                        : ""),
                  };
                })
              : [];

          return (
            <Grid
              container
              size={{ xs: 12, sm: 6, md: 3 }}
              spacing={4}
              direction="row"
            >
              <Card variant="outlined" className={styles.adminCard}>
                <Box className={styles.adminTopBox}>
                  <Typography variant="h6" fontWeight="600" component="div">
                    {product.name}
                  </Typography>
                </Box>
                <Divider />

                <Box>
                  <DataGrid
                    rows={rows}
                    columns={columns}
                    initialState={{
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
                    hideFooter
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
        })}
    </Grid>
  );

  return (
    <PageAdmin
      title={t("pages.admin-equipment.title")}
      content={content}
      finishedRegistration={true}
    />
  );
}

export default AdminEquipmentPage;
