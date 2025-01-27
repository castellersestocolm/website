import styles from "./styles.module.css";
import { Container, Link, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import FormJoin from "../../components/FormJoin/FormJoin";

function UserJoinPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Box component="section" className={styles.userJoin}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight="700"
            className={styles.userJoinTitle}
          >
            {t("pages.user-join.title")}
          </Typography>
          <FormJoin />
        </Container>
      </Box>
    </>
  );
}

export default UserJoinPage;
