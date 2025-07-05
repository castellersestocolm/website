import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
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
  preferred_language: HTMLInputElement;
  /*
    height_shoulders: HTMLInputElement;
    height_arms: HTMLInputElement;
  */
}
interface CreateFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export default function FormDashboardUpdate() {
  const [t, i18n] = useTranslation("common");

  const [validationErrors, setValidationErrors] = useState(undefined);

  const { user, setUser, setMessages } = useAppContext();

  function handleSubmit(event: React.FormEvent<CreateFormElement>) {
    event.preventDefault();
    apiUserUpdate(
      user.id,
      user.firstname,
      user.lastname,
      user.phone,
      user.birthday,
      user.consent_pictures,
      event.currentTarget.elements.preferred_language.value,
      /*
        parseInt(event.currentTarget.elements.height_shoulders.value),
        parseInt(event.currentTarget.elements.height_arms.value),
      */
    ).then((response) => {
      if (response.status === 202) {
        setValidationErrors(undefined);
        apiUserMe().then((response) => {
          if (response.status === 200 || response.status === 204) {
            setUser(response.data);
            if (response.data.preferred_language) {
              i18n.changeLanguage(response.data.preferred_language);
            }
          }
        });
        setMessages([
          {
            message: t("pages.user-details.form.success"),
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
        {/*<FormGrid size={{ xs: 12 }}>
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
        <FormGrid size={{ xs: 12 }}>
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
        </FormGrid>*/}
        <FormGrid size={{ xs: 12 }}>
          <FormLabel htmlFor="preferred_language" required>
            {t("pages.user-join.form.language")}
          </FormLabel>
          <Select
            id="preferred_language"
            name="preferred_language"
            variant="outlined"
            autoComplete="language"
            required
            size="small"
            defaultValue={user.preferred_language}
            error={
              validationErrors &&
              validationErrors.preferred_language &&
              validationErrors.preferred_language[0].detail
            }
          >
            {(Object.keys(Language) as Array<keyof typeof Language>).map(
              (language) => {
                return (
                  <MenuItem value={Language[language]}>
                    {getEnumLabel(t, "language", Language[language])}
                  </MenuItem>
                );
              },
            )}
          </Select>
          {validationErrors && validationErrors.preferred_language && (
            <FormHelperText error>
              {validationErrors.preferred_language[0].detail}
            </FormHelperText>
          )}
        </FormGrid>
        <FormGrid size={{ xs: 12 }}>
          <Stack direction="row" spacing={2} className={styles.buttons}>
            <Button
              variant="contained"
              type="submit"
              name="join-backend"
              disableElevation
            >
              {t("pages.user-details.form.button-complete")}
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
