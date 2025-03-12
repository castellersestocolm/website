import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid2";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import {
  Button,
  FormHelperText,
  Link,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import styles from "./styles.module.css";
import IconGoogle from "@mui/icons-material/Google";
import IconMarkEmailReadOutlined from "@mui/icons-material/MarkEmailReadOutlined";
import IconEast from "@mui/icons-material/East";
import { ROUTES } from "../../routes";
import { apiUserCreate, apiUserMe, apiUserUpdate } from "../../api";
import { useState } from "react";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../AppContext/AppContext";
import { getEnumLabel, Language } from "../../enums";

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
  height_shoulders: HTMLInputElement;
  height_arms: HTMLInputElement;
}
interface CreateFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export default function FormUpdate() {
  const [t, i18n] = useTranslation("common");

  const [validationErrors, setValidationErrors] = useState(undefined);

  const { user, setUser, setMessages } = useAppContext();

  function handleSubmit(event: React.FormEvent<CreateFormElement>) {
    event.preventDefault();
    apiUserUpdate(
      user.id,
      event.currentTarget.elements.firstname.value,
      event.currentTarget.elements.lastname.value,
      event.currentTarget.elements.phone.value,
      event.currentTarget.elements.birthday.value,
      event.currentTarget.elements.consent_pictures.checked,
      i18n.resolvedLanguage,
      parseInt(event.currentTarget.elements.height_shoulders.value),
      parseInt(event.currentTarget.elements.height_arms.value),
    ).then((response) => {
      if (response.status === 202) {
        setValidationErrors(undefined);
        apiUserMe().then((response) => {
          if (response.status === 200 || response.status === 204) {
            setUser(response.data);
          }
        });
        setMessages([
          {
            message: t("pages.user-registration.form.success"),
            type: "success",
          },
        ]);
        setTimeout(() => setMessages(undefined), 5000);
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
            defaultValue={user.firstname}
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
            defaultValue={user.lastname}
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
            disabled
            value={user.email}
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
            defaultValue={user.phone}
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
            defaultValue={user.birthday}
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
            type="number"
            placeholder="150"
            inputProps={{ min: 50, max: 200 }}
            autoComplete="height_shoulders"
            required
            size="small"
            defaultValue={user.towers && user.towers.height_shoulders}
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
            defaultValue={user.towers && user.towers.height_arms}
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
          <Stack direction="row" spacing={2} className={styles.buttons}>
            <Button
              variant="contained"
              type="submit"
              name="join-backend"
              disableElevation
            >
              {t("pages.user-registration.form.button-complete")}
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
