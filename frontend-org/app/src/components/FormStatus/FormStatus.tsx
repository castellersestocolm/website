import * as React from "react";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { Button, FormHelperText, Stack, Typography } from "@mui/material";
import styles from "./styles.module.css";
import { useState } from "react";
import Box from "@mui/material/Box";
import { useSearchParams } from "react-router-dom";
import { apiOrgCheck } from "../../api";

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

export default function FormStatus() {
  const { t } = useTranslation("common");

  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [validationErrors, setValidationErrors] = useState(undefined);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<CreateFormElement>) {
    event.preventDefault();
    apiOrgCheck(event.currentTarget.elements.email.value).then(
      (response: any) => {
        if (response.status === 200) {
          setValidationErrors(undefined);
          setSubmitted(true);
        } else {
          setValidationErrors(response.data);
        }
      },
    );
  }

  return (
    <>
      {submitted ? (
        <Box className={styles.success}>
          <Typography variant="h5" className={styles.joinSubtitle}>
            {t("pages.status.success")}
          </Typography>
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <FormGrid size={{ xs: 12 }}>
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
                error={validationErrors && validationErrors.email}
                defaultValue={email}
              />
              {validationErrors && validationErrors.email && (
                <FormHelperText error>
                  {validationErrors.email[0].detail}
                </FormHelperText>
              )}
            </FormGrid>
            <FormGrid size={{ xs: 12 }}>
              <Stack direction="row" spacing={2} className={styles.buttons}>
                <Button variant="contained" type="submit" disableElevation>
                  {t("pages.user-status.form.button-status")}
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
            {validationErrors && validationErrors.general && (
              <FormGrid size={{ xs: 12 }}>
                <FormHelperText error className={styles.error}>
                  {validationErrors.general.detail}
                </FormHelperText>
              </FormGrid>
            )}
          </Grid>
        </form>
      )}
    </>
  );
}
