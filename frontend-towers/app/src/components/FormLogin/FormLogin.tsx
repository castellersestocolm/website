import * as React from "react";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { Button, FormHelperText, Link, Stack } from "@mui/material";
import IconGoogle from "@mui/icons-material/Google";
import IconEast from "@mui/icons-material/East";
import styles from "./styles.module.css";
import { apiUserLogin } from "../../api";
import { useAppContext } from "../AppContext/AppContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import { useState } from "react";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
}
interface LoginFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export default function FormLogin() {
  const [t, i18n] = useTranslation("common");

  const [validationErrors, setValidationErrors] = useState(undefined);
  const { setUser } = useAppContext();
  let navigate = useNavigate();

  function handleSubmit(event: React.FormEvent<LoginFormElement>) {
    event.preventDefault();
    apiUserLogin(
      event.currentTarget.elements.email.value,
      event.currentTarget.elements.password.value,
    ).then((response) => {
      if (response.status === 200) {
        setUser(response.data);
        if (response.data.preferred_language) {
          i18n.changeLanguage(response.data.preferred_language);
        }
        navigate(ROUTES["user-dashboard"].path);
      } else if (response.status === 429) {
        setValidationErrors({ throttle: response.data.detail });
      } else {
        setValidationErrors({ error: t("pages.user-login.form.error") });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
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
            <FormGrid size={{ xs: 12, md: 6 }} className={styles.field}>
              <FormLabel htmlFor="password" required>
                {t("pages.user-login.form.password")}
              </FormLabel>
              <OutlinedInput
                id="password"
                name="password"
                type="password"
                autoComplete="password"
                required
                size="small"
              />
            </FormGrid>
          </Stack>
        </FormGrid>
        <FormGrid size={{ xs: 12 }}>
          <Stack direction="column" spacing={1}>
            <Link
              href={ROUTES["user-join"].path}
              color="secondary"
              underline="none"
              className={styles.link}
            >
              {t("pages.user-login.form.link-no-account")}
              <IconEast className={styles.iconEast} />
            </Link>
            <Link
              href={ROUTES["user-password"].path}
              color="secondary"
              underline="none"
              className={styles.link}
            >
              {t("pages.user-login.form.link-forgot-password")}
              <IconEast className={styles.iconEast} />
            </Link>
          </Stack>
        </FormGrid>
        <FormGrid size={{ xs: 12 }}>
          <Stack direction="row" spacing={2} className={styles.buttons}>
            <Button
              variant="contained"
              type="submit"
              name="login-backend"
              disableElevation
            >
              {t("pages.user-login.form.button-login")}
            </Button>
            <Button
              variant="contained"
              type="submit"
              name="login-google"
              color="secondary"
              disableElevation
              href={ROUTES["external-login-google"].path}
            >
              {t("pages.user-login.form.button-login-google")}
              <IconGoogle className={styles.iconGoogle} />
            </Button>
          </Stack>
        </FormGrid>
        {validationErrors &&
          (validationErrors.throttle || validationErrors.error) && (
            <FormGrid size={{ xs: 12 }}>
              <FormHelperText error className={styles.error}>
                {validationErrors.throttle || validationErrors.error}
              </FormHelperText>
            </FormGrid>
          )}
      </Grid>
    </form>
  );
}
