import * as React from "react";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid2";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { Button, FormHelperText, Link, Stack, Typography } from "@mui/material";
import IconEast from "@mui/icons-material/East";
import styles from "./styles.module.css";
import { apiUserCreate, apiUserRequestPassword } from "../../api";
import { ROUTES } from "../../routes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import IconMarkEmailReadOutlined from "@mui/icons-material/MarkEmailReadOutlined";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
}
interface CreateFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export default function FormPassword() {
  const { t } = useTranslation("common");

  const [validationErrors, setValidationErrors] = useState(undefined);
  const [submitted, setSubmitted] = useState(false);
  let navigate = useNavigate();

  function handleSubmit(event: React.FormEvent<CreateFormElement>) {
    event.preventDefault();
    apiUserRequestPassword(event.currentTarget.elements.email.value).then(
      (response) => {
        if (response.status === 200) {
          setValidationErrors(undefined);
          setSubmitted(true);
          setTimeout(
            () => navigate(ROUTES["user-login"].path, { replace: true }),
            30000,
          );
        } else if (response.status === 429) {
          setValidationErrors({ throttle: response.data.detail });
        } else {
          setValidationErrors(response.data);
        }
      },
    );
  }

  return submitted ? (
    <Box className={styles.success}>
      <IconMarkEmailReadOutlined className={styles.passwordIcon} />
      <Typography variant="h5" className={styles.passwordSubtitle}>
        {t("pages.user-password.success")}
      </Typography>
    </Box>
  ) : (
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
                error={
                  validationErrors &&
                  validationErrors.email &&
                  validationErrors.email[0].detail
                }
              />
              {validationErrors && validationErrors.email && (
                <FormHelperText error>
                  {validationErrors.email[0].detail}
                </FormHelperText>
              )}
            </FormGrid>
          </Stack>
        </FormGrid>
        <FormGrid size={{ xs: 12 }}>
          <Stack direction="column" spacing={1}>
            <Link
              href="/user/login"
              color="secondary"
              underline="none"
              className={styles.link}
            >
              {t("pages.user-password.form.link-login")}
              <IconEast className={styles.iconEast} />
            </Link>
          </Stack>
        </FormGrid>
        <FormGrid size={{ xs: 12 }}>
          <Stack direction="row" spacing={2} className={styles.buttons}>
            <Button
              variant="contained"
              type="submit"
              name="request-password"
              disableElevation
            >
              {t("pages.user-password.form.button-reset")}
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
