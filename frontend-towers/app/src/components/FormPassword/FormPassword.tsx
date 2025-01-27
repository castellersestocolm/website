import * as React from 'react';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid2';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';
import {useTranslation} from "react-i18next";
import {Button, Link, Stack} from "@mui/material";
import IconGoogle from "@mui/icons-material/Google";
import IconEast from "@mui/icons-material/East";
import styles from "./styles.module.css";
import Box from "@mui/material/Box";

const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

export default function FormPassword() {
  const { t } = useTranslation("common");

  return (
    <Grid container spacing={3}>
      <FormGrid size={{ xs: 12 }}>
        <Stack direction="column" spacing={2} className={styles.fields}>
      <FormGrid size={{ xs: 12, md: 6 }} className={styles.field}>
        <FormLabel htmlFor="email" required>
            {t("pages.user-login.form.email")}
        </FormLabel>
        <OutlinedInput
          id="email"
          name="email"
          type="email"
          placeholder="namn@namnsson.se"
          autoComplete="email"
          required
          size="small"
        />
      </FormGrid>
        </Stack>
      </FormGrid>
      <FormGrid size={{ xs: 12 }}>
        <Stack direction="column" spacing={1}>
            <Link href="/user/login" color="secondary" underline="none" className={styles.link}>{t("pages.user-password.form.link-login")}<IconEast className={styles.iconEast}/></Link>
        </Stack>
      </FormGrid>
      <FormGrid size={{ xs: 12 }}>
        <Stack direction="row" spacing={2} className={styles.buttons}>
        <Button variant="contained" disableElevation>{t("pages.user-password.form.button-reset")}</Button>
        </Stack>
      </FormGrid>
    </Grid>
  );
}
