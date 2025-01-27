import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid2';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';
import {useTranslation} from "react-i18next";
import {Button, Link, Stack} from "@mui/material";
import styles from "./styles.module.css";
import IconGoogle from "@mui/icons-material/Google";
import IconEast from "@mui/icons-material/East";

const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

export default function FormJoin() {
  const { t } = useTranslation("common");

  return (
    <Grid container spacing={3}>
      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="first-name" required>
            {t("pages.user-join.form.first-name")}
        </FormLabel>
        <OutlinedInput
          id="first-name"
          name="first-name"
          type="name"
          placeholder="Namn"
          autoComplete="first name"
          required
          size="small"
        />
      </FormGrid>
      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="last-name" required>
            {t("pages.user-join.form.last-name")}
        </FormLabel>
        <OutlinedInput
          id="last-name"
          name="last-name"
          type="last-name"
          placeholder="Namnsson"
          autoComplete="last name"
          required
          size="small"
        />
      </FormGrid>
      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="email" required>
            {t("pages.user-join.form.email")}
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
      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="phone" required>
            {t("pages.user-join.form.phone")}
        </FormLabel>
        <OutlinedInput
          id="phone"
          name="phone"
          type="phone"
          placeholder="+4687461000"
          autoComplete="phone"
          required
          size="small"
        />
      </FormGrid>
      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="birthday" required>
            {t("pages.user-join.form.birthday")}
        </FormLabel>
        <OutlinedInput
          id="birthday"
          name="birthday"
          type="date"
          autoComplete="birthday"
          required
          size="small"
        />
      </FormGrid>
      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="height" required>
            {t("pages.user-join.form.height")}
        </FormLabel>
        <OutlinedInput
          id="height"
          name="height"
          type="number"
          placeholder="175"
          inputProps={{ min: 50, max: 250 }}
          autoComplete="height"
          required
          size="small"
        />
      </FormGrid>
      <FormGrid size={{ xs: 12 }}>
        <FormControlLabel
          control={<Checkbox name="confirmCasal" value="yes" />}
          label={t("pages.user-join.form.checkbox-image")}
        />
      </FormGrid>
      <FormGrid size={{ xs: 12 }}>
        <FormControlLabel
          control={<Checkbox name="confirmCasal" value="yes" />}
          label={t("pages.user-join.form.checkbox-responsibility")}
        />
      </FormGrid>
      <FormGrid size={{ xs: 12 }}>
        <FormControlLabel
          control={<Checkbox name="confirmCasal" value="yes" />}
          label={t("pages.user-join.form.checkbox-processing")}
        />
      </FormGrid>
      <FormGrid size={{ xs: 12 }}>
        <Stack direction="column" spacing={1}>
            <Link href="/user/login" color="secondary" underline="none" className={styles.link}>{t("pages.user-join.form.link-already-account")}<IconEast className={styles.iconEast} /></Link>
        </Stack>
      </FormGrid>
      <FormGrid size={{ xs: 12 }}>
        <Stack direction="row" spacing={2} className={styles.buttons}>
        <Button variant="contained" disableElevation>{t("pages.user-join.form.button-join")}</Button>
        <Button variant="contained" color="secondary" disableElevation>{t("pages.user-join.form.button-join-google")}<IconGoogle className={styles.iconGoogle} /></Button>
        </Stack>
      </FormGrid>
    </Grid>
  );
}
