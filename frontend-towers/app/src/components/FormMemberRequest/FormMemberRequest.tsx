import * as React from "react";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid2";
import OutlinedInput from "@mui/material/OutlinedInput";
import IconCheck from "@mui/icons-material/Check";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import {
  Button,
  Collapse,
  Fade,
  FormHelperText,
  List,
  Stack,
} from "@mui/material";
import styles from "./styles.module.css";
import {
  apiUserFamilyMemberCreate,
  apiUserFamilyMemberRequestCreate,
  apiUserFamilyMemberRequestList,
  apiUserMe,
} from "../../api";
import { useState } from "react";
import { Alert } from "@mui/lab";
import { useAppContext } from "../AppContext/AppContext";
import { TransitionGroup } from "react-transition-group";
import { FamilyMemberRequestStatus } from "../../enums";

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

export default function FormMemberRequest() {
  const { t } = useTranslation("common");

  const [validationErrors, setValidationErrors] = useState(undefined);
  const [submitted, setSubmitted] = useState(false);
  const { setFamilyMemberRequests } = useAppContext();

  const [formData, setFormData] = useState({
    email: "",
  });

  const infoChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      // spread the current values here
      ...formData,
      // update the current changed input
      [name]: value,
    });
  };

  function handleSubmit(event: React.FormEvent<CreateFormElement>) {
    event.preventDefault();
    apiUserFamilyMemberRequestCreate(
      event.currentTarget.elements.email.value,
    ).then((response) => {
      if (response.status === 201) {
        setValidationErrors(undefined);
        apiUserFamilyMemberRequestList().then((response) => {
          if (response.status === 200) {
            setFamilyMemberRequests(
              response.data.filter((request: any) => {
                return request.status === FamilyMemberRequestStatus.REQUESTED;
              }),
            );
          }
        });
        setFormData({
          email: "",
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
          <FormGrid size={{ xs: 12, md: 12 }}>
            <FormLabel htmlFor="email" required>
              {t("pages.user-join.form.email")}
            </FormLabel>
            <OutlinedInput
              id="email"
              name="email"
              type="email"
              placeholder="namn@namnsson.se"
              required
              size="small"
              value={formData.email}
              onChange={infoChange}
              error={validationErrors && validationErrors.email}
            />
            {validationErrors && validationErrors.email && (
              <FormHelperText error>
                {validationErrors.email[0].detail}
              </FormHelperText>
            )}
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
                    {t("pages.user-family.request.form.success")}
                  </Alert>
                </Collapse>
              )}
              <Collapse>
                <FormGrid size={{ xs: 12 }}>
                  <Stack direction="row" spacing={2} className={styles.buttons}>
                    <Button variant="contained" type="submit" disableElevation>
                      {t("pages.user-family.request.form.button-create")}
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
