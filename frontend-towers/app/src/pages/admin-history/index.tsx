import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import {
  apiAdminHistoryEventCreate,
  apiAdminHistoryEventDelete,
  apiAdminHistoryEventList,
  apiAdminHistoryEventUpdate,
} from "../../api";
import {
  Button,
  Card,
  Collapse,
  Divider,
  FormHelperText,
  Stack,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import { API_ADMIN_HISTORY_EVENT_PAGE_SIZE } from "../../consts";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import { capitalizeFirstLetter } from "../../utils/string";
import { Language } from "../../enums";
import PageSuperAdmin from "../../components/PageSuperAdmin/PageSuperAdmin";
import Alert from "@mui/material/Alert";
import IconCheck from "@mui/icons-material/Check";
import { TransitionGroup } from "react-transition-group";
import IconAdd from "@mui/icons-material/Add";
import IconRemoveCircleOutline from "@mui/icons-material/RemoveCircleOutline";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

interface UpdateFormElements extends HTMLFormControlsCollection {
  date: HTMLInputElement;
  title: HTMLInputElement;
  description: HTMLInputElement;
  icon: HTMLInputElement;
}
interface UpdateFormElement extends HTMLFormElement {
  readonly elements: UpdateFormElements;
}

function AdminHistoryPage() {
  const [t, i18n] = useTranslation("common");

  const [historyEvents, setHistoryEvents] = React.useState(undefined);
  const [historyEventsPage, setHistoryEventsPage] = React.useState(1);
  const [successById, setSuccessById] = React.useState<{
    [id: string]: boolean;
  }>({});
  const [validationErrors, setValidationErrors] = React.useState(undefined);
  const [validationErrorsById, setValidationErrorsById] = React.useState<{
    [id: string]: any;
  }>({});
  const [successDeletedByOrder, setSuccessDeletedByOrder] = React.useState<{
    [id: string]: boolean;
  }>({});
  const [successAddedByOrder, setSuccessAddedByOrder] = React.useState<{
    [id: string]: boolean;
  }>({});
  const [isAdding, setIsAdding] = React.useState(false);

  React.useEffect(() => {
    apiAdminHistoryEventList(historyEventsPage).then((response) => {
      if (response.status === 200) {
        setHistoryEvents(response.data);
      }
    });
  }, [setHistoryEvents, historyEventsPage]);

  function handleCreate(event: React.FormEvent<UpdateFormElement>) {
    event.preventDefault();
    apiAdminHistoryEventCreate(
      event.currentTarget.elements.date.value,
      Object.fromEntries(
        (Object.keys(Language) as Array<keyof typeof Language>).map(
          (language) => [
            Language[language],
            (
              event.currentTarget.elements.namedItem(
                "title_" + Language[language],
              ) as HTMLInputElement
            ).value,
          ],
        ),
      ),
      Object.fromEntries(
        (Object.keys(Language) as Array<keyof typeof Language>).map(
          (language) => [
            Language[language],
            (
              event.currentTarget.elements.namedItem(
                "description_" + Language[language],
              ) as HTMLInputElement
            ).value,
          ],
        ),
      ),
      event.currentTarget.elements.icon.value,
    ).then((response) => {
      if (response.status === 200) {
        setValidationErrors(undefined);
        setSuccessAddedByOrder({ ...successAddedByOrder, 0: true });
        setTimeout(
          () =>
            setSuccessAddedByOrder({ ...successAddedByOrder, 0: undefined }),
          3000,
        );
        apiAdminHistoryEventList(historyEventsPage).then((response) => {
          if (response.status === 200) {
            setHistoryEvents(response.data);
          }
        });
        setIsAdding(false);
      } else {
        setValidationErrors(response.data);
      }
    });
  }

  function handleUpdate(
    historyEventId: string,
    event: React.FormEvent<UpdateFormElement>,
  ) {
    event.preventDefault();
    apiAdminHistoryEventUpdate(
      historyEventId,
      event.currentTarget.elements.date.value,
      Object.fromEntries(
        (Object.keys(Language) as Array<keyof typeof Language>).map(
          (language) => [
            Language[language],
            (
              event.currentTarget.elements.namedItem(
                "title_" + Language[language],
              ) as HTMLInputElement
            ).value,
          ],
        ),
      ),
      Object.fromEntries(
        (Object.keys(Language) as Array<keyof typeof Language>).map(
          (language) => [
            Language[language],
            (
              event.currentTarget.elements.namedItem(
                "description_" + Language[language],
              ) as HTMLInputElement
            ).value,
          ],
        ),
      ),
      event.currentTarget.elements.icon.value,
    ).then((response) => {
      if (response.status === 202) {
        setValidationErrorsById({
          ...validationErrorsById,
          [historyEventId]: undefined,
        });
        setSuccessById({ ...successById, [historyEventId]: true });
        setTimeout(
          () => setSuccessById({ ...successById, [historyEventId]: undefined }),
          3000,
        );
      } else {
        setValidationErrorsById({
          ...validationErrorsById,
          [historyEventId]: response.data,
        });
      }
    });
  }

  function handleDelete(i: number, historyEventId: string) {
    apiAdminHistoryEventDelete(historyEventId).then((response) => {
      if (response.status === 204) {
        setSuccessDeletedByOrder({ ...successDeletedByOrder, [i]: true });
        setTimeout(
          () =>
            setSuccessDeletedByOrder({
              ...successDeletedByOrder,
              [i]: undefined,
            }),
          3000,
        );
        apiAdminHistoryEventList(historyEventsPage).then((response) => {
          if (response.status === 200) {
            setHistoryEvents(response.data);
          }
        });
      }
    });
  }

  const content = historyEvents && (
    <Grid container spacing={2} className={styles.adminGrid}>
      <Grid container size={12} spacing={2} direction="row">
        <TransitionGroup className={styles.transitionAlert}>
          {isAdding ? (
            <Card variant="outlined" className={styles.adminCard}>
              <Box className={styles.adminTopBox}>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  component="div"
                  className={styles.adminTopBoxTitle}
                >
                  TEST
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  className={styles.adminTopBoxButtons}
                  width="100%"
                >
                  <Button
                    variant="contained"
                    type="submit"
                    disableElevation
                    color="secondary"
                    onClick={() => setIsAdding(false)}
                  >
                    <IconRemoveCircleOutline
                      fontSize="inherit"
                      className={styles.buttonIcon}
                    />
                    {t("pages.admin-history.event-table.button-delete")}
                  </Button>
                </Stack>
              </Box>
              <Divider />
              <form
                onSubmit={(event: React.FormEvent<UpdateFormElement>) =>
                  handleCreate(event)
                }
              >
                <Box className={styles.adminTopTransparentBox}>
                  <Grid container spacing={2}>
                    <FormGrid size={{ xs: 12, md: 3 }}>
                      <FormLabel htmlFor="date" required>
                        {t("pages.admin-history.event-table.date")}
                      </FormLabel>
                      <OutlinedInput
                        id="date"
                        name="date"
                        type="date"
                        autoComplete="date"
                        required
                        size="small"
                        error={
                          validationErrors &&
                          validationErrors.date &&
                          validationErrors.date[0].detail
                        }
                      />
                      {validationErrors && validationErrors.date && (
                        <FormHelperText error>
                          {validationErrors.date[0].detail}
                        </FormHelperText>
                      )}
                    </FormGrid>
                    <FormGrid size={{ xs: 12, md: 3 }}>
                      <FormLabel htmlFor="icon" required>
                        {t("pages.admin-history.event-table.icon")}
                      </FormLabel>
                      <OutlinedInput
                        id="icon"
                        name="icon"
                        type="text"
                        autoComplete="icon"
                        required
                        size="small"
                        error={
                          validationErrors &&
                          validationErrors.icon &&
                          validationErrors.icon[0].detail
                        }
                      />
                      {validationErrors && validationErrors.icon && (
                        <FormHelperText error>
                          {validationErrors.icon[0].detail}
                        </FormHelperText>
                      )}
                    </FormGrid>
                    {(
                      Object.keys(Language) as Array<keyof typeof Language>
                    ).map((language) => {
                      return (
                        <FormGrid size={12}>
                          <FormLabel htmlFor="title" required>
                            {t("pages.admin-history.event-table.title")}
                            {" ["}
                            {Language[language]}
                            {"]"}
                          </FormLabel>
                          <OutlinedInput
                            id={"title_" + Language[language]}
                            name="title"
                            type="text"
                            autoComplete="title"
                            required
                            size="small"
                            error={
                              validationErrors &&
                              validationErrors.title &&
                              validationErrors.title[0].detail
                            }
                          />
                          {validationErrors && validationErrors.title && (
                            <FormHelperText error>
                              {validationErrors.title[0].detail}
                            </FormHelperText>
                          )}
                        </FormGrid>
                      );
                    })}
                    {(
                      Object.keys(Language) as Array<keyof typeof Language>
                    ).map((language) => {
                      return (
                        <FormGrid size={12}>
                          <FormLabel htmlFor="description" required>
                            {t("pages.admin-history.event-table.description")}
                            {" ["}
                            {Language[language]}
                            {"]"}
                          </FormLabel>
                          <OutlinedInput
                            id={"description_" + Language[language]}
                            name="description"
                            type="text"
                            autoComplete="description"
                            required
                            size="small"
                            error={
                              validationErrors &&
                              validationErrors.description &&
                              validationErrors.description[0].detail
                            }
                          />
                          {validationErrors && validationErrors.description && (
                            <FormHelperText error>
                              {validationErrors.description[0].detail}
                            </FormHelperText>
                          )}
                        </FormGrid>
                      );
                    })}
                    <FormGrid size={12}>
                      <Stack
                        direction="row"
                        spacing={2}
                        className={styles.buttons}
                      >
                        <Button
                          variant="contained"
                          type="submit"
                          name="join-backend"
                          disableElevation
                        >
                          {t("pages.admin-history.event-table.button")}
                        </Button>
                      </Stack>
                    </FormGrid>
                  </Grid>
                </Box>
              </form>
            </Card>
          ) : (
            <Stack
              direction="row"
              spacing={2}
              className={styles.buttons}
              width="100%"
            >
              <Button
                variant="contained"
                type="submit"
                disableElevation
                onClick={() => setIsAdding(true)}
              >
                <IconAdd fontSize="inherit" />
                {t("pages.admin-history.event-table.button-add")}
              </Button>
            </Stack>
          )}
        </TransitionGroup>
      </Grid>
      <Grid container size={12} spacing={2} direction="row">
        {[...Array(3).keys()].map((i: number) => {
          const historyEvent = historyEvents.results[i];
          return (
            <>
              <TransitionGroup className={styles.transitionAlert}>
                {successDeletedByOrder[i] && (
                  <Collapse>
                    <Alert
                      icon={<IconCheck fontSize="inherit" />}
                      severity="success"
                      className={styles.alert}
                    >
                      {t("pages.admin-history.event-table.success-delete")}
                    </Alert>
                  </Collapse>
                )}
                {successAddedByOrder[i] && (
                  <Collapse>
                    <Alert
                      icon={<IconCheck fontSize="inherit" />}
                      severity="success"
                      className={styles.alert}
                    >
                      {t("pages.admin-history.event-table.success-add")}
                    </Alert>
                  </Collapse>
                )}
              </TransitionGroup>
              {historyEvent && (
                <Card
                  variant="outlined"
                  key={historyEvent.id}
                  className={styles.adminCard}
                >
                  <Box className={styles.adminTopBox}>
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      component="div"
                      className={styles.adminTopBoxTitle}
                    >
                      {capitalizeFirstLetter(
                        new Date(historyEvent.date).toLocaleDateString(
                          i18n.resolvedLanguage,
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          },
                        ),
                      )}
                      {Object.keys(historyEvent.title).includes(
                        i18n.resolvedLanguage,
                      ) &&
                        historyEvent.title[i18n.resolvedLanguage] &&
                        " — " + historyEvent.title[i18n.resolvedLanguage]}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={2}
                      className={styles.adminTopBoxButtons}
                      width="100%"
                    >
                      <Button
                        variant="contained"
                        type="submit"
                        disableElevation
                        color="secondary"
                        onClick={() => handleDelete(i, historyEvent.id)}
                      >
                        <IconRemoveCircleOutline
                          fontSize="inherit"
                          className={styles.buttonIcon}
                        />
                        {t("pages.admin-history.event-table.button-delete")}
                      </Button>
                    </Stack>
                  </Box>
                  <Divider />
                  <TransitionGroup>
                    {successById[historyEvent.id] && (
                      <Collapse>
                        <Alert
                          icon={<IconCheck fontSize="inherit" />}
                          severity="success"
                          className={styles.alert}
                        >
                          {t("pages.admin-history.event-table.success")}
                        </Alert>
                      </Collapse>
                    )}
                  </TransitionGroup>
                  <form
                    onSubmit={(event: React.FormEvent<UpdateFormElement>) =>
                      handleUpdate(historyEvent.id, event)
                    }
                  >
                    <Box className={styles.adminTopTransparentBox}>
                      <Grid container spacing={2}>
                        <FormGrid size={{ xs: 12, md: 3 }}>
                          <FormLabel htmlFor="date" required>
                            {t("pages.admin-history.event-table.date")}
                          </FormLabel>
                          <OutlinedInput
                            id="date"
                            name="date"
                            type="date"
                            autoComplete="date"
                            required
                            size="small"
                            defaultValue={historyEvent.date}
                            error={
                              validationErrorsById[historyEvent.id] &&
                              validationErrorsById[historyEvent.id].date &&
                              validationErrorsById[historyEvent.id].date[0]
                                .detail
                            }
                          />
                          {validationErrorsById[historyEvent.id] &&
                            validationErrorsById[historyEvent.id].date && (
                              <FormHelperText error>
                                {
                                  validationErrorsById[historyEvent.id].date[0]
                                    .detail
                                }
                              </FormHelperText>
                            )}
                        </FormGrid>
                        <FormGrid size={{ xs: 12, md: 3 }}>
                          <FormLabel htmlFor="icon" required>
                            {t("pages.admin-history.event-table.icon")}
                          </FormLabel>
                          <OutlinedInput
                            id="icon"
                            name="icon"
                            type="text"
                            autoComplete="icon"
                            required
                            size="small"
                            defaultValue={historyEvent.icon}
                            error={
                              validationErrorsById[historyEvent.id] &&
                              validationErrorsById[historyEvent.id].icon &&
                              validationErrorsById[historyEvent.id].icon[0]
                                .detail
                            }
                          />
                          {validationErrorsById[historyEvent.id] &&
                            validationErrorsById[historyEvent.id].icon && (
                              <FormHelperText error>
                                {
                                  validationErrorsById[historyEvent.id].icon[0]
                                    .detail
                                }
                              </FormHelperText>
                            )}
                        </FormGrid>
                        {(
                          Object.keys(Language) as Array<keyof typeof Language>
                        ).map((language) => {
                          return (
                            <FormGrid size={12}>
                              <FormLabel htmlFor="title" required>
                                {t("pages.admin-history.event-table.title")}
                                {" ["}
                                {Language[language]}
                                {"]"}
                              </FormLabel>
                              <OutlinedInput
                                id={"title_" + Language[language]}
                                name="title"
                                type="text"
                                autoComplete="title"
                                required
                                size="small"
                                defaultValue={
                                  historyEvent.title[Language[language]]
                                }
                                error={
                                  validationErrorsById[historyEvent.id] &&
                                  validationErrorsById[historyEvent.id].title &&
                                  validationErrorsById[historyEvent.id].title[0]
                                    .detail
                                }
                              />
                              {validationErrorsById[historyEvent.id] &&
                                validationErrorsById[historyEvent.id].title && (
                                  <FormHelperText error>
                                    {
                                      validationErrorsById[historyEvent.id]
                                        .title[0].detail
                                    }
                                  </FormHelperText>
                                )}
                            </FormGrid>
                          );
                        })}
                        {(
                          Object.keys(Language) as Array<keyof typeof Language>
                        ).map((language) => {
                          return (
                            <FormGrid size={12}>
                              <FormLabel htmlFor="description" required>
                                {t(
                                  "pages.admin-history.event-table.description",
                                )}
                                {" ["}
                                {Language[language]}
                                {"]"}
                              </FormLabel>
                              <OutlinedInput
                                id={"description_" + Language[language]}
                                name="description"
                                type="text"
                                autoComplete="description"
                                required
                                size="small"
                                defaultValue={
                                  historyEvent.description[Language[language]]
                                }
                                error={
                                  validationErrorsById[historyEvent.id] &&
                                  validationErrorsById[historyEvent.id]
                                    .description &&
                                  validationErrorsById[historyEvent.id]
                                    .description[0].detail
                                }
                              />
                              {validationErrorsById[historyEvent.id] &&
                                validationErrorsById[historyEvent.id]
                                  .description && (
                                  <FormHelperText error>
                                    {
                                      validationErrorsById[historyEvent.id]
                                        .description[0].detail
                                    }
                                  </FormHelperText>
                                )}
                            </FormGrid>
                          );
                        })}
                        <FormGrid size={12}>
                          <Stack
                            direction="row"
                            spacing={2}
                            className={styles.buttons}
                          >
                            <Button
                              variant="contained"
                              type="submit"
                              name="join-backend"
                              disableElevation
                            >
                              {t("pages.admin-history.event-table.button")}
                            </Button>
                          </Stack>
                        </FormGrid>
                      </Grid>
                    </Box>
                  </form>
                </Card>
              )}
            </>
          );
        })}
        {historyEvents.results.length > 0 &&
          (historyEvents !== 1 ||
            historyEvents.count > historyEvents.results.length) && (
            <Stack alignItems="center" width="100%">
              <Pagination
                count={Math.ceil(
                  historyEvents.count / API_ADMIN_HISTORY_EVENT_PAGE_SIZE,
                )}
                onChange={(e: any, value: number) =>
                  setHistoryEventsPage(value)
                }
              />
            </Stack>
          )}
      </Grid>
    </Grid>
  );

  return (
    <PageSuperAdmin
      title={t("pages.admin-history.title")}
      content={content}
      finishedRegistration={true}
    />
  );
}

export default AdminHistoryPage;
