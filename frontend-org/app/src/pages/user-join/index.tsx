import styles from "./styles.module.css";
import { Link, Typography } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import PageBase from "../../components/PageBase/PageBase";
import FormJoin from "../../components/FormJoin/FormJoin";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import IconEast from "@mui/icons-material/East";
import { useAppContext } from "../../components/AppContext/AppContext";

function UserJoinPage() {
  const { t } = useTranslation("common");

  let navigate = useNavigate();

  const { user } = useAppContext();

  React.useEffect(() => {
    if (user) {
      navigate(ROUTES["user-dashboard"].path);
    }
  }, [user, navigate]);

  const content = (
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
  );

  return <PageBase title={t("pages.user-join.title")} content={content} />;
}

export default UserJoinPage;
