import * as React from "react";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import {
  Button,
  FormHelperText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import styles from "./styles.module.css";
import { apiContactMessageCreate } from "../../api";
import { useState } from "react";
import { useAppContext } from "../AppContext/AppContext";
import Box from "@mui/material/Box";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

interface FormElements extends HTMLFormControlsCollection {
  firstname: HTMLInputElement;
  lastname: HTMLInputElement;
  email: HTMLInputElement;
  message: HTMLInputElement;
}
interface LoginFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export default function FormContactMessage({ type }: any) {
  const { t } = useTranslation("common");

  const { user } = useAppContext();

  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState(undefined);

  function handleSubmit(event: React.FormEvent<LoginFormElement>) {
    event.preventDefault();
    apiContactMessageCreate(
      {
        firstname: event.currentTarget.elements.firstname.value,
        lastname: event.currentTarget.elements.lastname.value,
        email: event.currentTarget.elements.email.value,
      },
      type,
      event.currentTarget.elements.message.value,
    ).then((response) => {
      if (response.status === 201) {
        setValidationErrors(undefined);
        setSubmitted(true);
      } else if (response.status === 429) {
        setValidationErrors({ throttle: response.data.detail });
      } else {
        setValidationErrors(response.data);
      }
    });
  }

  return (
    <>
      {submitted ? (
        <Box className={styles.success}>
          <Typography variant="h5" className={styles.joinSubtitle}>
            {t("pages.contact.success")}
          </Typography>
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <FormGrid size={{ xs: 12, md: 4 }}>
              <FormLabel htmlFor="firstname" required>
                {t("pages.user-join.form.first-name")}
              </FormLabel>
              <OutlinedInput
                id="firstname"
                name="firstname"
                type="text"
                placeholder="Namn"
                autoComplete="first name"
                required
                size="small"
                disabled={user}
                defaultValue={user && user.firstname}
                error={
                  validationErrors &&
                  validationErrors.entity &&
                  validationErrors.entity.firstname
                }
              />
              {validationErrors &&
                validationErrors.entity &&
                validationErrors.entity.firstname && (
                  <FormHelperText error>
                    {validationErrors.entity.firstname[0].detail}
                  </FormHelperText>
                )}
            </FormGrid>
            <FormGrid size={{ xs: 12, md: 4 }}>
              <FormLabel htmlFor="lastname" required>
                {t("pages.user-join.form.last-name")}
              </FormLabel>
              <OutlinedInput
                id="lastname"
                name="lastname"
                type="text"
                placeholder="Namnsson"
                autoComplete="last name"
                required
                size="small"
                disabled={user}
                defaultValue={user && user.lastname}
                error={
                  validationErrors &&
                  validationErrors.entity &&
                  validationErrors.entity.lastname
                }
              />
              {validationErrors &&
                validationErrors.entity &&
                validationErrors.entity.lastname && (
                  <FormHelperText error>
                    {validationErrors.entity.lastname[0].detail}
                  </FormHelperText>
                )}
            </FormGrid>
            <FormGrid size={{ xs: 12, md: 4 }} className={styles.field}>
              <FormLabel htmlFor="email" required>
                {t("pages.user-login.form.email")}
              </FormLabel>
              <OutlinedInput
                id="email"
                name="email"
                type="email"
                placeholder="namn@namnsson.se"
                autoComplete="email"
                disabled={user}
                defaultValue={user && user.email}
                error={
                  validationErrors &&
                  validationErrors.entity &&
                  validationErrors.entity.email
                }
                required
                size="small"
              />
              {validationErrors &&
                validationErrors.entity &&
                validationErrors.entity.email && (
                  <FormHelperText error>
                    {validationErrors.entity.email[0].detail}
                  </FormHelperText>
                )}
            </FormGrid>
            <FormGrid size={12} className={styles.field}>
              <FormLabel htmlFor="message" required>
                {t("pages.contact.form.message")}
              </FormLabel>
              <TextField
                id="message"
                name="message"
                type="text"
                required
                multiline
                minRows={4}
                maxRows={8}
              />
            </FormGrid>
            <FormGrid size={{ xs: 12 }}>
              <Stack direction="row" spacing={2} className={styles.buttons}>
                <Button
                  variant="contained"
                  type="submit"
                  name="login-backend"
                  disableElevation
                >
                  {t("pages.contact.form.button-send")}
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
      )}
    </>
  );
}
