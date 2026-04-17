import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import {
  Card,
  Divider,
  FormHelperText,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import styles from "./styles.module.css";
import IconMarkEmailReadOutlined from "@mui/icons-material/MarkEmailReadOutlined";
import { useState } from "react";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import { getEnumLabel } from "../../enums";

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

export default function FormEventRegister({ event }: any) {
  const [t, i18n] = useTranslation("common");

  const [validationErrors, setValidationErrors] = useState(undefined);
  const [submitted, setSubmitted] = useState(false);
  let navigate = useNavigate();

  function handleSubmit(event: React.FormEvent<CreateFormElement>) {
    event.preventDefault();
    /*apiUserCreate(
      event.currentTarget.elements.firstname.value,
      event.currentTarget.elements.lastname.value,
      event.currentTarget.elements.email.value,
      event.currentTarget.elements.phone.value,
      event.currentTarget.elements.password.value,
      event.currentTarget.elements.password2.value,
      event.currentTarget.elements.birthday.value,
      event.currentTarget.elements.consent_pictures.checked,
      i18n.resolvedLanguage,
      /!*
        parseInt(event.currentTarget.elements.height_shoulders.value),
        parseInt(event.currentTarget.elements.height_arms.value),
      *!/
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
    });*/
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
            {event.prices && event.prices.length > 0 && (
              <FormGrid size={12} className={styles.pricesSection}>
                <Typography variant="h5" fontWeight={600}>
                  {t("pages.calendar-event.register.prices.title")}
                </Typography>
                <Grid container justifyContent="center">
                  <Grid size={{ xs: 12, sm: 10, md: 8, lg: 6 }}>
                    <Typography variant="body1">
                      {t("pages.calendar-event.register.prices.description")}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container gap={3} justifyContent="center">
                  {Array.from(
                    new Set(
                      event.prices.map((eventPrice: any) => eventPrice.module),
                    ),
                  ).map((module: any) => {
                    return (
                      <Grid size={{ xs: 12, sm: 5, md: 4, lg: 3 }}>
                        <Card variant="outlined" className={styles.pricesCard}>
                          <Box className={styles.pricesTopBox}>
                            <Typography
                              variant="h6"
                              fontWeight="600"
                              component="div"
                            >
                              {module
                                ? getEnumLabel(t, "module", module)
                                : t(
                                    "pages.calendar-event.register.prices.non-members",
                                  )}
                            </Typography>
                          </Box>
                          <Divider />

                          <Box>
                            <TableContainer>
                              <Table size="small">
                                <TableBody>
                                  {event.prices
                                    .filter(
                                      (eventPrice: any) =>
                                        eventPrice.module === module,
                                    )
                                    .map((eventPrice: any) => {
                                      return (
                                        <TableRow
                                          sx={{
                                            "&:last-child td, &:last-child th":
                                              {
                                                border: 0,
                                              },
                                          }}
                                        >
                                          <TableCell component="th" scope="row">
                                            {eventPrice.age_from &&
                                            eventPrice.age_to
                                              ? t(
                                                  "pages.calendar-event.register.prices.between",
                                                ) +
                                                " " +
                                                eventPrice.age_from +
                                                " " +
                                                t(
                                                  "pages.calendar-event.register.prices.and",
                                                ) +
                                                " " +
                                                eventPrice.age_to +
                                                " " +
                                                t(
                                                  "pages.calendar-event.register.prices.years",
                                                )
                                              : eventPrice.age_from
                                                ? t(
                                                    "pages.calendar-event.register.prices.above",
                                                  ) +
                                                  " " +
                                                  eventPrice.age_from +
                                                  " " +
                                                  t(
                                                    "pages.calendar-event.register.prices.years",
                                                  )
                                                : eventPrice.age_to
                                                  ? t(
                                                      "pages.calendar-event.register.prices.under",
                                                    ) +
                                                    " " +
                                                    eventPrice.age_to +
                                                    " " +
                                                    t(
                                                      "pages.calendar-event.register.prices.years",
                                                    )
                                                  : t(
                                                      "pages.calendar-event.register.prices.general-admission",
                                                    )}
                                          </TableCell>
                                          <TableCell align="right">
                                            {eventPrice.amount.amount}{" "}
                                            {eventPrice.amount.currency}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </FormGrid>
            )}
            <FormGrid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Checkbox name="confirmCasal" value="yes" />}
                label={t("pages.calendar-event.register.checkbox-processing")}
                required={true}
              />
            </FormGrid>
            {/*<FormGrid size={{ xs: 12 }}>
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
            </FormGrid>*/}
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
