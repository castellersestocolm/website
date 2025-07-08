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
import { useState } from "react";
import Box from "@mui/material/Box";
import { useSearchParams } from "react-router-dom";
import IconEast from "@mui/icons-material/East";
import IconArrowDownward from "@mui/icons-material/ArrowDownward";
import { apiOrgCreate } from "../../api";
import ImageIconSwish from "../../assets/images/icons/swish.png";

// @ts-ignore
import QRCode from "qrcode";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

interface FormElements extends HTMLFormControlsCollection {
  firstname: HTMLInputElement;
  lastname: HTMLInputElement;
  email: HTMLInputElement;
  phone: HTMLInputElement;
  firstname2: HTMLInputElement;
  lastname2: HTMLInputElement;
  email2: HTMLInputElement;
  phone2: HTMLInputElement;
}
interface CreateFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export default function FormJoin() {
  const { t } = useTranslation("common");

  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [validationErrors, setValidationErrors] = useState(undefined);
  const [submitted, setSubmitted] = useState(false);

  const [children, setChildren] = useState([[undefined, undefined, undefined]]);

  const [paymentSvg, setPaymentSvg] = React.useState(undefined);
  const [paymentAmount, setPaymentAmount] = React.useState(undefined);
  const [paymentText, setPaymentText] = React.useState(undefined);

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
    const subAdults = [
      {
        firstname: event.currentTarget.elements.firstname.value,
        lastname: event.currentTarget.elements.lastname.value,
        email: event.currentTarget.elements.email.value,
        phone: event.currentTarget.elements.phone.value,
      },
      ...(event.currentTarget.elements.firstname2.value ||
      event.currentTarget.elements.lastname2.value ||
      event.currentTarget.elements.email2.value ||
      event.currentTarget.elements.phone2.value
        ? [
            {
              firstname: event.currentTarget.elements.firstname2.value,
              lastname: event.currentTarget.elements.lastname2.value,
              email: event.currentTarget.elements.email2.value,
              phone: event.currentTarget.elements.phone2.value,
            },
          ]
        : []),
    ];
    const subChildren =
      children.length >= 1 &&
      // @ts-ignore
      (event.currentTarget.elements["firstname-c0"].value ||
        // @ts-ignore
        event.currentTarget.elements["lastname-c0"].value ||
        // @ts-ignore
        event.currentTarget.elements["birthday-c0"].value)
        ? children.map((child: any, ix: number) => ({
            firstname:
              // @ts-ignore
              event.currentTarget.elements["firstname-c" + ix.toString()].value,
            lastname:
              // @ts-ignore
              event.currentTarget.elements["lastname-c" + ix.toString()].value,
            birthday:
              // @ts-ignore
              event.currentTarget.elements["birthday-c" + ix.toString()].value,
          }))
        : [];
    apiOrgCreate(subAdults, subChildren).then((response) => {
      if (response.status === 201) {
        setValidationErrors(undefined);
        setPaymentAmount(
          subAdults.length === 1 && subChildren.length === 0 ? "150" : "250",
        );
        const membershipText =
          t("swish.payment.membership") +
          " " +
          new Date().toISOString().slice(0, 4) +
          " - " +
          subAdults[0].firstname +
          " " +
          subAdults[0].lastname;
        setPaymentText(membershipText);
        QRCode.toDataURL(
          "C1230688820;" +
            (subAdults.length === 1 && subChildren.length === 0
              ? "150"
              : "250") +
            ";" +
            membershipText +
            ";0",
          { width: 500, margin: 0 },
        )
          .then((url: string) => {
            setPaymentSvg(url);
          })
          .catch((err: any) => {});
        setSubmitted(true);
      } else if (response.status === 429) {
        setValidationErrors({ throttle: response.data.detail });
      } else {
        setValidationErrors(response.data);
      }
    });
  }

  return (
    <>
      {submitted ? (
        <Box className={styles.success}>
          <Box className={styles.userMembershipPaymentBox}>
            <img
              src={ImageIconSwish}
              className={styles.userMembershipPaymentIconSwish}
              alt="Swish logo"
            />
            <img
              src={paymentSvg}
              alt="Swish QR"
              className={styles.userMembershipPaymentSwish}
            />
          </Box>
          <Typography variant="h3" className={styles.amountSubtitle}>
            {paymentAmount}
            {" SEK"}
          </Typography>
          <Typography variant="h4" className={styles.textSubtitle}>
            {paymentText}
          </Typography>
          {t("pages.home-join.payment-list")
            .split("\n")
            .map((text: string) => (
              <Typography variant="body1" className={styles.paymentSubtitle}>
                {text}
              </Typography>
            ))}
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
                error={
                  validationErrors &&
                  validationErrors.adults &&
                  validationErrors.adults.length >= 1 &&
                  validationErrors.adults[0].firstname
                }
              />
              {validationErrors &&
                validationErrors.adults &&
                validationErrors.adults.length >= 1 &&
                validationErrors.adults[0].firstname && (
                  <FormHelperText error>
                    {validationErrors.adults[0].firstname[0].detail}
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
                  validationErrors.adults &&
                  validationErrors.adults.length >= 1 &&
                  validationErrors.adults[0].lastname
                }
              />
              {validationErrors &&
                validationErrors.adults &&
                validationErrors.adults.length >= 1 &&
                validationErrors.adults[0].lastname && (
                  <FormHelperText error>
                    {validationErrors.adults[0].lastname[0].detail}
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
                  validationErrors.adults &&
                  validationErrors.adults.length >= 1 &&
                  validationErrors.adults[0].email
                }
                defaultValue={email}
              />
              {validationErrors &&
                validationErrors.adults &&
                validationErrors.adults.length >= 1 &&
                validationErrors.adults[0].email && (
                  <FormHelperText error>
                    {validationErrors.adults[0].email[0].detail}
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
                  validationErrors.adults &&
                  validationErrors.adults.length >= 1 &&
                  validationErrors.adults[0].phone
                }
              />
              {validationErrors &&
                validationErrors.adults &&
                validationErrors.adults.length >= 1 &&
                validationErrors.adults[0].phone && (
                  <FormHelperText error>
                    {validationErrors.adults[0].phone[0].detail}
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
                        size="small"
                        error={
                          validationErrors &&
                          validationErrors.adults &&
                          validationErrors.adults.length >= 2 &&
                          validationErrors.adults[1].firstname
                        }
                      />
                      {validationErrors &&
                        validationErrors.adults &&
                        validationErrors.adults.length >= 1 &&
                        validationErrors.adults[1].firstname && (
                          <FormHelperText error>
                            {validationErrors.adults[1].firstname[0].detail}
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
                        size="small"
                        error={
                          validationErrors &&
                          validationErrors.adults &&
                          validationErrors.adults.length >= 2 &&
                          validationErrors.adults[1].lastname
                        }
                      />
                      {validationErrors &&
                        validationErrors.adults &&
                        validationErrors.adults.length >= 1 &&
                        validationErrors.adults[1].lastname && (
                          <FormHelperText error>
                            {validationErrors.adults[1].lastname[0].detail}
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
                        size="small"
                        error={
                          validationErrors &&
                          validationErrors.adults &&
                          validationErrors.adults.length >= 2 &&
                          validationErrors.adults[1].email
                        }
                      />
                      {validationErrors &&
                        validationErrors.adults &&
                        validationErrors.adults.length >= 1 &&
                        validationErrors.adults[1].email && (
                          <FormHelperText error>
                            {validationErrors.adults[1].email[0].detail}
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
                        size="small"
                        error={
                          validationErrors &&
                          validationErrors.adults &&
                          validationErrors.adults.length >= 2 &&
                          validationErrors.adults[1].phone
                        }
                      />
                      {validationErrors &&
                        validationErrors.adults &&
                        validationErrors.adults.length >= 1 &&
                        validationErrors.adults[1].phone && (
                          <FormHelperText error>
                            {validationErrors.adults[1].phone[0].detail}
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
                              size="small"
                              error={
                                validationErrors &&
                                validationErrors.children &&
                                validationErrors.children.length >= ix + 1 &&
                                validationErrors.children[ix].firstname
                              }
                            />
                            {validationErrors &&
                              validationErrors.children &&
                              validationErrors.children.length >= ix + 1 &&
                              validationErrors.children[ix].firstname && (
                                <FormHelperText error>
                                  {
                                    validationErrors.children[ix].firstname[0]
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
                              size="small"
                              error={
                                validationErrors &&
                                validationErrors.children &&
                                validationErrors.children.length >= ix + 1 &&
                                validationErrors.children[ix].lastname
                              }
                            />
                            {validationErrors &&
                              validationErrors.children &&
                              validationErrors.children.length >= ix + 1 &&
                              validationErrors.children[ix].lastname && (
                                <FormHelperText error>
                                  {
                                    validationErrors.children[ix].lastname[0]
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
                              size="small"
                              error={
                                validationErrors &&
                                validationErrors.children &&
                                validationErrors.children.length >= ix + 1 &&
                                validationErrors.children[ix].birthday
                              }
                            />
                            {validationErrors &&
                              validationErrors.children &&
                              validationErrors.children.length >= ix + 1 &&
                              validationErrors.children[ix].birthday && (
                                <FormHelperText error>
                                  {
                                    validationErrors.children[ix].birthday[0]
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
                <Button variant="contained" type="submit" disableElevation>
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
            {validationErrors && validationErrors.general && (
              <FormGrid size={{ xs: 12 }}>
                <FormHelperText error className={styles.error}>
                  {validationErrors.general.detail}
                </FormHelperText>
              </FormGrid>
            )}
          </Grid>
        </form>
      )}
    </>
  );
}
