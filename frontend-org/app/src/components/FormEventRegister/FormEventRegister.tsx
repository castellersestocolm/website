import * as React from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../AppContext/AppContext";
import {
  apiEventRegistrationCreate,
  apiEventRegistrationDelete,
  apiOrderEventCreate,
} from "../../api";
import {
  Collapse,
  Card,
  Divider,
  FormHelperText,
  Typography,
  Stack,
  Button,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import styles from "./styles.module.css";
import { useState } from "react";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import { EventQuestionType, RegistrationStatus } from "../../enums";
import { ROUTES } from "../../routes";
import IconEast from "@mui/icons-material/East";
import IconAccountCircle from "@mui/icons-material/AccountCircle";
import IconExpandLess from "@mui/icons-material/ExpandLess";
import IconExpandMore from "@mui/icons-material/ExpandMore";
import Checkbox from "@mui/material/Checkbox";
import { LoaderClip } from "../LoaderClip/LoaderClip";
import IconPriorityHigh from "@mui/icons-material/PriorityHigh";
import Alert from "@mui/material/Alert";

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
  /*
    height_shoulders: HTMLInputElement;
    height_arms: HTMLInputElement;
  */
}
interface CreateFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export default function FormEventRegister({ event }: any) {
  const [t, i18n] = useTranslation("common");

  const { user, setMessages } = useAppContext();

  let navigate = useNavigate();

  const [validationErrors, setValidationErrors] = useState(undefined);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(true);
  const [extraOpen, setExtraOpen] = useState(false);
  const [registrations, setRegistrations] = useState(undefined);
  const [entityUsers, setEntityUsers] = useState([]);
  const [extraEntityUsers, setExtraEntityUsers] = useState([]);
  const [ownerEntity, setOwnerEntity] = useState(undefined);

  const [formData, setFormData] = useState({
    user: undefined,
    entity: undefined,
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    birthday: "",
    isUnderage: false,
    registration: undefined,
    questions: undefined,
  });

  const infoChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const infoChangeQuestion = (order: number, value: any) => {
    setFormData({
      ...formData,
      questions: {
        ...(formData.questions ? formData.questions : {}),
        [order]: value,
      },
    });
  };

  const infoChangeCheckbox = (name: string, value: boolean) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  React.useEffect(() => {
    if (user && user.family && user.family.members) {
      setEntityUsers(
        user.family.members.map((member: any) => [
          member.user.entity,
          member.user,
        ]),
      );
      setOwnerEntity(user.entity);
    }
    setIsLoadingUsers(false);
  }, [user, setEntityUsers, setIsLoadingUsers, setOwnerEntity]);

  React.useEffect(() => {
    if (!isLoadingUsers && event && event.registrations) {
      setRegistrations(event.registrations);
      const entityIds = entityUsers.map((entityUser: any) => entityUser[0].id);
      const currentExtraEntityUsers = event.registrations
        .filter(
          (registration: any) => !entityIds.includes(registration.entity.id),
        )
        .map((registration: any) => [registration.entity, undefined]);
      setExtraEntityUsers(currentExtraEntityUsers);
    }
    setIsLoadingRegistrations(false);
  }, [
    event,
    isLoadingUsers,
    entityUsers,
    setRegistrations,
    setExtraEntityUsers,
    setIsLoadingRegistrations,
  ]);

  function handleSubmit(e: React.FormEvent<CreateFormElement>) {
    e.preventDefault();
    apiEventRegistrationCreate(
      formData.user && formData.user.id,
      formData.entity && formData.entity.id,
      ownerEntity && ownerEntity.id,
      event.id,
      formData.firstname,
      formData.lastname,
      formData.email,
      formData.phone,
      formData.birthday,
      i18n.resolvedLanguage,
      undefined,
      undefined,
      { questions: formData.questions },
    ).then((response) => {
      if (response.status === 200) {
        setRegistrations([
          ...registrations.filter(
            (registration: any) => registration.id !== response.data.id,
          ),
          response.data,
        ]);
        const entityUser = entityUsers.find(
          (entityUser: any) => entityUser[0].id === response.data.entity.id,
        );
        if (!entityUser) {
          setExtraEntityUsers([
            ...extraEntityUsers.filter(
              (entityUser: any) => entityUser[0].id !== response.data.entity.id,
            ),
            [response.data.entity, undefined],
          ]);
        }
        if (!ownerEntity) {
          setOwnerEntity(formData);
        }
        setFormDataEmpty();
        setExtraOpen(false);
        setValidationErrors(undefined);
      } else if (response.status === 429) {
        setValidationErrors({ throttle: response.data.detail });
      } else {
        setValidationErrors(response.data);
      }
    });
  }

  function setFormDataUser(userId: string) {
    const [entity, user] = allEntityUsers.find(
      (entityUser: any) => entityUser[1].id === userId,
    );
    const registration =
      registrations &&
      registrations.find(
        (registration: any) => registration.entity.id === entity.id,
      );

    setFormData({
      user: user,
      entity: entity,
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      birthday: "",
      isUnderage: false,
      registration: registration,
      questions:
        registration && registration.data && registration.data.questions,
    });
  }

  function setFormDataEntity(entityId: string) {
    const [entity, user] = allEntityUsers.find(
      (entityUser: any) => entityUser[0].id === entityId,
    );
    const registration =
      registrations &&
      registrations.find(
        (registration: any) => registration.entity.id === entity.id,
      );

    setFormData({
      user: user,
      entity: entity,
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      birthday: "",
      isUnderage: false,
      registration: registration,
      questions:
        registration && registration.data && registration.data.questions,
    });
  }

  function setFormDataEmpty() {
    setFormData({
      user: undefined,
      entity: undefined,
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      birthday: "",
      isUnderage: false,
      registration: undefined,
      questions: undefined,
    });
  }

  function handleRegistrationUserCreate(userId: string, eventId: string) {
    if (hasQuestions) {
      setFormDataUser(userId);
      setExtraOpen(true);
    } else {
      apiEventRegistrationCreate(
        userId,
        undefined,
        ownerEntity && ownerEntity.id,
        eventId,
      ).then((response) => {
        if (response.status === 200) {
          setRegistrations([
            ...registrations.filter(
              (registration: any) => registration.id !== response.data.id,
            ),
            response.data,
          ]);
          if (!ownerEntity) {
            setOwnerEntity(response.data.entity);
          }
        }
      });
    }
  }

  function handleRegistrationEntityCreate(entityId: string, eventId: string) {
    if (hasQuestions) {
      setFormDataEntity(entityId);
      setExtraOpen(true);
    } else {
      apiEventRegistrationCreate(
        undefined,
        entityId,
        ownerEntity && ownerEntity.id,
        eventId,
      ).then((response) => {
        if (response.status === 200) {
          setRegistrations([
            ...registrations.filter(
              (registration: any) => registration.id !== response.data.id,
            ),
            response.data,
          ]);
          if (!ownerEntity) {
            setOwnerEntity(response.data.entity);
          }
        }
      });
    }
  }

  console.log(ownerEntity);

  function handleRegistrationDelete(registrationId: string) {
    apiEventRegistrationDelete(registrationId).then((response) => {
      if (response.status === 200) {
        setRegistrations(
          registrations.map((registration: any) =>
            registration.id === response.data.id ? response.data : registration,
          ),
        );
        setFormDataEmpty();
      }
    });
  }

  function handleRegistrationProcess() {
    if (registrationsRequested && registrationsRequested.length > 0) {
      const cartEventRegistrations = registrationsRequested.map(
        (registration: any) => {
          return { id: registration.id };
        },
      );

      apiOrderEventCreate(cartEventRegistrations, ownerEntity).then(
        (response) => {
          if (response.status === 201) {
            navigate(
              ROUTES["calendar-event-payment"].path.replace(
                ":id",
                response.data.id,
              ),
            );
          } else {
            setMessages([
              { message: t("pages.order-cart.order.error"), type: "error" },
            ]);
            setTimeout(() => setMessages(undefined), 10000);
          }
        },
      );
    }
  }

  const allEntityUsers = [...entityUsers, ...extraEntityUsers];

  const hasQuestions = event && event.questions && event.questions.length > 0;
  const answeredQuestionOrders =
    formData && formData.questions ? Object.keys(formData.questions) : [];
  const hasAnsweredAll =
    !hasQuestions ||
    event.questions.filter(
      (question: any) =>
        question.is_required &&
        !answeredQuestionOrders.includes(question.order.toString()),
    ).length === 0;

  const registrationsRequested =
    registrations &&
    registrations.filter(
      (registration: any) =>
        registration.status === RegistrationStatus.REQUESTED,
    );
  const pendingAmount =
    registrationsRequested &&
    registrationsRequested
      .filter((registration: any) => registration.price)
      .reduce(
        (totalAmount: any, registration: any) => ({
          ...registration.price.amount,
          amount: totalAmount.amount + registration.price.amount.amount,
        }),
        {
          amount: 0,
          currency:
            registrationsRequested &&
            registrationsRequested.length > 0 &&
            registrationsRequested[0].price.amount.currency,
        },
      );

  return (
    <>
      <Collapse
        in={registrationsRequested && registrationsRequested.length > 0}
        timeout="auto"
        unmountOnExit
        className={styles.registrationCollapse}
      >
        <Grid container spacing={3} justifyContent="center">
          <Grid size={{ xs: 12, sm: 10, md: 7, lg: 10, xl: 8 }}>
            <Alert
              variant="outlined"
              icon={<IconPriorityHigh fontSize="inherit" />}
              severity="error"
              className={styles.alert}
            >
              {t("pages.calendar-event.register.alert.payment-pending")}
              <Stack
                direction="row"
                spacing={2}
                marginTop="8px"
                whiteSpace="nowrap"
              >
                <Button
                  variant="contained"
                  type="submit"
                  style={{ width: "auto" }}
                  color="primary"
                  disableElevation
                  onClick={handleRegistrationProcess}
                >
                  {t("pages.calendar-event.register.button-pay")}
                  {pendingAmount &&
                    " " + pendingAmount.amount + " " + pendingAmount.currency}
                </Button>
              </Stack>
            </Alert>
          </Grid>
        </Grid>
      </Collapse>
      <Grid container spacing={3} justifyContent="center">
        <Grid size={{ xs: 12, sm: 10, md: 7, lg: 5, xl: 4 }}>
          <Card variant="outlined">
            <Box
              className={styles.userTopBox}
              display="flex"
              flexDirection={{ xs: "column", lg: "row" }}
              alignItems={{ xs: "start", lg: "center" }}
            >
              <Typography
                variant="h6"
                fontWeight="600"
                component="span"
                sx={{ flexGrow: 1 }}
              >
                {user
                  ? t("pages.calendar-event.register-list.title")
                  : t("pages.calendar-event.register-list.title-external")}
              </Typography>
            </Box>
            <Divider />
            {isLoadingUsers || isLoadingRegistrations ? (
              <Box className={styles.loader}>
                <LoaderClip />
              </Box>
            ) : (
              <Box className={styles.userFamilyBox}>
                {allEntityUsers && allEntityUsers.length > 0 ? (
                  <List className={styles.userFamilyList}>
                    {allEntityUsers &&
                      allEntityUsers.map(
                        (entityUser: any, i: number, row: any) => {
                          const entity = entityUser[0];
                          const registrationUser = entityUser[1];
                          const registration =
                            registrations &&
                            registrations.find(
                              (registration: any) =>
                                registration.entity.id === entity.id,
                            );

                          return (
                            <>
                              <Box
                                key={entity.id}
                                className={
                                  formData.entity &&
                                  formData.entity.id === entity.id &&
                                  styles.userRowActive
                                }
                              >
                                <ListItemButton disableTouchRipple dense>
                                  <ListItemIcon>
                                    <IconAccountCircle />
                                  </ListItemIcon>
                                  <Box
                                    className={styles.userFamilyListInner}
                                    flexDirection={{
                                      xs: "column",
                                      lg: "row",
                                    }}
                                    alignItems={{
                                      xs: "start",
                                      lg: "center",
                                    }}
                                  >
                                    <ListItemText
                                      primary={
                                        <>
                                          <Typography
                                            variant="body2"
                                            component="span"
                                          >
                                            {entity.lastname
                                              ? entity.firstname +
                                                " " +
                                                entity.lastname
                                              : entity.firstname}
                                          </Typography>
                                          {registration &&
                                            registration.price &&
                                            registration.status !==
                                              RegistrationStatus.CANCELLED && (
                                              <Typography
                                                variant="body2"
                                                component="span"
                                                color="textSecondary"
                                              >
                                                {" — "}
                                                {
                                                  registration.price.amount
                                                    .amount
                                                }{" "}
                                                {
                                                  registration.price.amount
                                                    .currency
                                                }
                                              </Typography>
                                            )}
                                        </>
                                      }
                                      secondary={
                                        registration && (
                                          <Typography
                                            variant="body2"
                                            style={{
                                              color:
                                                registration.status ===
                                                RegistrationStatus.ACTIVE
                                                  ? "var(--mui-palette-success-main)"
                                                  : registration.status ===
                                                      RegistrationStatus.CANCELLED
                                                    ? "var(--mui-palette-text-secondary)"
                                                    : "var(--mui-palette-error-main)",
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            {registration.status ===
                                            RegistrationStatus.ACTIVE
                                              ? registration.price &&
                                                registration.price.amount
                                                  .amount === 0
                                                ? t(
                                                    "pages.activity-kids.content.section-register.status-active-free",
                                                  )
                                                : t(
                                                    "pages.activity-kids.content.section-register.status-active",
                                                  )
                                              : registration.status ===
                                                  RegistrationStatus.CANCELLED
                                                ? t(
                                                    "pages.activity-kids.content.section-register.status-cancelled",
                                                  )
                                                : t(
                                                    "pages.activity-kids.content.section-register.status-requested",
                                                  )}
                                          </Typography>
                                        )
                                      }
                                    ></ListItemText>

                                    {(!registration ||
                                      registration.status !==
                                        RegistrationStatus.ACTIVE ||
                                      !registration.price ||
                                      registration.price.amount.amount ===
                                        0) && (
                                      <Stack
                                        direction="row"
                                        spacing={2}
                                        marginLeft={{
                                          xs: "0",
                                          lg: "16px",
                                        }}
                                        marginTop="8px"
                                        marginBottom="8px"
                                        whiteSpace="nowrap"
                                      >
                                        <Button
                                          variant="contained"
                                          type="submit"
                                          style={{ width: "auto" }}
                                          disableElevation
                                          color={
                                            registration &&
                                            registration.status <=
                                              RegistrationStatus.ACTIVE
                                              ? "error"
                                              : "primary"
                                          }
                                          disabled={
                                            !user ||
                                            (formData.entity &&
                                              formData.entity.id ===
                                                entity.id) ||
                                            (registration &&
                                              registration.status ===
                                                RegistrationStatus.ACTIVE &&
                                              registration.price &&
                                              registration.price.amount.amount >
                                                0)
                                          }
                                          onClick={() => {
                                            if (
                                              registration &&
                                              registration.status <=
                                                RegistrationStatus.ACTIVE
                                            ) {
                                              handleRegistrationDelete(
                                                registration.id,
                                              );
                                            } else {
                                              if (registrationUser) {
                                                handleRegistrationUserCreate(
                                                  registrationUser.id,
                                                  event.id,
                                                );
                                              } else {
                                                handleRegistrationEntityCreate(
                                                  entity.id,
                                                  event.id,
                                                );
                                              }
                                            }
                                          }}
                                        >
                                          {registration &&
                                          registration.status <=
                                            RegistrationStatus.ACTIVE
                                            ? t(
                                                "pages.calendar-event.register-list.deregister",
                                              )
                                            : t(
                                                "pages.calendar-event.register-list.register",
                                              )}
                                        </Button>
                                      </Stack>
                                    )}
                                  </Box>
                                </ListItemButton>
                              </Box>
                              {i + 1 < row.length && <Divider />}
                            </>
                          );
                        },
                      )}
                  </List>
                ) : (
                  <Box className={styles.userFamilyEmpty}>
                    <Typography variant="body2">
                      {t("pages.calendar-event.register-list.empty")}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Card>
        </Grid>
        <Grid container spacing={3} size={{ xs: 12, md: 4 }}>
          <form onSubmit={handleSubmit} className={styles.registrationForm}>
            <Card variant="outlined" className={styles.registrationCard}>
              <Box className={styles.registrationTopBoxTitle}>
                <Typography variant="h6" fontWeight="600" component="div">
                  {formData.user
                    ? formData.user.firstname + " " + formData.user.lastname
                    : t("pages.calendar-event.register.form.title")}
                </Typography>
                {/*<IconKeyboardArrowRight className={styles.adminTitleIcon} />*/}
              </Box>
              <Divider />
              <Box className={styles.userFamilyBox}>
                <List className={styles.userFamilyList}>
                  <Box>
                    <Collapse
                      in={!formData.user}
                      timeout="auto"
                      unmountOnExit
                      className={styles.registrationCollapse}
                    >
                      <ListItemButton
                        onClick={() => {
                          const isOpen = extraOpen;
                          setExtraOpen(!isOpen);
                          if (isOpen) {
                            setFormDataEmpty();
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            user
                              ? t(
                                  "pages.calendar-event.register-list.register-extra.title",
                                )
                              : t(
                                  "pages.calendar-event.register-list.register-extra.title-external",
                                )
                          }
                          secondary={
                            user
                              ? t(
                                  "pages.calendar-event.register-list.register-extra.subtitle",
                                )
                              : t(
                                  "pages.calendar-event.register-list.register-extra.subtitle-external",
                                )
                          }
                        />
                        {extraOpen ? <IconExpandLess /> : <IconExpandMore />}
                      </ListItemButton>
                    </Collapse>
                    <Collapse
                      in={extraOpen}
                      timeout="auto"
                      unmountOnExit
                      className={styles.registrationCollapse}
                    >
                      <Box>
                        <Grid container>
                          <Collapse
                            in={!formData.user && !formData.entity}
                            timeout="auto"
                            unmountOnExit
                            className={styles.registrationCollapse}
                          >
                            <>
                              <Grid
                                container
                                spacing={2}
                                className={styles.registrationContent}
                              >
                                <FormGrid size={12}>
                                  <FormLabel htmlFor="firstname" required>
                                    {t("pages.user-join.form.first-name")}
                                  </FormLabel>
                                  <OutlinedInput
                                    id="firstname"
                                    name="firstname"
                                    type="text"
                                    placeholder="Namn"
                                    autoComplete="first name"
                                    required={
                                      !formData.user && !formData.entity
                                    }
                                    size="small"
                                    value={formData.firstname}
                                    onChange={infoChange}
                                    error={
                                      validationErrors &&
                                      validationErrors.entity &&
                                      validationErrors.entity.firstname &&
                                      validationErrors.firstname[0].detail
                                    }
                                  />
                                  {validationErrors &&
                                    validationErrors.entity &&
                                    validationErrors.entity.firstname && (
                                      <FormHelperText error>
                                        {
                                          validationErrors.entity.firstname[0]
                                            .detail
                                        }
                                      </FormHelperText>
                                    )}
                                </FormGrid>
                                <FormGrid size={12}>
                                  <FormLabel htmlFor="lastname" required>
                                    {t("pages.user-join.form.last-name")}
                                  </FormLabel>
                                  <OutlinedInput
                                    id="lastname"
                                    name="lastname"
                                    type="text"
                                    placeholder="Namnsson"
                                    autoComplete="last name"
                                    required={
                                      !formData.user && !formData.entity
                                    }
                                    size="small"
                                    value={formData.lastname}
                                    onChange={infoChange}
                                    error={
                                      validationErrors &&
                                      validationErrors.entity &&
                                      validationErrors.entity.lastname &&
                                      validationErrors.entity.lastname[0].detail
                                    }
                                  />
                                  {validationErrors &&
                                    validationErrors.entity &&
                                    validationErrors.entity.lastname && (
                                      <FormHelperText error>
                                        {
                                          validationErrors.entity.lastname[0]
                                            .detail
                                        }
                                      </FormHelperText>
                                    )}
                                </FormGrid>
                                <FormGrid size={{ xs: 12 }}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        id="isUnderage"
                                        name="isUnderage"
                                        checked={formData.isUnderage}
                                        onChange={() =>
                                          infoChangeCheckbox(
                                            "isUnderage",
                                            !formData.isUnderage,
                                          )
                                        }
                                        className={styles.registrationCheckbox}
                                      />
                                    }
                                    label={t(
                                      "pages.calendar-event.register.form.underaged",
                                    )}
                                  />
                                </FormGrid>
                                <Collapse
                                  in={!formData.isUnderage}
                                  timeout="auto"
                                  unmountOnExit
                                  className={styles.registrationCollapse}
                                >
                                  <Grid container spacing={2}>
                                    <FormGrid size={12}>
                                      <FormLabel htmlFor="email" required>
                                        {t("pages.user-join.form.email")}
                                      </FormLabel>
                                      <OutlinedInput
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="namn@namnsson.se"
                                        autoComplete="email"
                                        required={
                                          !formData.user &&
                                          !formData.entity &&
                                          !formData.isUnderage
                                        }
                                        size="small"
                                        value={formData.email}
                                        onChange={infoChange}
                                        error={
                                          validationErrors &&
                                          validationErrors.entity &&
                                          validationErrors.entity.email &&
                                          validationErrors.entity.email[0]
                                            .detail
                                        }
                                      />
                                      {validationErrors &&
                                        validationErrors.entity &&
                                        validationErrors.entity.email && (
                                          <FormHelperText error>
                                            {
                                              validationErrors.entity.email[0]
                                                .detail
                                            }
                                          </FormHelperText>
                                        )}
                                    </FormGrid>
                                    <FormGrid size={12}>
                                      <FormLabel htmlFor="phone" required>
                                        {t("pages.user-join.form.phone")}
                                      </FormLabel>
                                      <OutlinedInput
                                        id="phone"
                                        name="phone"
                                        type="phone"
                                        placeholder="+4687461000"
                                        autoComplete="phone"
                                        required={
                                          !formData.user &&
                                          !formData.entity &&
                                          !formData.isUnderage
                                        }
                                        size="small"
                                        value={formData.phone}
                                        onChange={infoChange}
                                        error={
                                          validationErrors &&
                                          validationErrors.entity &&
                                          validationErrors.entity.phone &&
                                          validationErrors.entity.phone[0]
                                            .detail
                                        }
                                      />
                                      {validationErrors &&
                                        validationErrors.entity &&
                                        validationErrors.entity.phone && (
                                          <FormHelperText error>
                                            {
                                              validationErrors.entity.phone[0]
                                                .detail
                                            }
                                          </FormHelperText>
                                        )}
                                    </FormGrid>
                                  </Grid>
                                </Collapse>
                                <Collapse
                                  in={formData.isUnderage}
                                  timeout="auto"
                                  unmountOnExit
                                  className={styles.registrationCollapse}
                                >
                                  <Grid container spacing={2}>
                                    <FormGrid size={12}>
                                      <FormLabel htmlFor="birthday">
                                        {t("pages.user-join.form.birthday")}
                                      </FormLabel>
                                      <OutlinedInput
                                        id="birthday"
                                        name="birthday"
                                        type="date"
                                        autoComplete="birthday"
                                        required={
                                          !formData.user &&
                                          !formData.entity &&
                                          formData.isUnderage
                                        }
                                        size="small"
                                        value={formData.birthday}
                                        onChange={infoChange}
                                        error={
                                          validationErrors &&
                                          validationErrors.entity &&
                                          ((validationErrors.entity.birthday &&
                                            validationErrors.entity.birthday[0]
                                              .detail) ||
                                            (validationErrors.entity.email &&
                                              validationErrors.entity.email[0]
                                                .detail))
                                        }
                                      />
                                      {validationErrors &&
                                        validationErrors.entity &&
                                        validationErrors.entity.birthday && (
                                          <FormHelperText error>
                                            {
                                              validationErrors.entity
                                                .birthday[0].detail
                                            }
                                          </FormHelperText>
                                        )}
                                      {validationErrors &&
                                        validationErrors.entity &&
                                        validationErrors.entity.email && (
                                          <FormHelperText error>
                                            {
                                              validationErrors.entity.email[0]
                                                .detail
                                            }
                                          </FormHelperText>
                                        )}
                                    </FormGrid>
                                  </Grid>
                                </Collapse>
                              </Grid>
                              <Divider />
                            </>
                          </Collapse>
                        </Grid>
                        {hasQuestions && (
                          <>
                            <Grid
                              container
                              spacing={2}
                              className={styles.registrationContent}
                            >
                              {event.questions.map((eventQuestion: any) => {
                                const isDisabled =
                                  formData.registration &&
                                  formData.registration.status ===
                                    RegistrationStatus.ACTIVE;
                                const answer =
                                  formData.questions &&
                                  formData.questions[eventQuestion.order];
                                return (
                                  <FormGrid size={12}>
                                    <FormLabel
                                      htmlFor={
                                        "question-" + eventQuestion.order
                                      }
                                      required={eventQuestion.is_required}
                                    >
                                      {eventQuestion.title}
                                    </FormLabel>
                                    {eventQuestion.type ===
                                      EventQuestionType.SHORT && (
                                      <OutlinedInput
                                        id={"question-" + eventQuestion.order}
                                        name={"question-" + eventQuestion.order}
                                        type="text"
                                        size="small"
                                        error={
                                          validationErrors &&
                                          validationErrors[
                                            "question-" + eventQuestion.order
                                          ] &&
                                          validationErrors[
                                            "question-" + eventQuestion.order
                                          ][0].detail
                                        }
                                        value={
                                          answer !== undefined ? answer : ""
                                        }
                                        disabled={isDisabled}
                                        onChange={(e: any) =>
                                          infoChangeQuestion(
                                            eventQuestion.order,
                                            e.target.value,
                                          )
                                        }
                                      />
                                    )}
                                    {eventQuestion.type ===
                                      EventQuestionType.LONG && (
                                      <OutlinedInput
                                        id={"question-" + eventQuestion.order}
                                        name={"question-" + eventQuestion.order}
                                        type="text"
                                        size="small"
                                        error={
                                          validationErrors &&
                                          validationErrors[
                                            "question-" + eventQuestion.order
                                          ] &&
                                          validationErrors[
                                            "question-" + eventQuestion.order
                                          ][0].detail
                                        }
                                        value={
                                          answer !== undefined ? answer : ""
                                        }
                                        disabled={isDisabled}
                                        onChange={(e: any) =>
                                          infoChangeQuestion(
                                            eventQuestion.order,
                                            e.target.value,
                                          )
                                        }
                                      />
                                    )}
                                    {eventQuestion.type ===
                                      EventQuestionType.BOOLEAN && (
                                      <RadioGroup
                                        name={"question-" + eventQuestion.order}
                                      >
                                        <FormControlLabel
                                          value={"yes"}
                                          control={<Radio />}
                                          label={t(
                                            "pages.calendar-event.register.form.yes",
                                          )}
                                          checked={
                                            answer !== undefined && answer
                                          }
                                          disabled={isDisabled}
                                          onChange={() =>
                                            infoChangeQuestion(
                                              eventQuestion.order,
                                              true,
                                            )
                                          }
                                        />
                                        <FormControlLabel
                                          value={"no"}
                                          control={<Radio />}
                                          label={t(
                                            "pages.calendar-event.register.form.no",
                                          )}
                                          checked={
                                            answer !== undefined && !answer
                                          }
                                          disabled={isDisabled}
                                          onChange={() =>
                                            infoChangeQuestion(
                                              eventQuestion.order,
                                              false,
                                            )
                                          }
                                        />
                                      </RadioGroup>
                                    )}
                                    {eventQuestion.type ===
                                      EventQuestionType.CHOICE && (
                                      <RadioGroup
                                        name={"question-" + eventQuestion.order}
                                      >
                                        {eventQuestion.data.choices.ca.map(
                                          (dataChoice: string, ix: number) => (
                                            <FormControlLabel
                                              value={ix}
                                              control={<Radio />}
                                              label={dataChoice}
                                              checked={answer === ix}
                                              disabled={isDisabled}
                                              onChange={() =>
                                                infoChangeQuestion(
                                                  eventQuestion.order,
                                                  ix,
                                                )
                                              }
                                            />
                                          ),
                                        )}
                                      </RadioGroup>
                                    )}
                                    {validationErrors &&
                                      validationErrors.phone && (
                                        <FormHelperText error>
                                          {validationErrors.phone[0].detail}
                                        </FormHelperText>
                                      )}
                                  </FormGrid>
                                );
                              })}
                            </Grid>
                            <Divider />
                          </>
                        )}
                        <Grid
                          container
                          spacing={2}
                          className={styles.registrationContent}
                        >
                          <FormGrid size={12}>
                            <Typography variant="body2" component="span" mb={1}>
                              {t(
                                "pages.calendar-event.register.checkbox-processing",
                              )}{" "}
                              <Link
                                href={ROUTES["policy-privacy"].path}
                                color="secondary"
                                underline="none"
                                target="_blank"
                                className={styles.checkboxInlineLink}
                              >
                                {t(
                                  "pages.calendar-event.register.checkbox-processing-link.title",
                                )}
                                <IconEast className={styles.iconEast} />
                              </Link>
                            </Typography>
                          </FormGrid>
                          <FormGrid size={12}>
                            <Stack
                              direction="row"
                              spacing={2}
                              className={styles.buttons}
                            >
                              <Button
                                variant="contained"
                                type="submit"
                                name="submit"
                                disableElevation
                                disabled={!hasAnsweredAll}
                              >
                                {!formData.registration ||
                                formData.registration.status ===
                                  RegistrationStatus.CANCELLED
                                  ? t(
                                      "pages.calendar-event.register-list.register",
                                    )
                                  : t(
                                      "pages.calendar-event.register-list.change",
                                    )}
                              </Button>
                              {(!formData.registration ||
                                formData.registration.status ===
                                  RegistrationStatus.CANCELLED) && (
                                <Button
                                  variant="contained"
                                  type="button"
                                  color="error"
                                  className={styles.buttonDark}
                                  disableElevation
                                  onClick={() => {
                                    setFormDataEmpty();
                                    setExtraOpen(false);
                                  }}
                                >
                                  {t(
                                    "pages.calendar-event.register-list.cancel",
                                  )}
                                </Button>
                              )}
                              {formData.registration &&
                                formData.registration.status <=
                                  RegistrationStatus.ACTIVE && (
                                  <Button
                                    variant="contained"
                                    type="button"
                                    color="error"
                                    disableElevation
                                    onClick={() => {
                                      handleRegistrationDelete(
                                        formData.registration.id,
                                      );
                                    }}
                                  >
                                    {t(
                                      "pages.calendar-event.register-list.deregister",
                                    )}
                                  </Button>
                                )}
                            </Stack>
                          </FormGrid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </Box>
                </List>
              </Box>
            </Card>
          </form>
        </Grid>

        <Collapse
          in={registrationsRequested && registrationsRequested.length > 0}
          timeout="auto"
          unmountOnExit
          className={styles.registrationCollapse}
        >
          <Grid container spacing={3} justifyContent="center">
            <Stack direction="row" spacing={2} whiteSpace="nowrap">
              <Button
                variant="contained"
                type="submit"
                style={{ width: "auto" }}
                color="primary"
                disableElevation
                onClick={handleRegistrationProcess}
              >
                {t("pages.calendar-event.register.button-pay")}
                {pendingAmount &&
                  " " + pendingAmount.amount + " " + pendingAmount.currency}
              </Button>
            </Stack>
          </Grid>
        </Collapse>
        {validationErrors && validationErrors.throttle && (
          <FormGrid size={{ xs: 12 }}>
            <FormHelperText error className={styles.error}>
              {validationErrors.throttle}
            </FormHelperText>
          </FormGrid>
        )}
      </Grid>
    </>
  );
}
