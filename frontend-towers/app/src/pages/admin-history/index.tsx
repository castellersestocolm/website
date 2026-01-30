import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import {
  apiAdminHistoryEventList,
  apiAdminHistoryEventUpdate,
} from "../../api";
import {
  Button,
  Card,
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
import { useState } from "react";
import { capitalizeFirstLetter } from "../../utils/string";
import { Language } from "../../enums";
import PageSuperAdmin from "../../components/PageSuperAdmin/PageSuperAdmin";

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

  const [validationErrors, setValidationErrors] = useState(undefined);
  const [historyEvents, setHistoryEvents] = React.useState(undefined);
  const [historyEventsPage, setHistoryEventsPage] = React.useState(1);

  React.useEffect(() => {
    apiAdminHistoryEventList(historyEventsPage).then((response) => {
      if (response.status === 200) {
        setHistoryEvents(response.data);
      }
    });
  }, [setHistoryEvents, historyEventsPage]);

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
        setValidationErrors(undefined);
      } else {
        setValidationErrors(response.data);
      }
    });
  }

  const content = historyEvents && (
    <Grid container spacing={4} className={styles.adminGrid}>
      <Grid container size={12} spacing={4} direction="row">
        {historyEvents.results.map((historyEvent: any, i: number, row: any) => {
          return (
            <Card
              variant="outlined"
              key={historyEvent.id}
              className={styles.adminCard}
            >
              <Box className={styles.adminTopBox}>
                <Typography variant="h6" fontWeight="600" component="div">
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
              </Box>
              <Divider />
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
                        defaultValue={historyEvent.icon}
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
                            defaultValue={
                              historyEvent.title[Language[language]]
                            }
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
                            defaultValue={
                              historyEvent.description[Language[language]]
                            }
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
