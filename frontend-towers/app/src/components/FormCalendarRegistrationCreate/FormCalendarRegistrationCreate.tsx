import * as React from "react";
import { useState } from "react";
import Grid from "@mui/material/Grid2";
import IconCheck from "@mui/icons-material/Check";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import {
  Button,
  Collapse,
  FormHelperText,
  List,
  Stack,
  Typography,
} from "@mui/material";
import styles from "./styles.module.css";
import {
  apiEventRegistrationCreate,
  apiEventRegistrationDelete,
} from "../../api";
import { Alert } from "@mui/lab";
import { TransitionGroup } from "react-transition-group";
import { RegistrationStatus } from "../../enums";

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
  setLastChanged: setEventLastChanged,
}: any) {
  const { t } = useTranslation("common");

  const [created, setCreated] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [registrations, setRegistrations] = useState(
    scheduledEvent.registrations,
  );
  const [validationErrors, setValidationErrors] = useState(undefined);

  const [formRegistration, setFormRegistration] = useState<{
    [key: string]: RegistrationStatus;
  }>(
    Object.fromEntries(
      scheduledEvent.registrations.map((registration: any) => [
        registration.user.id,
        registration.status,
      ]),
    ),
  );

  const registrationIdByUserId = Object.fromEntries(
    registrations.map((registration: any) => [
      registration.user.id,
      registration.id,
    ]),
  );

  function handleButtonCancel(userId: any) {
    if (userId in registrationIdByUserId) {
      const registrationId = registrationIdByUserId[userId];
      apiEventRegistrationDelete(registrationId, eventToken).then(
        (response) => {
          if (response.status === 204) {
            const newRegistrations = registrations.filter(
              (registration: any) => registration.id !== registrationId,
            );
            setRegistrations(newRegistrations);
            setDeleted(true);
            setFormRegistration({
              ...formRegistration,
              [userId]: RegistrationStatus.CANCELLED,
            });
            setEventLastChanged(Date.now());
            setTimeout(() => setDeleted(false), 5000);
          } else if (response.status === 429) {
            setValidationErrors({ throttle: response.data.detail });
          }
        },
      );
    } else {
      apiEventRegistrationCreate(
        userId,
        scheduledEvent.id,
        eventToken,
        RegistrationStatus.CANCELLED,
      ).then((response) => {
        if (response.status === 200) {
          const newRegistrations = registrations.concat(response.data);
          setRegistrations(newRegistrations);
          setDeleted(true);
          setFormRegistration({
            ...formRegistration,
            [userId]: RegistrationStatus.CANCELLED,
          });
          setEventLastChanged(Date.now());
          setTimeout(() => setDeleted(false), 5000);
        } else if (response.status === 429) {
          setValidationErrors({ throttle: response.data.detail });
        }
      });
    }
  }

  function handleButtonAttend(userId: any) {
    apiEventRegistrationCreate(userId, scheduledEvent.id, eventToken).then(
      (response) => {
        if (response.status === 200) {
          const newRegistrations = registrations.concat(response.data);
          setRegistrations(newRegistrations);
          setCreated(true);
          setFormRegistration({
            ...formRegistration,
            [userId]: response.data.status,
          });
          setEventLastChanged(Date.now());
          setTimeout(() => setCreated(false), 5000);
        } else if (response.status === 429) {
          setValidationErrors({ throttle: response.data.detail });
        }
      },
    );
  }

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
              <FormGrid size={{ xs: 12 }} marginTop={1} marginBottom={1}>
                <Typography fontWeight={600} variant="body2">
                  {member.user.lastname
                    ? member.user.firstname + " " + member.user.lastname
                    : member.user.firstname}
                </Typography>
                <Stack direction="row" spacing={2} marginTop={1}>
                  <Button
                    variant={
                      member.user.id in formRegistration &&
                      formRegistration[member.user.id] !==
                        RegistrationStatus.ACTIVE
                        ? "contained"
                        : "outlined"
                    }
                    type="submit"
                    color="error"
                    disableElevation
                    onClick={() => handleButtonCancel(member.user.id)}
                  >
                    {t("pages.calendar.registration.form.button-cancel")}
                  </Button>
                  <Button
                    variant={
                      member.user.id in formRegistration &&
                      formRegistration[member.user.id] ===
                        RegistrationStatus.ACTIVE
                        ? "contained"
                        : "outlined"
                    }
                    type="submit"
                    color="success"
                    disableElevation
                    onClick={() => handleButtonAttend(member.user.id)}
                  >
                    {t("pages.calendar.registration.form.button-attend")}
                  </Button>
                </Stack>
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
