import * as React from "react";
import Grid from "@mui/material/Grid2";
import IconCheck from "@mui/icons-material/Check";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { Collapse, FormHelperText, List } from "@mui/material";
import styles from "./styles.module.css";
import {
  apiEventRegistrationCreate,
  apiEventRegistrationDelete,
} from "../../api";
import { useState } from "react";
import { Alert } from "@mui/lab";
import { TransitionGroup } from "react-transition-group";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

interface FormElements extends HTMLFormControlsCollection {
  userIds: HTMLInputElement;
  eventId: HTMLInputElement;
}
interface CreateFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export default function FormCalendarRegistrationCreate({
  event: scheduledEvent,
  family: userFamily,
  token: eventToken,
}: any) {
  const { t } = useTranslation("common");

  const [created, setCreated] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [registrations, setRegistrations] = useState(
    scheduledEvent.registrations,
  );
  const [validationErrors, setValidationErrors] = useState(undefined);

  const [formRegistration, setFormRegistration] = useState<{
    [key: string]: boolean;
  }>(
    Object.fromEntries(
      scheduledEvent.registrations.map((registration: any) => [
        registration.user.id,
        true,
      ]),
    ),
  );

  const registrationIdByUserId = Object.fromEntries(
    registrations.map((registration: any) => [
      registration.user.id,
      registration.id,
    ]),
  );

  const registrationChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormRegistration({
      // spread the current values here
      ...formRegistration,
      // update the current changed input
      [name]: type === "checkbox" ? checked : value,
    });
    if (checked) {
      apiEventRegistrationCreate(name, scheduledEvent.id, eventToken).then(
        (response) => {
          if (response.status === 200) {
            const newRegistrations = registrations.concat(response.data);
            setRegistrations(newRegistrations);
            setCreated(true);
            setTimeout(() => setCreated(false), 5000);
          } else if (response.status === 429) {
            setValidationErrors({ throttle: response.data.detail });
          }
        },
      );
    } else {
      const registrationId = registrationIdByUserId[name];
      apiEventRegistrationDelete(registrationId, eventToken).then(
        (response) => {
          if (response.status === 204) {
            const newRegistrations = registrations.filter(
              (registration: any) => registration.id !== registrationId,
            );
            setRegistrations(newRegistrations);
            setDeleted(true);
            setTimeout(() => setDeleted(false), 5000);
          } else if (response.status === 429) {
            setValidationErrors({ throttle: response.data.detail });
          }
        },
      );
    }
  };

  function handleSubmit(event: React.FormEvent<CreateFormElement>) {
    event.preventDefault();
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={0}>
          {userFamily &&
            userFamily.members &&
            userFamily.members.length > 0 &&
            userFamily.members.map((member: any) => (
              <FormGrid size={{ xs: 12 }}>
                <FormControlLabel
                  key={member.id}
                  control={<Checkbox name={member.user.id} value="true" />}
                  label={
                    member.user.lastname
                      ? member.user.firstname + " " + member.user.lastname
                      : member.user.firstname
                  }
                  checked={formRegistration[member.user.id]}
                  onChange={registrationChange}
                />
              </FormGrid>
            ))}
          {validationErrors &&
            (validationErrors.throttle || validationErrors.error) && (
              <FormGrid size={{ xs: 12 }}>
                <FormHelperText error className={styles.error}>
                  {validationErrors.throttle || validationErrors.error}
                </FormHelperText>
              </FormGrid>
            )}
        </Grid>
        <List className={styles.listButtons}>
          <TransitionGroup>
            {(created || deleted) && (
              <Collapse>
                <Alert
                  icon={<IconCheck fontSize="inherit" />}
                  severity="success"
                  className={styles.alert}
                >
                  {t("pages.calendar.registration.form.success")}
                </Alert>
              </Collapse>
            )}
          </TransitionGroup>
        </List>
      </form>
    </>
  );
}
