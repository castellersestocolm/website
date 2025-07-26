import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { Button, FormHelperText, Link, Stack, Typography } from "@mui/material";
import styles from "./styles.module.css";
import IconGoogle from "@mui/icons-material/Google";
import IconMarkEmailReadOutlined from "@mui/icons-material/MarkEmailReadOutlined";
import IconEast from "@mui/icons-material/East";
import { ROUTES } from "../../routes";
import { apiUserCreate } from "../../api";
import { useState } from "react";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

interface FormElements extends HTMLFormControlsCollection {
  firstname: HTMLInputElement;
  lastname: HTMLInputElement;
  email: HTMLInputElement;
  phone: HTMLInputElement;
  password: HTMLInputElement;
  password2: HTMLInputElement;
  birthday: HTMLInputElement;
  consent_pictures: HTMLInputElement;
  preferred_language: HTMLInputElement;
  /*
    height_shoulders: HTMLInputElement;
    height_arms: HTMLInputElement;
  */
}
interface CreateFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export default function FormJoin() {
  const [t, i18n] = useTranslation("common");

  const [validationErrors, setValidationErrors] = useState(undefined);
  const [submitted, setSubmitted] = useState(false);
  let navigate = useNavigate();

  function handleSubmit(event: React.FormEvent<CreateFormElement>) {
    event.preventDefault();
    apiUserCreate(
      event.currentTarget.elements.firstname.value,
      event.currentTarget.elements.lastname.value,
      event.currentTarget.elements.email.value,
      event.currentTarget.elements.phone.value,
      event.currentTarget.elements.password.value,
      event.currentTarget.elements.password2.value,
      event.currentTarget.elements.birthday.value,
      event.currentTarget.elements.consent_pictures.checked,
      i18n.resolvedLanguage,
      /*
        parseInt(event.currentTarget.elements.height_shoulders.value),
        parseInt(event.currentTarget.elements.height_arms.value),
      */
    ).then((response) => {
      if (response.status === 201) {
        setValidationErrors(undefined);
        setSubmitted(true);
        setTimeout(() => navigate(ROUTES.home.path), 30000);
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
          <IconMarkEmailReadOutlined className={styles.joinIcon} />
          <Typography variant="h5" className={styles.joinSubtitle}>
            {t("pages.home-join.success")}
          </Typography>
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <FormGrid size={{ xs: 12, md: 6 }}>
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
                error={validationErrors && validationErrors.firstname}
              />
              {validationErrors && validationErrors.firstname && (
                <FormHelperText error>
                  {validationErrors.firstname[0].detail}
                </FormHelperText>
              )}
            </FormGrid>
            <FormGrid size={{ xs: 12, md: 6 }}>
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
                error={
                  validationErrors &&
                  validationErrors.lastname &&
                  validationErrors.lastname[0].detail
                }
              />
              {validationErrors && validationErrors.lastname && (
                <FormHelperText error>
                  {validationErrors.lastname[0].detail}
                </FormHelperText>
              )}
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
            <FormGrid size={{ xs: 12, md: 3 }}>
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
                error={
                  validationErrors &&
                  validationErrors.phone &&
                  validationErrors.phone[0].detail
                }
              />
              {validationErrors && validationErrors.phone && (
                <FormHelperText error>
                  {validationErrors.phone[0].detail}
                </FormHelperText>
              )}
            </FormGrid>
            <FormGrid size={{ xs: 12, md: 3 }}>
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
                error={
                  validationErrors &&
                  validationErrors.birthday &&
                  validationErrors.birthday[0].detail
                }
              />
              {validationErrors && validationErrors.birthday && (
                <FormHelperText error>
                  {validationErrors.birthday[0].detail}
                </FormHelperText>
              )}
            </FormGrid>
            <FormGrid size={{ xs: 12, md: 6 }}>
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
            <FormGrid size={{ xs: 12, md: 6 }}>
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
            {/*<FormGrid size={{ xs: 12, md: 3 }}>
              <FormLabel htmlFor="height_shoulders" required>
                {t("pages.user-join.form.height-shoulders")}
              </FormLabel>
              <OutlinedInput
                id="height_shoulders"
                name="height_shoulders"
                type="number"
                placeholder="150"
                inputProps={{ min: 50, max: 200 }}
                autoComplete="height_shoulders"
                required
                size="small"
                error={
                  validationErrors &&
                  validationErrors.height_shoulders &&
                  validationErrors.height_shoulders[0].detail
                }
              />
              {validationErrors && validationErrors.height_shoulders && (
                <FormHelperText error>
                  {validationErrors.height_shoulders[0].detail}
                </FormHelperText>
              )}
            </FormGrid>
            <FormGrid size={{ xs: 12, md: 3 }}>
              <FormLabel htmlFor="height_arms" required>
                {t("pages.user-join.form.height-arms")}
              </FormLabel>
              <OutlinedInput
                id="height_arms"
                name="height_arms"
                type="number"
                placeholder="200"
                inputProps={{ min: 50, max: 250 }}
                autoComplete="height_arms"
                required
                size="small"
                error={
                  validationErrors &&
                  validationErrors.height_arms &&
                  validationErrors.height_arms[0].detail
                }
              />
              {validationErrors && validationErrors.height_arms && (
                <FormHelperText error>
                  {validationErrors.height_arms[0].detail}
                </FormHelperText>
              )}
            </FormGrid>*/}
            <FormGrid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Checkbox name="consent_pictures" value="yes" />}
                label={t("pages.user-join.form.checkbox-image")}
                required={true}
              />
            </FormGrid>
            <FormGrid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Checkbox name="confirmCasal" value="yes" />}
                label={t("pages.user-join.form.checkbox-responsibility")}
                required={true}
              />
            </FormGrid>
            <FormGrid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Checkbox name="confirmCasal" value="yes" />}
                label={t("pages.user-join.form.checkbox-processing")}
                required={true}
              />
            </FormGrid>
            <FormGrid size={{ xs: 12 }}>
              <Stack direction="column" spacing={1}>
                <Link
                  href={ROUTES["user-login"].path}
                  color="secondary"
                  underline="none"
                  className={styles.link}
                >
                  {t("pages.user-join.form.link-already-account")}
                  <IconEast className={styles.iconEast} />
                </Link>
              </Stack>
            </FormGrid>
            <FormGrid size={{ xs: 12 }}>
              <Stack direction="row" spacing={2} className={styles.buttons}>
                <Button
                  variant="contained"
                  type="submit"
                  name="join-backend"
                  disableElevation
                >
                  {t("pages.user-join.form.button-join")}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  type="submit"
                  name="join-google"
                  disableElevation
                  href={ROUTES["external-login-google"].path}
                >
                  {t("pages.user-join.form.button-join-google")}
                  <IconGoogle className={styles.iconGoogle} />
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
      )}
    </>
  );
}
