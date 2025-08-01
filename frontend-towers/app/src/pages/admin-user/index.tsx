import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import { Card, Divider, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import PageAdmin from "../../components/PageAdmin/PageAdmin";
import { TableUsers } from "../../components/TableUsers/TableUsers";

function AdminUserPage() {
  const { t } = useTranslation("common");

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
          <TableUsers isAdult={true} />
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
          <TableUsers isAdult={false} />
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
