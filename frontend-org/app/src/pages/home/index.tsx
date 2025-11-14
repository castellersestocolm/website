import styles from "./styles.module.css";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import FormJoin from "../../components/FormJoin/FormJoin";
import { Typography, Link } from "@mui/material";
import IconEast from "@mui/icons-material/East";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";

function HomePage() {
  const { t } = useTranslation("common");
  let navigate = useNavigate();

  const content = (
    <>
      <Grid container spacing={4} className={styles.homeGrid}>
        <Grid size={12} textAlign="center">
          <Typography variant="h6">
            <Link
              onClick={() => navigate(ROUTES.status.path)}
              color="secondary"
              underline="none"
              target="_blank"
              className={styles.link}
            >
              {t("pages.home.unsure-member")}
              <IconEast className={styles.iconEast} />
            </Link>
          </Typography>
        </Grid>
        <FormJoin />
      </Grid>
    </>
  );

  return (
    <PageBase
      title={t("pages.home.title")}
      subtitle={t("pages.home.subtitle")}
      content={content}
    />
  );
}

export default HomePage;
