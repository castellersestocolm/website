import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  FormHelperText,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import styles from "./styles.module.css";
import IconMarkEmailReadOutlined from "@mui/icons-material/MarkEmailReadOutlined";
import { useState } from "react";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import IconEast from "@mui/icons-material/East";
import IconArrowDownward from "@mui/icons-material/ArrowDownward";

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
  const { t } = useTranslation("common");

  const [validationErrors, setValidationErrors] = useState(undefined);
  const [submitted, setSubmitted] = useState(false);
  let navigate = useNavigate();

  const [children, setChildren] = useState([[undefined, undefined, undefined]]);

  function handleButtonChildrenRemove(childIndex: number) {
    setChildren([
      ...children.slice(0, childIndex),
      ...children.slice(childIndex + 1, children.length),
    ]);
  }

  function handleButtonChildrenAdd() {
    if (children.length < 10) {
      setChildren([...children, undefined]);
    }
  }

  function handleSubmit(event: React.FormEvent<CreateFormElement>) {
    event.preventDefault();
    // apiUserCreate(
    //   event.currentTarget.elements.firstname.value,
    //   event.currentTarget.elements.lastname.value,
    //   event.currentTarget.elements.email.value,
    //   event.currentTarget.elements.phone.value,
    //   event.currentTarget.elements.password.value,
    //   event.currentTarget.elements.password2.value,
    //   event.currentTarget.elements.birthday.value,
    //   event.currentTarget.elements.consent_pictures.checked,
    //   i18n.resolvedLanguage,
    //   /*
    //     parseInt(event.currentTarget.elements.height_shoulders.value),
    //     parseInt(event.currentTarget.elements.height_arms.value),
    //   */
    // ).then((response) => {
    //   if (response.status === 201) {
    //     setValidationErrors(undefined);
    //     setSubmitted(true);
    //     setTimeout(() => navigate(ROUTES.home.path, { replace: true }), 30000);
    //   } else if (response.status === 429) {
    //     setValidationErrors({ throttle: response.data.detail });
    //   } else {
    //     setValidationErrors(response.data);
    //   }
    // });
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
            <FormGrid size={12}>
              <Accordion elevation={0} className={styles.accordion}>
                <AccordionSummary
                  expandIcon={<IconArrowDownward />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <Typography component="span">
                    {t("pages.user-join.form.partner.title")}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={styles.accordionDetails}>
                  <Grid container spacing={3}>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                      <FormLabel htmlFor="firstname2" required>
                        {t("pages.user-join.form.first-name")}
                      </FormLabel>
                      <OutlinedInput
                        id="firstname2"
                        name="firstname2"
                        type="text"
                        placeholder="Namn"
                        autoComplete="first name 2"
                        required
                        size="small"
                        error={validationErrors && validationErrors.firstname2}
                      />
                      {validationErrors && validationErrors.firstname2 && (
                        <FormHelperText error>
                          {validationErrors.firstname2[0].detail}
                        </FormHelperText>
                      )}
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                      <FormLabel htmlFor="lastname2" required>
                        {t("pages.user-join.form.last-name")}
                      </FormLabel>
                      <OutlinedInput
                        id="lastname2"
                        name="lastname2"
                        type="text"
                        placeholder="Namnsson"
                        autoComplete="last name 2"
                        required
                        size="small"
                        error={
                          validationErrors &&
                          validationErrors.lastname2 &&
                          validationErrors.lastname2[0].detail
                        }
                      />
                      {validationErrors && validationErrors.lastname2 && (
                        <FormHelperText error>
                          {validationErrors.lastname2[0].detail}
                        </FormHelperText>
                      )}
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                      <FormLabel htmlFor="email2" required>
                        {t("pages.user-join.form.email")}
                      </FormLabel>
                      <OutlinedInput
                        id="email2"
                        name="email2"
                        type="email"
                        placeholder="namn@namnsson.se"
                        autoComplete="email 2"
                        required
                        size="small"
                        error={
                          validationErrors &&
                          validationErrors.email2 &&
                          validationErrors.email2[0].detail
                        }
                      />
                      {validationErrors && validationErrors.email2 && (
                        <FormHelperText error>
                          {validationErrors.email2[0].detail}
                        </FormHelperText>
                      )}
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                      <FormLabel htmlFor="phone2" required>
                        {t("pages.user-join.form.phone")}
                      </FormLabel>
                      <OutlinedInput
                        id="phone2"
                        name="phone2"
                        type="phone"
                        placeholder="+4687461000"
                        autoComplete="phone 2"
                        required
                        size="small"
                        error={
                          validationErrors &&
                          validationErrors.phone2 &&
                          validationErrors.phone2[0].detail
                        }
                      />
                      {validationErrors && validationErrors.phone2 && (
                        <FormHelperText error>
                          {validationErrors.phone2[0].detail}
                        </FormHelperText>
                      )}
                    </FormGrid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </FormGrid>
            <FormGrid size={12}>
              <Accordion elevation={0} className={styles.accordion}>
                <AccordionSummary
                  expandIcon={<IconArrowDownward />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <Typography component="span">
                    {t("pages.user-join.form.children.title")}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={styles.accordionDetails}>
                  {children &&
                    children.map((child: any, ix: number) => (
                      <Box paddingBottom={3}>
                        <Typography variant="body1" paddingBottom={1}>
                          {t("pages.user-join.form.children.row")}
                          {" #"}
                          {ix + 1}
                          {ix > 0 && (
                            <>
                              {" — "}
                              <Link
                                color="secondary"
                                underline="none"
                                className={styles.link}
                                onClick={() => handleButtonChildrenRemove(ix)}
                              >
                                {t(
                                  "pages.user-join.form.button-children.remove",
                                )}
                              </Link>
                            </>
                          )}
                        </Typography>
                        <Grid container spacing={3}>
                          <FormGrid size={{ xs: 12, md: 4 }}>
                            <FormLabel htmlFor={"firstname-c" + ix} required>
                              {t("pages.user-join.form.first-name")}
                            </FormLabel>
                            <OutlinedInput
                              id={"firstname-c" + ix}
                              name={"firstname-c" + ix}
                              type="text"
                              placeholder="Namn"
                              autoComplete={"first name child " + ix}
                              required
                              size="small"
                              error={
                                validationErrors &&
                                validationErrors["firstname-c" + ix]
                              }
                            />
                            {validationErrors &&
                              validationErrors["firstname-c" + ix] && (
                                <FormHelperText error>
                                  {
                                    validationErrors["firstname-c" + ix][0]
                                      .detail
                                  }
                                </FormHelperText>
                              )}
                          </FormGrid>
                          <FormGrid size={{ xs: 12, md: 4 }}>
                            <FormLabel htmlFor={"lastname-c" + ix} required>
                              {t("pages.user-join.form.last-name")}
                            </FormLabel>
                            <OutlinedInput
                              id={"lastname-c" + ix}
                              name={"lastname-c" + ix}
                              type="text"
                              placeholder="Namnsson"
                              autoComplete="last name 2"
                              required
                              size="small"
                              error={
                                validationErrors &&
                                validationErrors["lastname-c" + ix]
                              }
                            />
                            {validationErrors &&
                              validationErrors["lastname-c" + ix] && (
                                <FormHelperText error>
                                  {
                                    validationErrors["lastname-c" + ix][0]
                                      .detail
                                  }
                                </FormHelperText>
                              )}
                          </FormGrid>
                          <FormGrid size={{ xs: 12, md: 4 }}>
                            <FormLabel htmlFor={"birthday-c" + ix} required>
                              {t("pages.user-join.form.birthday")}
                            </FormLabel>
                            <OutlinedInput
                              id={"birthday-c" + ix}
                              name={"birthday-c" + ix}
                              type="date"
                              autoComplete={"birthday child " + ix}
                              required
                              size="small"
                              error={
                                validationErrors &&
                                validationErrors["birthday-c" + ix] &&
                                validationErrors["birthday-c" + ix][0].detail
                              }
                            />
                            {validationErrors &&
                              validationErrors["birthday-c" + ix] && (
                                <FormHelperText error>
                                  {
                                    validationErrors["birthday-c" + ix][0]
                                      .detail
                                  }
                                </FormHelperText>
                              )}
                          </FormGrid>
                        </Grid>
                      </Box>
                    ))}
                  {(!children || children.length < 10) && (
                    <Typography variant="body1">
                      <Link
                        color="secondary"
                        underline="none"
                        className={styles.link}
                        onClick={() => handleButtonChildrenAdd()}
                        textAlign="center"
                      >
                        {t("pages.user-join.form.button-children.add")}
                      </Link>
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </FormGrid>
            <FormGrid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Checkbox name="confirmCasal" value="yes" />}
                label={t("pages.user-join.form.checkbox-processing")}
                required={true}
              />
              <Typography>
                <Link
                  href={t("pages.user-join.form.checkbox-processing-link.href")}
                  color="secondary"
                  underline="none"
                  target="_blank"
                  className={styles.checkboxLink}
                >
                  {t("pages.user-join.form.checkbox-processing-link.title")}
                  <IconEast className={styles.iconEast} />
                </Link>
              </Typography>
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
