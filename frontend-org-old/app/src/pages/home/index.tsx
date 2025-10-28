import styles from "./styles.module.css";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import FormJoin from "../../components/FormJoin/FormJoin";

function HomePage() {
  const { t } = useTranslation("common");

  const content = (
    <>
      <Grid container spacing={4} className={styles.homeGrid}>
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
