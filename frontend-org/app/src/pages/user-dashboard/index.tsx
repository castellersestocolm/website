import styles from "./styles.module.css";
import * as React from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import {
  Card,
  Collapse,
  Divider,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import IconEast from "@mui/icons-material/East";
import { useAppContext } from "../../components/AppContext/AppContext";
import {
  apiMembershipList,
  apiPaymentExpenseList,
  apiOrderList,
  apiPaymentList,
  apiUserLogout,
  apiEventList,
  apiActivityProgramCourseRegistrationList,
} from "../../api";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import Grid from "@mui/material/Grid";
import IconCall from "@mui/icons-material/Call";
import IconMail from "@mui/icons-material/Mail";
import IconAccountCircle from "@mui/icons-material/AccountCircle";
import IconExpandMore from "@mui/icons-material/ExpandMore";
import IconExpandLess from "@mui/icons-material/ExpandLess";
import IconCalendarMonth from "@mui/icons-material/CalendarMonth";
import IconEventRepeat from "@mui/icons-material/EventRepeat";
import IconPayment from "@mui/icons-material/Payment";
import IconWorkspaces from "@mui/icons-material/Workspaces";
import IconLanguage from "@mui/icons-material/Language";
import IconReplay from "@mui/icons-material/Replay";
import IconChevronRight from "@mui/icons-material/KeyboardDoubleArrowRight";
import IconHowToReg from "@mui/icons-material/HowToReg";
import PageBase from "../../components/PageBase/PageBase";
import {
  EXPENSE_STATUS_ICON,
  ExpenseStatus,
  getEnumLabel,
  MEMBERSHIP_STATUS_ICON,
  MembershipStatus,
  PAYMENT_STATUS_ICON,
  PaymentStatus,
  PaymentType,
  OrderStatus,
  ORDER_STATUS_ICON,
  EventType,
  RegistrationStatus,
} from "../../enums";
import { capitalizeFirstLetter, lowerFirstLetter } from "../../utils/string";
import IconDowload from "@mui/icons-material/Download";
import Pagination from "@mui/material/Pagination";
import {
  API_EXPENSES_LIST_PAGE_SIZE,
  API_ORDERS_LIST_PAGE_SIZE,
  API_PAYMENTS_LIST_PAGE_SIZE,
  PAYMENT_SWISH_NUMBER,
  API_EVENTS_LIST_PAGE_SIZE,
  API_PROGRAM_COURSE_REGISTRATIONS_LIST_PAGE_SIZE,
} from "../../consts";
import IconButton from "@mui/material/IconButton";
import ImageIconSwish from "../../assets/images/icons/swish.png";

// @ts-ignore
import QRCode from "qrcode";
import { LoaderClip } from "../../components/LoaderClip/LoaderClip";
import FormDashboardEmails from "../../components/FormDashboardEmails/FormDashboardEmails";
import FormDashboardUpdate from "../../components/FormDashboardUpdate/FormDashboardUpdate";
import { dateToString, datetimeToString } from "../../utils/datetime";

const ORG_INFO_EMAIL = process.env.REACT_APP_ORG_INFO_EMAIL;
const BACKEND_BASE_URL = new URL(process.env.REACT_APP_ORG_API_URL).origin;

function UserDashboardPage() {
  const [t, i18n] = useTranslation("common");

  const { setUser } = useAppContext();
  let navigate = useNavigate();

  const { user } = useAppContext();

  function handleLogoutSubmit() {
    apiUserLogout().then((response) => {
      setUser(null);
      navigate(ROUTES.home.path);
    });
  }

  if (user === null) {
    navigate(ROUTES["user-login"].path);
  }

  const [eventsOpen, setEventsOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [paymentsOpen, setPaymentsOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [coursesOpen, setCoursesOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [ordersOpen, setOrdersOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [expensesOpen, setExpensesOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [updateOpen, setUpdateOpen] = React.useState(false);

  const [eventPage, setEventPage] = React.useState(1);
  const [events, setEvents] = React.useState(undefined);
  const [paymentPage, setPaymentPage] = React.useState(1);
  const [payments, setPayments] = React.useState(undefined);
  const [orderPage, setOrderPage] = React.useState(1);
  const [orders, setOrders] = React.useState(undefined);
  const [expensePage, setExpensePage] = React.useState(1);
  const [expenses, setExpenses] = React.useState(undefined);
  const [membership, setMembership] = React.useState(undefined);
  const [programCourseRegistrations, setProgramCourseRegistrations] =
    React.useState(undefined);
  const [paymentSvg, setPaymentSvg] = React.useState(undefined);

  const handlePaymentClick = (paymentId: string) => {
    setPaymentsOpen({
      ...Object.fromEntries(
        Object.entries(paymentsOpen).map(([k, v], i) => [k, false]),
      ),
      [paymentId]: !paymentsOpen[paymentId],
    });
  };

  const handleEventClick = (eventId: string) => {
    setEventsOpen({
      ...Object.fromEntries(
        Object.entries(eventsOpen).map(([k, v], i) => [k, false]),
      ),
      [eventId]: !eventsOpen[eventId],
    });
  };

  const handleCourseClick = (courseId: string) => {
    setCoursesOpen({
      ...Object.fromEntries(
        Object.entries(coursesOpen).map(([k, v], i) => [k, false]),
      ),
      [courseId]: !coursesOpen[courseId],
    });
  };

  const handleOrderClick = (orderId: string) => {
    setOrdersOpen({
      ...Object.fromEntries(
        Object.entries(ordersOpen).map(([k, v], i) => [k, false]),
      ),
      [orderId]: !ordersOpen[orderId],
    });
  };

  const handleExpenseClick = (expenseId: string) => {
    setExpensesOpen({
      ...Object.fromEntries(
        Object.entries(expensesOpen).map(([k, v], i) => [k, false]),
      ),
      [expenseId]: !expensesOpen[expenseId],
    });
  };

  React.useEffect(() => {
    if (user) {
      apiMembershipList().then((response) => {
        if (response.status === 200) {
          // setMemberships(response.data);
          const currentMembership = response.data.results.find(
            (membership: any) => {
              return membership.is_active;
            },
          );
          setMembership(currentMembership);

          if (currentMembership) {
            const membershipText =
              t("swish.payment.membership") +
              " " +
              currentMembership.date_from.slice(0, 4) +
              " - " +
              (user.lastname
                ? user.firstname + " " + user.lastname
                : user.firstname);

            if (currentMembership.status < MembershipStatus.PROCESSING) {
              QRCode.toDataURL(
                "C" +
                  PAYMENT_SWISH_NUMBER.replaceAll(" ", "") +
                  ";" +
                  currentMembership.amount.amount +
                  ";" +
                  membershipText +
                  ";0",
                { width: 500, margin: 0 },
              )
                .then((url: string) => {
                  setPaymentSvg(url);
                })
                .catch((err: any) => {});
            }
          }
        }
      });
    }
  }, [user, i18n.resolvedLanguage, setMembership, t]);

  React.useEffect(() => {
    if (user) {
      // TODO: Missing pagination means if over 10 registrations some aren't visible
      apiActivityProgramCourseRegistrationList(
        undefined,
        API_PROGRAM_COURSE_REGISTRATIONS_LIST_PAGE_SIZE,
      ).then((response) => {
        if (response.status === 200) {
          setProgramCourseRegistrations(response.data);
        }
      });
    }
  }, [user, i18n.resolvedLanguage, setProgramCourseRegistrations]);

  React.useEffect(() => {
    if (user) {
      apiEventList(
        eventPage,
        API_EVENTS_LIST_PAGE_SIZE,
        undefined,
        null,
        undefined,
        undefined,
        undefined,
        [
          EventType.GENERAL,
          EventType.TALK,
          EventType.GATHERING,
          EventType.COURSE,
          EventType.WORKSHOP,
        ],
        true,
        ["-time_from"],
      ).then((response) => {
        if (response.status === 200) {
          setEvents(response.data);
        }
      });
    }
  }, [user, i18n.resolvedLanguage, setEvents, eventPage]);

  React.useEffect(() => {
    if (user) {
      apiPaymentList(paymentPage).then((response) => {
        if (response.status === 200) {
          setPayments(response.data);
        }
      });
    }
  }, [user, i18n.resolvedLanguage, setPayments, paymentPage]);

  React.useEffect(() => {
    if (user) {
      apiOrderList(orderPage).then((response) => {
        if (response.status === 200) {
          setOrders(response.data);
        }
      });
    }
  }, [user, i18n.resolvedLanguage, setOrders, orderPage]);

  React.useEffect(() => {
    if (user) {
      apiPaymentExpenseList(expensePage).then((response) => {
        if (response.status === 200) {
          setExpenses(response.data);
        }
      });
    }
  }, [user, i18n.resolvedLanguage, setExpenses, expensePage]);

  const contentSidebarProfile = user && (
    <Grid>
      <Card variant="outlined">
        <Box className={styles.userTopBox}>
          <Typography variant="h6" fontWeight="600" component="div">
            {t("pages.user-dashboard.section.profile.title")}
          </Typography>
        </Box>
        <Divider />
        <Box className={styles.userDetailsBox}>
          <List dense={true} className={styles.userList}>
            <ListItem>
              <ListItemIcon>
                <IconAccountCircle />
              </ListItemIcon>
              <ListItemText
                primary={
                  user.lastname
                    ? user.firstname + " " + user.lastname
                    : user.firstname
                }
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <IconMail />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Link
                    color="textPrimary"
                    underline="none"
                    href={"mailto:" + user.email}
                  >
                    {user.email}
                  </Link>
                }
              />
            </ListItem>
            {user.phone && (
              <ListItem>
                <ListItemIcon>
                  <IconCall />
                </ListItemIcon>
                <ListItemText primary={user.phone} />
              </ListItem>
            )}
            {user.preferred_language && (
              <ListItem>
                <ListItemIcon>
                  <IconLanguage />
                </ListItemIcon>
                <ListItemText
                  primary={getEnumLabel(t, "language", user.preferred_language)}
                />
              </ListItem>
            )}
          </List>
        </Box>
        <Divider />
        <Box>
          <ListItemButton onClick={() => setUpdateOpen(!updateOpen)}>
            <ListItemText
              primary={t("pages.user-details.update.title")}
              secondary={t("pages.user-details.update.subtitle")}
            />
            {updateOpen ? <IconExpandLess /> : <IconExpandMore />}
          </ListItemButton>
          <Collapse in={updateOpen} timeout="auto" unmountOnExit>
            <Box className={styles.userFamilyMemberUpdate}>
              <FormDashboardUpdate />
            </Box>
          </Collapse>
        </Box>
        <Divider />
        <Box className={styles.userLogoutBox}>
          <Link
            color="secondary"
            underline="none"
            component="button"
            onClick={handleLogoutSubmit}
            className={styles.link}
          >
            {t("pages.user-dashboard.link-logout")}
            <IconEast className={styles.iconEast} />
          </Link>
        </Box>
      </Card>
    </Grid>
  );

  const contentSidebarEmails = user &&
    user.emails &&
    user.emails.filter((userEmail: any) => userEmail.email !== user.email)
      .length > 0 && (
      <Grid>
        <Card variant="outlined">
          <Box className={styles.userTopBox}>
            <Typography variant="h6" fontWeight="600" component="div">
              {t("pages.user-dashboard.section.emails.title")}
            </Typography>
          </Box>
          <Divider />
          <FormDashboardEmails />

          <Box className={styles.userMembershipInfoBox}>
            <Typography variant="body2" component="span">
              {t("pages.user-dashboard.section.emails.description") + " "}
              <Link color="textSecondary" href={"mailto:" + ORG_INFO_EMAIL}>
                {ORG_INFO_EMAIL}
              </Link>
              {"."}
            </Typography>
          </Box>
        </Card>
      </Grid>
    );

  const programCourses =
    programCourseRegistrations &&
    programCourseRegistrations.results.length > 0 &&
    Object.values(
      Object.fromEntries(
        programCourseRegistrations.results
          .filter(
            (programCourseRegistration: any) =>
              new Date(programCourseRegistration.course.date_to) >= new Date(),
          )
          .map((programCourseRegistration: any) => [
            programCourseRegistration.course.id,
            programCourseRegistration.course,
          ]),
      ),
    );

  const contentSidebarMembership = user && (
    <Grid>
      {membership && (
        <Card variant="outlined">
          <Box className={styles.userTopBox}>
            <Typography variant="h6" fontWeight="600" component="div">
              {membership
                ? t("pages.user-dashboard.section.membership.title")
                : t("pages.user-dashboard.section.membership-renew.title")}
            </Typography>
          </Box>
          <Divider />
          {membership && (
            <>
              <Box className={styles.userDetailsBox}>
                <List dense={true} className={styles.userList}>
                  <ListItem>
                    <ListItemIcon>
                      {MEMBERSHIP_STATUS_ICON[membership.status]}
                    </ListItemIcon>
                    <ListItemText
                      primary={getEnumLabel(
                        t,
                        "membership-status",
                        membership.status,
                      )}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <IconPayment />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        membership.amount.amount +
                        " " +
                        membership.amount.currency
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <IconWorkspaces />
                    </ListItemIcon>
                    <ListItemText
                      primary={membership.modules.map(
                        (membershipModule: any) => {
                          return (
                            <span className={styles.dashboardMembershipModule}>
                              {getEnumLabel(
                                t,
                                "module",
                                membershipModule.module,
                              )}
                            </span>
                          );
                        },
                      )}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <IconCalendarMonth />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        datetimeToString(
                          i18n.resolvedLanguage,
                          membership.date_from,
                        ) +
                        " → " +
                        datetimeToString(
                          i18n.resolvedLanguage,
                          membership.date_to,
                        )
                      }
                    />
                  </ListItem>
                  {membership.status >= MembershipStatus.ACTIVE && (
                    <ListItem>
                      <ListItemIcon>
                        <IconEventRepeat />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          membership.can_renew
                            ? t(
                                "pages.user-dashboard.section.membership.renew-now",
                              ) +
                              " " +
                              membership.date_to
                            : t(
                                "pages.user-dashboard.section.membership.renew-date",
                              ) +
                              " " +
                              membership.date_renewal
                        }
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
              {membership.status < MembershipStatus.PROCESSING && (
                <>
                  <Divider />
                  <Box className={styles.userPaymentBox}>
                    <Typography variant="body1" fontWeight={600}>
                      {t(
                        "pages.user-dashboard.section.membership.payment-title",
                      )}
                    </Typography>
                    <List dense className={styles.userList}>
                      {t("pages.user-dashboard.section.membership.payment-list")
                        .split("\n")
                        .map((paymentText: string, ix: number) => {
                          return (
                            <ListItem key={ix}>
                              <ListItemIcon>
                                <IconChevronRight />
                              </ListItemIcon>
                              <ListItemText primary={paymentText} />
                            </ListItem>
                          );
                        })}
                    </List>
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
                  </Box>
                </>
              )}
              <Divider />
            </>
          )}
          {programCourses && (
            <>
              <List className={styles.userFamilyList}>
                {programCourses.map(
                  (programCourse: any, i: number, row: any) => (
                    <Box key={programCourse.id}>
                      <ListItemButton
                        onClick={() => handleCourseClick(programCourse.id)}
                        dense
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body1">
                              {programCourse.program.name}
                            </Typography>
                          }
                          secondary={
                            dateToString(
                              i18n.resolvedLanguage,
                              programCourse.date_from,
                            ) +
                            " → " +
                            dateToString(
                              i18n.resolvedLanguage,
                              programCourse.date_to,
                            )
                          }
                        />
                        {coursesOpen[programCourse.id] ? (
                          <IconExpandLess />
                        ) : (
                          <IconExpandMore />
                        )}
                      </ListItemButton>
                      <Collapse
                        in={coursesOpen[programCourse.id]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <List className={styles.userFamilyList}>
                          {programCourseRegistrations &&
                            programCourseRegistrations.results
                              .filter(
                                (programCourseRegistration: any) =>
                                  programCourseRegistration.course.id ===
                                  programCourse.id,
                              )
                              .map(
                                (
                                  programCourseRegistration: any,
                                  i: number,
                                  row: any,
                                ) => (
                                  <Box key={programCourseRegistration.id}>
                                    <ListItemButton disableTouchRipple dense>
                                      <ListItemText
                                        primary={
                                          programCourseRegistration.entity
                                            .lastname
                                            ? programCourseRegistration.entity
                                                .firstname +
                                              " " +
                                              programCourseRegistration.entity
                                                .lastname
                                            : programCourseRegistration.entity
                                                .firstname
                                        }
                                      />
                                      {programCourseRegistration.amount && (
                                        <Typography
                                          variant="body2"
                                          component="span"
                                        >
                                          {
                                            programCourseRegistration.amount
                                              .amount
                                          }{" "}
                                          {
                                            programCourseRegistration.amount
                                              .currency
                                          }
                                        </Typography>
                                      )}
                                    </ListItemButton>
                                  </Box>
                                ),
                              )}
                        </List>
                      </Collapse>

                      {i + 1 < row.length && <Divider />}
                    </Box>
                  ),
                )}
              </List>
              <Divider />
            </>
          )}
          <Box className={styles.userMembershipInfoBox}>
            <Typography variant="body2" component="span">
              {t("pages.user-dashboard.section.membership.description") + " "}
              <Link color="textSecondary" href={"mailto:" + ORG_INFO_EMAIL}>
                {ORG_INFO_EMAIL}
              </Link>
              {"."}
            </Typography>
          </Box>
        </Card>
      )}
    </Grid>
  );

  const content = user && (
    <Grid container spacing={4} className={styles.dashboardGrid}>
      <Grid
        container
        size={{ xs: 12, md: 8 }}
        order={{ xs: 2, md: 1 }}
        spacing={4}
        direction="column"
      >
        <Grid
          container
          size={12}
          display={{ xs: "flex", md: "none" }}
          spacing={4}
          direction="column"
        >
          {contentSidebarProfile}
          {contentSidebarEmails}
          {contentSidebarMembership}
        </Grid>

        <Grid>
          <Grid container spacing={2} direction="column">
            <Card variant="outlined">
              <Box className={styles.userTopBox}>
                <Typography variant="h6" fontWeight="600" component="div">
                  {t("pages.user-dashboard.section.registrations.title")}
                </Typography>
              </Box>
              <Divider />

              {events ? (
                <Box className={styles.userFamilyBox}>
                  {events.results.length > 0 ? (
                    <List className={styles.userFamilyList}>
                      {events.results.map((event: any, i: number, row: any) => {
                        return (
                          <Box key={event.id}>
                            <ListItemButton
                              onClick={() => handleEventClick(event.id)}
                              disableTouchRipple={
                                !event.registrations ||
                                !(event.registrations.length > 0)
                              }
                              dense
                            >
                              <ListItemIcon>
                                <IconHowToReg />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  event.title +
                                  " — " +
                                  datetimeToString(
                                    i18n.resolvedLanguage,
                                    event.time_from,
                                  )
                                }
                                secondary={
                                  event.registrations.filter(
                                    (registration: any) =>
                                      registration.status ===
                                      RegistrationStatus.ACTIVE,
                                  ).length > 0
                                    ? t(
                                        "pages.user-registrations.registration.attending-list",
                                      ) +
                                      ": " +
                                      event.registrations
                                        .map((registration: any) =>
                                          registration.user.lastname
                                            ? registration.user.firstname +
                                              " " +
                                              registration.user.lastname
                                            : registration.user.firstname,
                                        )
                                        .join(", ")
                                    : t(
                                        "pages.user-registrations.registration.attending-empty",
                                      )
                                }
                              />
                              {event.registrations &&
                                event.registrations.length > 0 &&
                                (eventsOpen[event.id] ? (
                                  <IconExpandLess />
                                ) : (
                                  <IconExpandMore />
                                ))}
                            </ListItemButton>
                            {event.registrations &&
                              event.registrations.length > 0 && (
                                <Collapse
                                  in={eventsOpen[event.id]}
                                  timeout="auto"
                                  unmountOnExit
                                >
                                  <List className={styles.userFamilyList}>
                                    {event.registrations.map(
                                      (
                                        registration: any,
                                        i: number,
                                        row: any,
                                      ) => (
                                        <Box key={registration.id}>
                                          <ListItemButton
                                            disableTouchRipple
                                            dense
                                          >
                                            <ListItemText
                                              primary={
                                                registration.entity.lastname
                                                  ? registration.entity
                                                      .firstname +
                                                    " " +
                                                    registration.entity.lastname
                                                  : registration.entity
                                                      .firstname
                                              }
                                            />
                                            {registration.amount && (
                                              <Typography
                                                variant="body2"
                                                component="span"
                                              >
                                                {registration.amount.amount}{" "}
                                                {registration.amount.currency}
                                              </Typography>
                                            )}
                                          </ListItemButton>
                                        </Box>
                                      ),
                                    )}
                                  </List>
                                </Collapse>
                              )}
                            {i + 1 < row.length && <Divider />}
                          </Box>
                        );
                      })}
                    </List>
                  ) : (
                    <Box className={styles.userFamilyEmpty}>
                      <Typography component="div">
                        {t("pages.user-dashboard.section.registrations.empty")}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box className={styles.loader}>
                  <LoaderClip />
                </Box>
              )}
            </Card>
            {events &&
              events.results.length > 0 &&
              (eventPage !== 1 || events.count > events.results.length) && (
                <Stack alignItems="center">
                  <Pagination
                    count={Math.ceil(events.count / API_EVENTS_LIST_PAGE_SIZE)}
                    onChange={(e: any, value: number) => setEventPage(value)}
                  />
                </Stack>
              )}
          </Grid>
        </Grid>

        <Grid>
          <Grid container spacing={2} direction="column">
            <Card variant="outlined">
              <Box className={styles.userTopBox}>
                <Typography variant="h6" fontWeight="600" component="div">
                  {t("pages.user-dashboard.section.payments.title")}
                </Typography>
              </Box>
              <Divider />

              {payments ? (
                <Box className={styles.userFamilyBox}>
                  {payments.results.length > 0 ? (
                    <List className={styles.userFamilyList}>
                      {payments.results.map(
                        (payment: any, i: number, row: any) => (
                          <Box key={payment.id}>
                            <ListItemButton
                              onClick={() => handlePaymentClick(payment.id)}
                              disableTouchRipple={
                                !payment.lines || !(payment.lines.length > 1)
                              }
                              dense
                            >
                              <ListItemIcon>
                                {PAYMENT_STATUS_ICON[payment.status]}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <>
                                    <Typography
                                      variant="body2"
                                      component="span"
                                    >
                                      {payment.type === PaymentType.CREDIT &&
                                        t(
                                          "pages.user-payments.payment.refund",
                                        ) + " — "}
                                      {payment.description}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="textSecondary"
                                      component="span"
                                    >
                                      {" — "}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color={
                                        payment.status === PaymentStatus.PENDING
                                          ? "error"
                                          : payment.status ===
                                              PaymentStatus.PROCESSING
                                            ? "secondary"
                                            : "success"
                                      }
                                      component="span"
                                    >
                                      {Math.abs(payment.amount.amount)}{" "}
                                      {payment.amount.currency}
                                      {payment.type === PaymentType.CREDIT && (
                                        <>
                                          {" "}
                                          <IconReplay
                                            fontSize="inherit"
                                            className={styles.paymentRefundIcon}
                                          />
                                        </>
                                      )}
                                    </Typography>
                                  </>
                                }
                                secondary={
                                  getEnumLabel(
                                    t,
                                    "payment-status",
                                    payment.status,
                                  ) +
                                  " " +
                                  (payment.status >= PaymentStatus.COMPLETED
                                    ? t("pages.user-payments.payment.date-done")
                                    : t(
                                        "pages.user-payments.payment.date-doing",
                                      )) +
                                  " " +
                                  dateToString(
                                    i18n.resolvedLanguage,
                                    payment.transaction
                                      ? payment.transaction.date_accounting
                                      : payment.logs && payment.logs.length > 0
                                        ? payment.logs[0].created_at
                                        : payment.created_at,
                                  )
                                }
                              />
                              {payment.lines &&
                                payment.lines.length > 1 &&
                                (paymentsOpen[payment.id] ? (
                                  <IconExpandLess />
                                ) : (
                                  <IconExpandMore />
                                ))}
                            </ListItemButton>
                            {payment.lines && payment.lines.length > 1 && (
                              <Collapse
                                in={paymentsOpen[payment.id]}
                                timeout="auto"
                                unmountOnExit
                              >
                                <List className={styles.userFamilyList}>
                                  {payment.lines.map(
                                    (paymentLine: any, i: number, row: any) => (
                                      <Box key={paymentLine.id}>
                                        <ListItemButton
                                          disableTouchRipple
                                          dense
                                        >
                                          <ListItemText
                                            primary={paymentLine.description}
                                          />
                                          <Typography
                                            variant="body2"
                                            component="span"
                                          >
                                            {paymentLine.amount.amount}{" "}
                                            {paymentLine.amount.currency}
                                          </Typography>
                                        </ListItemButton>
                                      </Box>
                                    ),
                                  )}
                                </List>
                              </Collapse>
                            )}

                            {i + 1 < row.length && <Divider />}
                          </Box>
                        ),
                      )}
                    </List>
                  ) : (
                    <Box className={styles.userFamilyEmpty}>
                      <Typography component="div">
                        {t("pages.user-dashboard.section.payments.empty")}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box className={styles.loader}>
                  <LoaderClip />
                </Box>
              )}
            </Card>
            {payments &&
              payments.results.length > 0 &&
              (paymentPage !== 1 ||
                payments.count > payments.results.length) && (
                <Stack alignItems="center">
                  <Pagination
                    count={Math.ceil(
                      payments.count / API_PAYMENTS_LIST_PAGE_SIZE,
                    )}
                    onChange={(e: any, value: number) => setPaymentPage(value)}
                  />
                </Stack>
              )}
          </Grid>
        </Grid>

        <Grid>
          <Grid container spacing={2} direction="column">
            <Card variant="outlined">
              <Box className={styles.userTopBox}>
                <Typography variant="h6" fontWeight="600" component="div">
                  {t("pages.user-dashboard.section.orders.title")}
                </Typography>
              </Box>
              <Divider />

              {orders ? (
                <Box className={styles.userFamilyBox}>
                  {orders.results.length > 0 ? (
                    <List className={styles.userFamilyList}>
                      {orders.results
                        .filter(
                          (order: any) =>
                            (order.products && order.products.length > 0) ||
                            (order.registrations &&
                              order.registrations.length > 0),
                        )
                        .map((order: any, i: number, row: any) => (
                          <Box key={order.id}>
                            <ListItemButton
                              onClick={() => handleOrderClick(order.id)}
                              dense
                            >
                              <ListItemIcon>
                                {ORDER_STATUS_ICON[order.status]}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <>
                                    <Typography
                                      variant="body2"
                                      component="span"
                                    >
                                      {"#"}
                                      {order.reference}
                                      {" — "}
                                      {order.products &&
                                      order.products.length > 0
                                        ? capitalizeFirstLetter(
                                            Array.from(
                                              new Set(
                                                order.products.map(
                                                  (orderProduct: any) =>
                                                    lowerFirstLetter(
                                                      orderProduct.size.product
                                                        .name,
                                                    ),
                                                ),
                                              ),
                                            ).join(", "),
                                          )
                                        : Array.from(
                                            new Set(
                                              order.registrations.map(
                                                (orderRegistration: any) =>
                                                  orderRegistration.registration
                                                    .event.title,
                                              ),
                                            ),
                                          ).join(", ")}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="textSecondary"
                                      component="span"
                                    >
                                      {" — "}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color={
                                        order.status === OrderStatus.CREATED
                                          ? "error"
                                          : order.status ===
                                              OrderStatus.PROCESSING
                                            ? "secondary"
                                            : "success"
                                      }
                                      component="span"
                                    >
                                      {order.amount.amount}{" "}
                                      {order.amount.currency}
                                    </Typography>
                                  </>
                                }
                                secondary={
                                  getEnumLabel(
                                    t,
                                    "order-status",
                                    order.status,
                                  ) +
                                  " " +
                                  (order.status >= OrderStatus.COMPLETED ||
                                  order.status === OrderStatus.REQUESTED
                                    ? t("pages.user-payments.payment.date-done")
                                    : t(
                                        "pages.user-payments.payment.date-doing",
                                      )) +
                                  " " +
                                  dateToString(
                                    i18n.resolvedLanguage,
                                    order.logs && order.logs.length > 0
                                      ? order.logs[0].created_at
                                      : order.created_at,
                                  )
                                }
                              />
                              {ordersOpen[order.id] ? (
                                <IconExpandLess />
                              ) : (
                                <IconExpandMore />
                              )}
                            </ListItemButton>
                            <Collapse
                              in={ordersOpen[order.id]}
                              timeout="auto"
                              unmountOnExit
                            >
                              <List className={styles.userFamilyList}>
                                {order.products &&
                                  order.products.length > 0 &&
                                  order.products.map(
                                    (
                                      orderProduct: any,
                                      i: number,
                                      row: any,
                                    ) => (
                                      <Box key={orderProduct.id}>
                                        <ListItemButton
                                          disableTouchRipple
                                          dense
                                        >
                                          <ListItemIcon
                                            className={styles.eventCardIcon}
                                          >
                                            {orderProduct.size.product.images &&
                                              orderProduct.size.product.images
                                                .length > 0 && (
                                                <img
                                                  src={
                                                    BACKEND_BASE_URL +
                                                    orderProduct.size.product
                                                      .images[0].picture
                                                  }
                                                  alt={
                                                    orderProduct.size.product
                                                      .name
                                                  }
                                                  className={
                                                    styles.eventCardImage
                                                  }
                                                />
                                              )}
                                          </ListItemIcon>
                                          <ListItemText
                                            primary={
                                              orderProduct.quantity +
                                              " x " +
                                              orderProduct.size.product.name +
                                              " — " +
                                              orderProduct.size.size
                                            }
                                          />
                                          <Typography
                                            variant="body2"
                                            component="span"
                                          >
                                            {orderProduct.amount.amount}{" "}
                                            {orderProduct.amount.currency}
                                          </Typography>
                                        </ListItemButton>
                                      </Box>
                                    ),
                                  )}
                                {order.registrations &&
                                  order.registrations.length > 0 &&
                                  order.registrations.map(
                                    (
                                      orderRegistration: any,
                                      i: number,
                                      row: any,
                                    ) => (
                                      <Box key={orderRegistration.id}>
                                        <ListItemButton
                                          disableTouchRipple
                                          dense
                                        >
                                          <ListItemText
                                            primary={
                                              orderRegistration.registration
                                                .entity.lastname
                                                ? orderRegistration.registration
                                                    .entity.firstname +
                                                  " " +
                                                  orderRegistration.registration
                                                    .entity.lastname
                                                : orderRegistration.registration
                                                    .entity.firstname
                                            }
                                          />
                                          <Typography
                                            variant="body2"
                                            component="span"
                                          >
                                            {orderRegistration.amount.amount}{" "}
                                            {orderRegistration.amount.currency}
                                          </Typography>
                                        </ListItemButton>
                                      </Box>
                                    ),
                                  )}
                              </List>
                            </Collapse>

                            {i + 1 < row.length && <Divider />}
                          </Box>
                        ))}
                    </List>
                  ) : (
                    <Box className={styles.userFamilyEmpty}>
                      <Typography component="div">
                        {t("pages.user-dashboard.section.orders.empty")}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box className={styles.loader}>
                  <LoaderClip />
                </Box>
              )}
            </Card>
            {orders &&
              orders.results.length > 0 &&
              (orderPage !== 1 || orders.count > orders.results.length) && (
                <Stack alignItems="center">
                  <Pagination
                    count={Math.ceil(orders.count / API_ORDERS_LIST_PAGE_SIZE)}
                    onChange={(e: any, value: number) => setOrderPage(value)}
                  />
                </Stack>
              )}
          </Grid>
        </Grid>

        <Grid>
          <Grid container spacing={2} direction="column">
            <Card variant="outlined">
              <Box className={styles.userTopBox}>
                <Typography variant="h6" fontWeight="600" component="div">
                  {t("pages.user-dashboard.section.expenses.title")}
                </Typography>
              </Box>
              <Divider />

              {expenses ? (
                <Box className={styles.userFamilyBox}>
                  {expenses.results.length > 0 ? (
                    <List className={styles.userFamilyList}>
                      {expenses.results.map(
                        (expense: any, i: number, row: any) => {
                          return (
                            <Box key={expense.id}>
                              <ListItemButton
                                onClick={() => handleExpenseClick(expense.id)}
                                disableTouchRipple={
                                  !expense.receipts ||
                                  !(expense.receipts.length > 0)
                                }
                                dense
                              >
                                <ListItemIcon>
                                  {expense.file ? (
                                    <IconButton
                                      className={styles.expenseFileIcon}
                                      href={
                                        new URL(expense.file, BACKEND_BASE_URL)
                                          .href
                                      }
                                      target="_blank"
                                    >
                                      <IconDowload />
                                    </IconButton>
                                  ) : (
                                    EXPENSE_STATUS_ICON[expense.status]
                                  )}
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <>
                                      <Typography
                                        variant="body2"
                                        component="span"
                                      >
                                        {expense.description}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        component="span"
                                      >
                                        {" — "}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color={
                                          expense.status ===
                                          PaymentStatus.PENDING
                                            ? "error"
                                            : expense.status ===
                                                PaymentStatus.PROCESSING
                                              ? "secondary"
                                              : "success"
                                        }
                                        component="span"
                                      >
                                        {expense.amount.amount}{" "}
                                        {expense.amount.currency}
                                      </Typography>
                                    </>
                                  }
                                  secondary={
                                    getEnumLabel(
                                      t,
                                      "expense-status",
                                      expense.status,
                                    ) +
                                    " " +
                                    (expense.status >= ExpenseStatus.APPROVED
                                      ? t(
                                          "pages.user-payments.payment.date-done",
                                        )
                                      : t(
                                          "pages.user-payments.payment.date-doing",
                                        )) +
                                    " " +
                                    dateToString(
                                      i18n.resolvedLanguage,
                                      expense.logs && expense.logs.length > 0
                                        ? expense.logs[0].created_at
                                        : expense.created_at,
                                    )
                                  }
                                />
                                {expense.receipts &&
                                  expense.receipts.length > 0 &&
                                  (expensesOpen[expense.id] ? (
                                    <IconExpandLess />
                                  ) : (
                                    <IconExpandMore />
                                  ))}
                              </ListItemButton>
                              {expense.receipts &&
                                expense.receipts.length > 0 && (
                                  <Collapse
                                    in={expensesOpen[expense.id]}
                                    timeout="auto"
                                    unmountOnExit
                                  >
                                    <List className={styles.userFamilyList}>
                                      {expense.receipts.map(
                                        (
                                          expenseReceipt: any,
                                          i: number,
                                          row: any,
                                        ) => {
                                          return (
                                            <Box key={expenseReceipt.id}>
                                              <ListItemButton
                                                disableTouchRipple
                                                dense
                                              >
                                                <ListItemText
                                                  primary={
                                                    expenseReceipt.description
                                                  }
                                                />
                                                <Typography
                                                  variant="body2"
                                                  component="span"
                                                >
                                                  {expenseReceipt.amount.amount}{" "}
                                                  {
                                                    expenseReceipt.amount
                                                      .currency
                                                  }
                                                </Typography>
                                                {expenseReceipt.file && (
                                                  <IconButton
                                                    className={
                                                      styles.receiptFileIcon
                                                    }
                                                    href={
                                                      new URL(
                                                        expenseReceipt.file,
                                                        BACKEND_BASE_URL,
                                                      ).href
                                                    }
                                                    target="_blank"
                                                  >
                                                    <IconDowload />
                                                  </IconButton>
                                                )}
                                              </ListItemButton>
                                            </Box>
                                          );
                                        },
                                      )}
                                    </List>
                                  </Collapse>
                                )}

                              {i + 1 < row.length && <Divider />}
                            </Box>
                          );
                        },
                      )}
                    </List>
                  ) : (
                    <Box className={styles.userFamilyEmpty}>
                      <Typography component="div">
                        {t("pages.user-dashboard.section.expenses.empty")}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box className={styles.loader}>
                  <LoaderClip />
                </Box>
              )}
            </Card>
            {expenses &&
              expenses.results.length > 0 &&
              (expensePage !== 1 ||
                expenses.count > expenses.results.length) && (
                <Stack alignItems="center">
                  <Pagination
                    count={Math.ceil(
                      expenses.count / API_EXPENSES_LIST_PAGE_SIZE,
                    )}
                    onChange={(e: any, value: number) => setExpensePage(value)}
                  />
                </Stack>
              )}
          </Grid>
        </Grid>
      </Grid>
      <Grid
        container
        size={4}
        order={2}
        display={{ xs: "none", md: "flex" }}
        spacing={4}
        direction="column"
      >
        {contentSidebarProfile}
        {contentSidebarEmails}
        {contentSidebarMembership}
      </Grid>
    </Grid>
  );

  return (
    <PageBase
      title={t("pages.user-dashboard.title")}
      content={content}
      finishedRegistration={true}
      loading={!user}
    />
  );
}

export default UserDashboardPage;
