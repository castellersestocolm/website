import * as React from "react";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid2";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { Button, FormHelperText, Stack } from "@mui/material";
import styles from "./styles.module.css";
import { apiUserPassword } from "../../api";
import { ROUTES } from "../../routes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../AppContext/AppContext";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

interface FormElements extends HTMLFormControlsCollection {
  password: HTMLInputElement;
  password2: HTMLInputElement;
}
interface CreateFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export default function FormSetPassword({ token }: any) {
  const { t } = useTranslation("common");

  const [validationErrors, setValidationErrors] = useState(undefined);
  let navigate = useNavigate();

  const { setUser } = useAppContext();

  function handleSubmit(event: React.FormEvent<CreateFormElement>) {
    event.preventDefault();
    apiUserPassword(
      token,
      event.currentTarget.elements.password.value,
      event.currentTarget.elements.password2.value,
    ).then((response) => {
      if (response.status === 200) {
        setUser(response.data);
        setValidationErrors(undefined);
        navigate(ROUTES["user-dashboard"].path, { replace: true });
      } else if (response.status === 429) {
        setValidationErrors({ throttle: response.data.detail });
      } else {
        setValidationErrors(response.data);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <FormGrid size={{ xs: 12 }}>
          <Stack direction="column" spacing={2} className={styles.fields}>
            <FormGrid size={{ xs: 12, md: 6 }} className={styles.field}>
              <FormLabel htmlFor="password" required>
                {t("pages.user-join.form.password")}
              </FormLabel>
              <OutlinedInput
                id="password"
                name="password"
                type="password"
                autoComplete="password"
                required
                size="small"
                error={
                  validationErrors &&
                  validationErrors.password &&
                  validationErrors.password[0].detail
                }
              />
              {validationErrors && validationErrors.password && (
                <FormHelperText error>
                  {validationErrors.password[0].detail}
                </FormHelperText>
              )}
            </FormGrid>
          </Stack>
        </FormGrid>
        <FormGrid size={{ xs: 12 }}>
          <Stack direction="column" spacing={2} className={styles.fields}>
            <FormGrid size={{ xs: 12, md: 6 }} className={styles.field}>
              <FormLabel htmlFor="password2" required>
                {t("pages.user-join.form.password-repeat")}
              </FormLabel>
              <OutlinedInput
                id="password2"
                name="password2"
                type="password"
                autoComplete="password"
                required
                size="small"
                error={
                  validationErrors &&
                  validationErrors.password2 &&
                  validationErrors.password2[0].detail
                }
              />
              {validationErrors && validationErrors.password2 && (
                <FormHelperText error>
                  {validationErrors.password2[0].detail}
                </FormHelperText>
              )}
            </FormGrid>
          </Stack>
        </FormGrid>
        <FormGrid size={{ xs: 12 }}>
          <Stack direction="row" spacing={2} className={styles.buttons}>
            <Button
              variant="contained"
              type="submit"
              name="set-password"
              disableElevation
            >
              {t("pages.user-set-password.form.button-update")}
            </Button>
          </Stack>
        </FormGrid>
        {validationErrors && validationErrors.throttle && (
          <FormGrid size={{ xs: 12 }}>
            <FormHelperText error className={styles.error}>
              {validationErrors.throttle}
            </FormHelperText>
          </FormGrid>
        )}
      </Grid>
    </form>
  );
}
