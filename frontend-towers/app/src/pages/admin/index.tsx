import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../components/AppContext/AppContext";
import Grid from "@mui/material/Grid2";
import PageBase from "../../components/PageBase/PageBase";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import { PermissionLevel } from "../../enums";

function AdminPage() {
  const [t, i18n] = useTranslation("common");

  let navigate = useNavigate();

  const { user } = useAppContext();

  if (!user || user.permission_level < PermissionLevel.ADMIN) {
    navigate(ROUTES["user-login"].path, { replace: true });
  }

  const content = user && (
    <Grid container spacing={4} className={styles.adminGrid}>
      <Grid
        container
        size={{ xs: 12, md: 8 }}
        order={{ xs: 2, md: 1 }}
        spacing={4}
        direction="column"
      >
        Work in progress...
      </Grid>
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
