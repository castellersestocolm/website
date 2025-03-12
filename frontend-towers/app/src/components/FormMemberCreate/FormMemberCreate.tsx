import * as React from "react";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid2";
import OutlinedInput from "@mui/material/OutlinedInput";
import IconCheck from "@mui/icons-material/Check";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { Button, Collapse, FormHelperText, List, Stack } from "@mui/material";
import styles from "./styles.module.css";
import { apiUserFamilyMemberCreate, apiUserMe } from "../../api";
import { useState } from "react";
import { Alert } from "@mui/lab";
import { useAppContext } from "../AppContext/AppContext";
import { TransitionGroup } from "react-transition-group";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

interface FormElements extends HTMLFormControlsCollection {
  firstname: HTMLInputElement;
  lastname: HTMLInputElement;
  birthday: HTMLInputElement;
  height_shoulders: HTMLInputElement;
  height_arms: HTMLInputElement;
  consent_pictures: HTMLInputElement;
}
interface CreateFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export default function FormMemberCreate() {
  const { t } = useTranslation("common");

  const [validationErrors, setValidationErrors] = useState(undefined);
  const [submitted, setSubmitted] = useState(false);
  const { setUser } = useAppContext();

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    birthday: "",
    height_shoulders: "",
    height_arms: "",
    consent_pictures: false,
  });

  const infoChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      // spread the current values here
      ...formData,
      // update the current changed input
      [name]: type === "checkbox" ? checked : value,
    });
  };

  function handleSubmit(event: React.FormEvent<CreateFormElement>) {
    event.preventDefault();
    apiUserFamilyMemberCreate(
      event.currentTarget.elements.firstname.value,
      event.currentTarget.elements.lastname.value,
      event.currentTarget.elements.birthday.value,
      parseInt(event.currentTarget.elements.height_shoulders.value),
      parseInt(event.currentTarget.elements.height_arms.value),
      event.currentTarget.elements.consent_pictures.checked,
    ).then((response) => {
      if (response.status === 201) {
        setValidationErrors(undefined);
        apiUserMe().then((response) => {
          if (response.status === 200 || response.status === 204) {
            setUser(response.data);
          }
        });
        setFormData({
          firstname: "",
          lastname: "",
          birthday: "",
          height_shoulders: "",
          height_arms: "",
          consent_pictures: false,
        });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
      } else if (response.status === 429) {
        setValidationErrors({ throttle: response.data.detail });
      } else {
        setValidationErrors(response.data);
      }
    });
  }

  return (
    <>
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
              value={formData.firstname}
              onChange={infoChange}
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
              value={formData.lastname}
              onChange={infoChange}
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
              value={formData.birthday}
              onChange={infoChange}
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
          <FormGrid size={{ xs: 12, md: 3 }}>
            <FormLabel htmlFor="height_shoulders" required>
              {t("pages.user-join.form.height-shoulders")}
            </FormLabel>
            <OutlinedInput
              id="height_shoulders"
              name="height_shoulders"
              type="height_shoulders"
              placeholder="150"
              inputProps={{ min: 50, max: 200 }}
              autoComplete="height_shoulders"
              required
              size="small"
              value={formData.height_shoulders}
              onChange={infoChange}
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
              type="height_arms"
              placeholder="200"
              inputProps={{ min: 50, max: 250 }}
              autoComplete="height_arms"
              required
              size="small"
              value={formData.height_arms}
              onChange={infoChange}
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
          </FormGrid>
          <FormGrid size={{ xs: 12 }}>
            <FormControlLabel
              control={<Checkbox name="consent_pictures" value="true" />}
              label={t("pages.user-join.form.checkbox-image-children")}
              checked={formData.consent_pictures}
              onChange={infoChange}
            />
          </FormGrid>
          {validationErrors &&
            (validationErrors.throttle || validationErrors.error) && (
              <FormGrid size={{ xs: 12 }}>
                <FormHelperText error className={styles.error}>
                  {validationErrors.throttle || validationErrors.error}
                </FormHelperText>
              </FormGrid>
            )}
          <List className={styles.listButtons}>
            <TransitionGroup>
              {submitted && (
                <Collapse>
                  <Alert
                    icon={<IconCheck fontSize="inherit" />}
                    severity="success"
                    className={styles.alert}
                  >
                    {t("pages.user-family.create.form.success")}
                  </Alert>
                </Collapse>
              )}
              <Collapse>
                <FormGrid size={{ xs: 12 }}>
                  <Stack direction="row" spacing={2} className={styles.buttons}>
                    <Button variant="contained" type="submit" disableElevation>
                      {t("pages.user-family.create.form.button-create")}
                    </Button>
                  </Stack>
                </FormGrid>
              </Collapse>
            </TransitionGroup>
          </List>
        </Grid>
      </form>
    </>
  );
}
