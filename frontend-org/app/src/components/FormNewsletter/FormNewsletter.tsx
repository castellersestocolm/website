import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../routes";
import { Button, FormHelperText, Link, Stack, Typography } from "@mui/material";
import styles from "./styles.module.css";
import {
  apiConsentEntityCreate,
  apiConsentEntityList,
  apiNewsletterList,
} from "../../api";
import { useAppContext } from "../AppContext/AppContext";
import { ConsentType } from "../../enums";
import IconEast from "@mui/icons-material/East";
import { LoaderClip } from "../LoaderClip/LoaderClip";
import Box from "@mui/material/Box";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

interface FormElements extends HTMLFormControlsCollection {
  firstname: HTMLInputElement;
  lastname: HTMLInputElement;
  email: HTMLInputElement;
  phone: HTMLInputElement;
}
interface CreateFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export default function FormNewsletter() {
  const [t, i18n] = useTranslation("common");

  const [validationErrors, setValidationErrors] = React.useState(undefined);

  const [newsletters, setNewsletters] = React.useState(undefined);
  const [newslettersIdsSelected, setNewslettersIdsSelected] =
    React.useState(undefined);
  const [consentGeneralChecked, setConsentGeneralChecked] =
    React.useState(false);
  const [consentMediaChecked, setConsentMediaChecked] = React.useState(false);

  const { user, setMessages } = useAppContext();

  const handleNewsletterCheckbox = (
    event: React.ChangeEvent<HTMLInputElement>,
    newsletterId: string,
  ) => {
    if (event.target.checked) {
      const newsletterIds = [...newslettersIdsSelected, newsletterId];
      setNewslettersIdsSelected(newsletterIds);
    } else {
      const newsletterIds = newslettersIdsSelected.filter(
        (currentNewsletterId: string) => currentNewsletterId !== newsletterId,
      );
      setNewslettersIdsSelected(newsletterIds);
    }
  };

  React.useEffect(() => {
    apiNewsletterList().then((response) => {
      if (response.status === 200) {
        setNewsletters(response.data);
      }
    });
  }, [setNewsletters, i18n.resolvedLanguage]);

  React.useEffect(() => {
    if (user) {
      apiConsentEntityList().then((response) => {
        if (response.status === 200) {
          const consentEntitiesData = response.data;

          if (
            consentEntitiesData &&
            consentEntitiesData.results &&
            consentEntitiesData.results.length > 0
          ) {
            setConsentGeneralChecked(
              consentEntitiesData.results.filter(
                (consentEntity: any) =>
                  consentEntity.type === ConsentType.GENERAL,
              ).length > 0,
            );
            setConsentMediaChecked(
              consentEntitiesData.results.filter(
                (consentEntity: any) =>
                  consentEntity.type === ConsentType.MEDIA,
              ).length > 0,
            );
            setNewslettersIdsSelected(
              consentEntitiesData.results
                .filter(
                  (consentEntity: any) =>
                    consentEntity.type === ConsentType.NEWSLETTER,
                )
                .map((consentEntity: any) => consentEntity.newsletter.id),
            );
          }
        }
      });
    } else {
      setNewslettersIdsSelected([]);
    }
  }, [
    user,
    setNewslettersIdsSelected,
    setConsentGeneralChecked,
    setConsentMediaChecked,
  ]);

  function handleSubmit(event: React.FormEvent<CreateFormElement>) {
    event.preventDefault();
    apiConsentEntityCreate(
      event.currentTarget.elements &&
        event.currentTarget.elements.firstname &&
        event.currentTarget.elements.firstname.value,
      event.currentTarget.elements &&
        event.currentTarget.elements.lastname &&
        event.currentTarget.elements.lastname.value,
      event.currentTarget.elements &&
        event.currentTarget.elements.email &&
        event.currentTarget.elements.email.value,
      event.currentTarget.elements &&
        event.currentTarget.elements.firstname &&
        event.currentTarget.elements.phone.value,
      [
        ...newsletters.results.map((newsletter: any) => {
          return {
            type: ConsentType.NEWSLETTER,
            newsletterId: newsletter.id,
            isActive: newslettersIdsSelected.includes(newsletter.id),
          };
        }),
        { type: ConsentType.GENERAL, isActive: true },
        ...(user ? [{ type: ConsentType.MEDIA, isActive: true }] : []),
      ],
    ).then((response) => {
      if (response.status === 201) {
        setValidationErrors(undefined);
        setMessages([
          {
            message: t("pages.about-newsletter.success"),
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

  return newslettersIdsSelected !== undefined &&
    newsletters !== undefined &&
    consentGeneralChecked !== undefined &&
    consentMediaChecked !== undefined ? (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {!user && (
          <>
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
                error={
                  validationErrors &&
                  validationErrors.firstname &&
                  validationErrors.firstname[0].detail
                }
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
          </>
        )}
        {newsletters &&
          newsletters.results &&
          newsletters.results.length > 0 &&
          newsletters.results.map((newsletter: any) => {
            return (
              <FormGrid size={{ xs: 12 }} key={newsletter.id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="confirmNewsletter"
                      value="yes"
                      checked={
                        newslettersIdsSelected &&
                        newslettersIdsSelected.includes(newsletter.id)
                      }
                      onChange={(e) =>
                        handleNewsletterCheckbox(e, newsletter.id)
                      }
                    />
                  }
                  label={
                    <>
                      <Typography variant="body1">{newsletter.name}</Typography>
                      {newsletter.description && (
                        <Typography variant="body2">
                          {newsletter.description}
                        </Typography>
                      )}
                    </>
                  }
                />
              </FormGrid>
            );
          })}
        {user && (
          <FormGrid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="confirmCasalMedia"
                  value="yes"
                  checked={consentMediaChecked}
                  disabled={consentMediaChecked}
                  onChange={(e) => setConsentMediaChecked(e.target.checked)}
                />
              }
              label={t("pages.user-join.form.checkbox-image")}
              required={true}
            />
          </FormGrid>
        )}
        <FormGrid size={{ xs: 12 }}>
          <FormControlLabel
            control={
              <Checkbox
                name="confirmCasalGeneral"
                value="yes"
                checked={consentGeneralChecked}
                disabled={consentGeneralChecked}
                onChange={(e) => setConsentGeneralChecked(e.target.checked)}
              />
            }
            label={t("pages.user-join.form.checkbox-processing")}
            required={true}
          />
          <Typography>
            <Link
              href={ROUTES["policy-privacy"].path}
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
              {t("pages.about-newsletter.form.button-complete")}
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
  ) : (
    <Box className={styles.pageLoader}>
      <LoaderClip />
    </Box>
  );
}
