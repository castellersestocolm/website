import styles from "./styles.module.css";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import FormStatus from "../../components/FormStatus/FormStatus";
import { Link, Typography } from "@mui/material";
import { ROUTES } from "../../routes";
import IconEast from "@mui/icons-material/East";
import { useNavigate } from "react-router-dom";

function StatusPage() {
  const { t } = useTranslation("common");
  let navigate = useNavigate();

  const content = (
    <>
      <Grid container spacing={4} className={styles.homeGrid}>
        <Grid size={12} textAlign="center">
          <Typography variant="h6">
            <Link
              onClick={() => navigate(ROUTES.home.path)}
              color="secondary"
              underline="none"
              target="_blank"
              className={styles.link}
            >
              {t("pages.status.home")}
              <IconEast className={styles.iconEast} />
            </Link>
          </Typography>
        </Grid>
        <FormStatus />
      </Grid>
    </>
  );

  return (
    <PageBase
      title={t("pages.home.title")}
      subtitle={t("pages.status.subtitle")}
      content={content}
    />
  );
}

export default StatusPage;
