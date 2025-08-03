import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import { Card, Divider, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import PageAdmin from "../../components/PageAdmin/PageAdmin";
import { TableUsers } from "../../components/TableUsers/TableUsers";
import { apiProductList } from "../../api";

function AdminUserPage() {
  const [t, i18n] = useTranslation("common");

  const [products, setProducts] = React.useState(undefined);

  React.useEffect(() => {
    apiProductList().then((response) => {
      if (response.status === 200) {
        setProducts(response.data);
      }
    });
  }, [setProducts, i18n.resolvedLanguage]);

  const content = (
    <Grid container spacing={4} className={styles.adminGrid}>
      <Card variant="outlined" className={styles.adminCard}>
        <Box className={styles.adminTopBox}>
          <Typography variant="h6" fontWeight="600" component="div">
            {t("pages.admin-user.users-table.title-adults")}
          </Typography>
        </Box>
        <Divider />
        <Box>
          <TableUsers isAdult={true} products={products} />
        </Box>
      </Card>
      <Card variant="outlined" className={styles.adminCard}>
        <Box className={styles.adminTopBox}>
          <Typography variant="h6" fontWeight="600" component="div">
            {t("pages.admin-user.users-table.title-children")}
          </Typography>
        </Box>
        <Divider />
        <Box>
          <TableUsers isAdult={false} products={products} />
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
