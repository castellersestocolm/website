import styles from "./styles.module.css";
import * as React from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import {
  Button,
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
  apiEventList,
  apiMembershipList,
  apiMembershipRenewCreate,
  apiMembershipRenewList,
  apiPaymentExpenseList,
  apiOrderList,
  apiPaymentList,
  apiTowersCastleList,
  apiUserFamilyMemberRequestAccept,
  apiUserFamilyMemberRequestCancel,
  apiUserFamilyMemberRequestList,
  apiUserFamilyMemberRequestReceivedList,
  apiUserFamilyMemberRequestReject,
  apiUserLogout,
  apiUserMe,
} from "../../api";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import Grid from "@mui/material/Grid";
import IconCall from "@mui/icons-material/Call";
import IconMail from "@mui/icons-material/Mail";
import IconHeight from "@mui/icons-material/Height";
import IconAccountCircle from "@mui/icons-material/AccountCircle";
import IconExpandMore from "@mui/icons-material/ExpandMore";
import IconExpandLess from "@mui/icons-material/ExpandLess";
import IconCalendarMonth from "@mui/icons-material/CalendarMonth";
import IconEventRepeat from "@mui/icons-material/EventRepeat";
import IconPayment from "@mui/icons-material/Payment";
import IconWorkspaces from "@mui/icons-material/Workspaces";
import IconPersonAdd from "@mui/icons-material/PersonAdd";
import IconPersonSearch from "@mui/icons-material/PersonSearch";
import IconLanguage from "@mui/icons-material/Language";
import IconReplay from "@mui/icons-material/Replay";
import IconChevronRight from "@mui/icons-material/KeyboardDoubleArrowRight";
import FormMemberUpdate from "../../components/FormMemberUpdate/FormMemberUpdate";
import FormMemberCreate from "../../components/FormMemberCreate/FormMemberCreate";
import PageBase from "../../components/PageBase/PageBase";
import {
  EventType,
  EXPENSE_STATUS_ICON,
  ExpenseStatus,
  FamilyMemberRequestStatus,
  getEnumLabel,
  MEMBERSHIP_STATUS_ICON,
  MembershipStatus,
  PAYMENT_STATUS_ICON,
  PaymentStatus,
  PaymentType,
  PermissionLevel,
  RegistrationStatus,
  OrderStatus,
  ORDER_STATUS_ICON,
} from "../../enums";
import FormMemberRequest from "../../components/FormMemberRequest/FormMemberRequest";
import FormDashboardUpdate from "../../components/FormDashboardUpdate/FormDashboardUpdate";
import markdown from "@wcj/markdown-to-html";
import FormCalendarRegistrationCreate from "../../components/FormCalendarRegistrationCreate/FormCalendarRegistrationCreate";
import { capitalizeFirstLetter, lowerFirstLetter } from "../../utils/string";
import IconAttachFile from "@mui/icons-material/AttachFile";
import IconDowload from "@mui/icons-material/Download";
import Pagination from "@mui/material/Pagination";
import {
  API_EXPENSES_LIST_PAGE_SIZE,
  API_ORDERS_LIST_PAGE_SIZE,
  API_PAYMENTS_LIST_PAGE_SIZE,
  PAYMENT_SWISH_NUMBER,
} from "../../consts";
import IconButton from "@mui/material/IconButton";
import ImageIconSwish from "../../assets/images/icons/swish.png";

// @ts-ignore
import QRCode from "qrcode";
import { get_event_icon, getEventUsers } from "../../utils/event";
import { LoaderClip } from "../../components/LoaderClip/LoaderClip";

const ORG_INFO_EMAIL = process.env.REACT_APP_ORG_INFO_EMAIL;
const BACKEND_BASE_URL = new URL(process.env.REACT_APP_API_BASE_URL).origin;

function UserDashboardPage() {
  const [t, i18n] = useTranslation("common");

  const { setUser } = useAppContext();
  let navigate = useNavigate();

  const {
    user,
    setMessages,
    familyMemberRequests,
    setFamilyMemberRequests,
    familyMemberRequestsReceived,
    setFamilyMemberRequestsReceived,
    rehearsal,
    setRehearsal,
  } = useAppContext();

  function handleLogoutSubmit() {
    apiUserLogout().then((response) => {
      setUser(null);
      navigate(ROUTES.home.path);
    });
  }

  function handleAdminSubmit() {
    navigate(ROUTES.admin.path);
  }

  if (user === null) {
    navigate(ROUTES["user-login"].path);
  }

  const [familyMembersOpen, setFamilyMembersOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [paymentsOpen, setPaymentsOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [ordersOpen, setOrdersOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [expensesOpen, setExpensesOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [updateOpen, setUpdateOpen] = React.useState(false);
  const [attendanceOpen, setAttendanceOpen] = React.useState(false);
  const [lastChangedAttendance, setLastChangedAttendance] = React.useState(
    Date.now(),
  );

  // const [memberships, setMemberships] = React.useState(undefined);
  const [paymentPage, setPaymentPage] = React.useState(1);
  const [payments, setPayments] = React.useState(undefined);
  const [orderPage, setOrderPage] = React.useState(1);
  const [orders, setOrders] = React.useState(undefined);
  const [expensePage, setExpensePage] = React.useState(1);
  const [expenses, setExpenses] = React.useState(undefined);
  const [membership, setMembership] = React.useState(undefined);
  const [membershipRenewOptions, setMembershipRenewOptions] =
    React.useState(undefined);
  const [castles, setCastles] = React.useState(undefined);
  const [paymentSvg, setPaymentSvg] = React.useState(undefined);

  const handleFamilyClick = (memberId: string) => {
    setFamilyMembersOpen({
      ...Object.fromEntries(
        Object.entries(familyMembersOpen).map(([k, v], i) => [k, false]),
      ),
      [memberId]: !familyMembersOpen[memberId],
    });
  };

  const handlePaymentClick = (paymentId: string) => {
    setPaymentsOpen({
      ...Object.fromEntries(
        Object.entries(paymentsOpen).map(([k, v], i) => [k, false]),
      ),
      [paymentId]: !paymentsOpen[paymentId],
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

          if (!currentMembership || currentMembership.can_renew) {
            apiMembershipRenewList().then((response) => {
              if (response.status === 200) {
                setMembershipRenewOptions(response.data);
              }
            });
          }
        }
      });
      apiUserFamilyMemberRequestList().then((response) => {
        if (response.status === 200) {
          setFamilyMemberRequests(
            response.data.filter((request: any) => {
              return request.status === FamilyMemberRequestStatus.REQUESTED;
            }),
          );
        }
      });
      apiUserFamilyMemberRequestReceivedList().then((response) => {
        if (response.status === 200) {
          setFamilyMemberRequestsReceived(
            response.data.filter((request: any) => {
              return request.status === FamilyMemberRequestStatus.REQUESTED;
            }),
          );
        }
      });
    }
  }, [
    user,
    i18n.resolvedLanguage,
    setFamilyMemberRequests,
    setFamilyMemberRequestsReceived,
    setMembership,
    setMembershipRenewOptions,
    // setMemberships
    t,
  ]);

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

  React.useEffect(() => {
    apiEventList().then((response) => {
      if (response.status === 200) {
        const event = response.data.results.find((event: any) => {
          const eventUsers =
            user &&
            user.family &&
            getEventUsers(
              event,
              user.family.members.map((familyMember: any) => familyMember.user),
            );
          return (
            (event.type === EventType.REHEARSAL ||
              event.type === EventType.PERFORMANCE) &&
            new Date(event.time_to) >= new Date() &&
            eventUsers &&
            eventUsers.length > 0
          );
        });
        setRehearsal(event);
        if (event) {
          apiTowersCastleList(event.id).then((response) => {
            if (response.status === 200) {
              setCastles(response.data.results);
            }
          });
        }
      }
    });
  }, [setRehearsal, setCastles, lastChangedAttendance, user]);

  function handleRequestCancelSubmit(id: string) {
    apiUserFamilyMemberRequestCancel(id).then((response) => {
      if (response.status === 204) {
        apiUserFamilyMemberRequestList().then((response) => {
          if (response.status === 200) {
            setFamilyMemberRequests(
              response.data.filter((request: any) => {
                return request.status === FamilyMemberRequestStatus.REQUESTED;
              }),
            );
          }
        });
        setMessages([
          {
            message: t("pages.user-family.request.cancel.success"),
            type: "success",
          },
        ]);
        setTimeout(() => setMessages(undefined), 5000);
      } else {
        setMessages([
          {
            message: t("pages.user-family.request.cancel.error"),
            type: "error",
          },
        ]);
        setTimeout(() => setMessages(undefined), 5000);
      }
    });
  }

  function handleRequestRejectSubmit(id: string) {
    apiUserFamilyMemberRequestReject(id).then((response) => {
      if (response.status === 204) {
        apiUserFamilyMemberRequestReceivedList().then((response) => {
          if (response.status === 200) {
            setFamilyMemberRequestsReceived(
              response.data.filter((request: any) => {
                return request.status === FamilyMemberRequestStatus.REQUESTED;
              }),
            );
          }
        });
        setMessages([
          {
            message: t("pages.user-family.request.reject.success"),
            type: "success",
          },
        ]);
        setTimeout(() => setMessages(undefined), 5000);
      } else {
        setMessages([
          {
            message: t("pages.user-family.request.reject.error"),
            type: "error",
          },
        ]);
        setTimeout(() => setMessages(undefined), 5000);
      }
    });
  }

  function handleRequestAcceptSubmit(id: string) {
    apiUserFamilyMemberRequestAccept(id).then((response) => {
      if (response.status === 204) {
        apiUserFamilyMemberRequestReceivedList().then((response) => {
          if (response.status === 200) {
            setFamilyMemberRequestsReceived(
              response.data.filter((request: any) => {
                return request.status === FamilyMemberRequestStatus.REQUESTED;
              }),
            );
          }
        });
        apiUserMe().then((response) => {
          if (response.status === 200 || response.status === 204) {
            setUser(response.data);
          }
        });
        setMessages([
          {
            message: t("pages.user-family.request.accept.success"),
            type: "success",
          },
        ]);
        setTimeout(() => setMessages(undefined), 5000);
      } else {
        setMessages([
          {
            message: t("pages.user-family.request.accept.error"),
            type: "error",
          },
        ]);
        setTimeout(() => setMessages(undefined), 5000);
      }
    });
  }

  function handleRenewSubmit(modules: number[]) {
    apiMembershipRenewCreate(modules).then((response) => {
      if (response.status === 200) {
        const currentMembership = response.data;
        setMembership(currentMembership);
        setMembershipRenewOptions(undefined);

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

        setMessages([
          {
            message: t(
              "pages.user-dashboard.section.membership-renew.renew.success",
            ),
            type: "success",
          },
        ]);
        setTimeout(() => setMessages(undefined), 5000);
      } else {
        setMessages([
          {
            message: t(
              "pages.user-dashboard.section.membership-renew.renew.error",
            ),
            type: "error",
          },
        ]);
        setTimeout(() => setMessages(undefined), 5000);
      }
    });
  }

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
            {user.towers &&
              user.towers.height_shoulders &&
              user.towers.height_arms && (
                <ListItem>
                  <ListItemIcon>
                    <IconHeight />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      user.towers.height_shoulders +
                      " / " +
                      user.towers.height_arms +
                      " m"
                    }
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
        {user.permission_level >= PermissionLevel.ADMIN && (
          <>
            <Divider />
            <Box className={styles.userLogoutBox}>
              <Link
                color="secondary"
                underline="none"
                component="button"
                onClick={handleAdminSubmit}
                className={styles.link}
              >
                {t("pages.user-dashboard.link-admin")}
                <IconEast className={styles.iconEast} />
              </Link>
            </Box>
          </>
        )}
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

  const contentSidebarMembership = user && (
    <Grid>
      {(membership || membershipRenewOptions) && (
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
                        membership.date_from + " → " + membership.date_to
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
          {membershipRenewOptions && (
            <>
              <List className={styles.userFamilyList}>
                {membershipRenewOptions.map(
                  (option: any, i: number, row: any) => (
                    <Box key={i}>
                      <ListItemButton disableTouchRipple dense>
                        <ListItemIcon>
                          <IconWorkspaces />
                        </ListItemIcon>
                        <ListItemText
                          primary={option.modules.map(
                            (membershipModule: any) => {
                              return (
                                <span
                                  className={styles.dashboardMembershipModule}
                                >
                                  {getEnumLabel(
                                    t,
                                    "module",
                                    membershipModule.module,
                                  )}
                                </span>
                              );
                            },
                          )}
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {option.date_to}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="textSecondary"
                                component="span"
                              >
                                {" — "}
                              </Typography>
                              <Typography variant="body2" component="span">
                                {option.amount.amount} {option.amount.currency}
                              </Typography>
                            </>
                          }
                        />
                        <Stack
                          direction="row"
                          spacing={2}
                          style={{ marginLeft: "16px" }}
                        >
                          <Button
                            variant="contained"
                            type="button"
                            disableElevation
                            onClick={() =>
                              handleRenewSubmit(
                                option.modules.map(
                                  (moduleOption: any) => moduleOption.module,
                                ),
                              )
                            }
                          >
                            {t(
                              "pages.user-dashboard.section.membership-renew.renew",
                            )}
                          </Button>
                        </Stack>
                      </ListItemButton>
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

  const rehearsalUsers =
    user &&
    user.family &&
    rehearsal &&
    getEventUsers(
      rehearsal,
      user.family.members.map((familyMember: any) => familyMember.user),
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
        {rehearsal && (
          <Grid>
            <Card variant="outlined">
              <Box className={styles.userTopBox}>
                <Typography variant="h6" fontWeight="600" component="div">
                  {t("pages.user-dashboard.section.rehearsal.title")}
                </Typography>
              </Box>
              <Divider />

              <Box className={styles.userFamilyBox}>
                <List className={styles.userFamilyList}>
                  <ListItemButton disableTouchRipple dense>
                    <ListItemIcon>
                      {get_event_icon(rehearsal.type, rehearsal.modules)}
                    </ListItemIcon>
                    <Box
                      className={styles.userFamilyListInner}
                      flexDirection={{ xs: "column", lg: "row" }}
                      alignItems={{ xs: "start", lg: "center" }}
                    >
                      <ListItemText
                        className={styles.userFamilyListItem}
                        disableTypography
                        primary={
                          <Typography variant="body2">
                            {rehearsal.title +
                              (rehearsal.type === EventType.REHEARSAL &&
                              rehearsal.location !== null
                                ? " — " + rehearsal.location.name
                                : "")}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="textSecondary">
                              {capitalizeFirstLetter(
                                new Date(
                                  rehearsal.time_from,
                                ).toLocaleDateString(i18n.resolvedLanguage, {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }),
                              ) +
                                " " +
                                new Date(rehearsal.time_from)
                                  .toTimeString()
                                  .slice(0, 5) +
                                " → " +
                                new Date(rehearsal.time_to)
                                  .toTimeString()
                                  .slice(0, 5)}
                            </Typography>
                            {castles && castles.length > 0 && (
                              <Box className={styles.eventCastlesBox}>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  {t("pages.calendar.section.agenda.castles")}
                                  {": "}
                                  {castles.map(
                                    (castle: any, i: number, row: any) => {
                                      return (
                                        <Typography
                                          variant="body2"
                                          color="textSecondary"
                                          className={styles.eventCastleBox}
                                          component="span"
                                        >
                                          {castle.name}
                                          {castle.is_published && (
                                            <>
                                              {" ("}
                                              <IconAttachFile />
                                              {")"}
                                            </>
                                          )}
                                          {i + 1 < row.length && ", "}
                                        </Typography>
                                      );
                                    },
                                  )}
                                </Typography>
                              </Box>
                            )}
                          </>
                        }
                      />
                      <Stack
                        direction="row"
                        spacing={2}
                        marginLeft={{ xs: "0", lg: "16px" }}
                        marginTop={{ xs: "8px", lg: "0" }}
                        marginBottom={{ xs: "8px", lg: "0" }}
                        whiteSpace="nowrap"
                      >
                        <Button
                          variant="contained"
                          type="submit"
                          style={{ width: "auto" }}
                          disableElevation
                          href={
                            ROUTES.calendar.path + "?eventId=" + rehearsal.id
                          }
                        >
                          {t("pages.user-rehearsal.rehearsal.show")}
                        </Button>
                      </Stack>
                    </Box>
                  </ListItemButton>
                  <Divider />
                  <Box>
                    <ListItemButton
                      onClick={() => setAttendanceOpen(!attendanceOpen)}
                    >
                      <ListItemText
                        primary={t("pages.user-rehearsal.rehearsal.attending")}
                        secondary={
                          rehearsal.registrations.filter(
                            (registration: any) =>
                              registration.status === RegistrationStatus.ACTIVE,
                          ).length > 0
                            ? t(
                                "pages.user-rehearsal.rehearsal.attending-list",
                              ) +
                              ": " +
                              rehearsal.registrations
                                .filter(
                                  (registration: any) =>
                                    registration.status ===
                                      RegistrationStatus.ACTIVE &&
                                    rehearsalUsers &&
                                    rehearsalUsers.filter(
                                      (rehearsalUser: any) =>
                                        rehearsalUser.id ===
                                        registration.user.id,
                                    ).length > 0,
                                )
                                .map((registration: any) =>
                                  registration.user.lastname
                                    ? registration.user.firstname +
                                      " " +
                                      registration.user.lastname
                                    : registration.user.firstname,
                                )
                                .join(", ")
                            : t(
                                "pages.user-rehearsal.rehearsal.attending-empty",
                              )
                        }
                      />
                      {attendanceOpen ? <IconExpandLess /> : <IconExpandMore />}
                    </ListItemButton>
                    <Collapse in={attendanceOpen} timeout="auto" unmountOnExit>
                      <Box className={styles.userAttendanceUpdate}>
                        <FormCalendarRegistrationCreate
                          event={rehearsal}
                          users={rehearsalUsers}
                          setLastChanged={setLastChangedAttendance}
                        />
                      </Box>
                    </Collapse>
                  </Box>
                  {rehearsal.registrations.length > 0 &&
                    rehearsal.agenda_items.length > 0 && (
                      <>
                        <Divider />
                        <Box className={styles.userInsideBox}>
                          <Typography
                            variant="body1"
                            fontWeight="600"
                            component="div"
                          >
                            {t("pages.user-dashboard.section.agenda.title")}
                          </Typography>
                        </Box>
                        <Divider />
                        <List className={styles.userFamilyList}>
                          {rehearsal.agenda_items.map((agendaItem: any) => (
                            <ListItemButton dense={true}>
                              <ListItemText
                                className={styles.rehearsalAgendaItem}
                                primary={
                                  new Date(agendaItem.time_from)
                                    .toTimeString()
                                    .slice(0, 5) +
                                  " — " +
                                  agendaItem.name
                                }
                                secondary={
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: markdown(
                                        agendaItem.description,
                                      ).toString(),
                                    }}
                                  ></div>
                                }
                              />
                            </ListItemButton>
                          ))}
                        </List>
                      </>
                    )}
                </List>
              </Box>
            </Card>
          </Grid>
        )}

        <Grid
          container
          size={12}
          display={{ xs: "flex", md: "none" }}
          spacing={4}
          direction="column"
        >
          {contentSidebarProfile}
          {contentSidebarMembership}
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
                                      {payment.amount.amount}{" "}
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
                                  new Date(
                                    payment.transaction
                                      ? payment.transaction.date_accounting
                                      : payment.logs && payment.logs.length > 0
                                        ? payment.logs[0].created_at
                                        : payment.created_at,
                                  )
                                    .toISOString()
                                    .slice(0, 10)
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
                            order.products && order.products.length > 0,
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
                                      {capitalizeFirstLetter(
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
                                      )}
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
                                  (order.status >= OrderStatus.COMPLETED
                                    ? t("pages.user-payments.payment.date-done")
                                    : t(
                                        "pages.user-payments.payment.date-doing",
                                      )) +
                                  " " +
                                  new Date(
                                    order.logs && order.logs.length > 0
                                      ? order.logs[0].created_at
                                      : order.created_at,
                                  )
                                    .toISOString()
                                    .slice(0, 10)
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
                                {order.products.map(
                                  (orderProduct: any, i: number, row: any) => (
                                    <Box key={orderProduct.id}>
                                      <ListItemButton disableTouchRipple dense>
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
                                                  orderProduct.size.product.name
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
                                    new Date(
                                      expense.logs && expense.logs.length > 0
                                        ? expense.logs[0].created_at
                                        : expense.created_at,
                                    )
                                      .toISOString()
                                      .slice(0, 10)
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

        <Grid>
          <Card variant="outlined">
            <Box className={styles.userTopBox}>
              <Typography variant="h6" fontWeight="600" component="div">
                {t("pages.user-dashboard.section.family.title")}
              </Typography>
            </Box>
            <Divider />
            <Box className={styles.userFamilyBox}>
              <List className={styles.userFamilyList}>
                {user.family &&
                  user.family.members.map(
                    (member: any, i: number, row: any) => (
                      <Box key={member.id}>
                        <ListItemButton
                          onClick={() => handleFamilyClick(member.id)}
                          disableTouchRipple={member.user.can_manage}
                          dense
                        >
                          <ListItemIcon>
                            <IconAccountCircle />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              member.user.lastname
                                ? member.user.firstname +
                                  " " +
                                  member.user.lastname
                                : member.user.firstname
                            }
                            secondary={
                              member.user.can_manage
                                ? member.user.email
                                : t("pages.user-family.list.underage")
                            }
                          />
                          {!member.user.can_manage &&
                            (familyMembersOpen[member.id] ? (
                              <IconExpandLess />
                            ) : (
                              <IconExpandMore />
                            ))}
                        </ListItemButton>
                        {!member.user.can_manage && (
                          <Collapse
                            in={familyMembersOpen[member.id]}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box className={styles.userFamilyMemberUpdate}>
                              <FormMemberUpdate member={member} />
                            </Box>
                          </Collapse>
                        )}

                        {(i + 1 < row.length || true) && <Divider />}
                      </Box>
                    ),
                  )}
                <Box>
                  <ListItemButton onClick={() => handleFamilyClick("new")}>
                    <ListItemText
                      primary={t("pages.user-family.create.title")}
                      secondary={t("pages.user-family.create.subtitle")}
                    />
                    {familyMembersOpen["new"] ? (
                      <IconExpandLess />
                    ) : (
                      <IconExpandMore />
                    )}
                  </ListItemButton>
                  <Collapse
                    in={familyMembersOpen["new"]}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Box className={styles.userFamilyMemberUpdate}>
                      <FormMemberCreate />
                    </Box>
                  </Collapse>
                </Box>
              </List>
            </Box>
          </Card>
        </Grid>
        <Grid>
          <Card variant="outlined">
            <Box className={styles.userTopBox}>
              <Typography variant="h6" fontWeight="600" component="div">
                {t("pages.user-dashboard.section.family-requests.title")}
              </Typography>
            </Box>
            <Divider />
            <Box className={styles.userFamilyBox}>
              <List className={styles.userFamilyList}>
                {familyMemberRequestsReceived &&
                  familyMemberRequestsReceived.map(
                    (request: any, i: number, row: any) => (
                      <Box key={request.id}>
                        <ListItemButton dense={true} disableTouchRipple>
                          <ListItemIcon>
                            <IconPersonAdd />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              request.user_sender.lastname
                                ? request.user_sender.firstname +
                                  " " +
                                  request.user_sender.lastname
                                : request.user_sender.firstname
                            }
                            secondary={
                              <>
                                <Box
                                  sx={{
                                    display: { xs: "none", md: "inline-block" },
                                  }}
                                >
                                  {t("pages.user-family.request.received")}
                                  &nbsp;
                                </Box>
                                {new Date(request.created_at)
                                  .toISOString()
                                  .slice(0, 10) +
                                  " " +
                                  new Date(request.created_at)
                                    .toTimeString()
                                    .slice(0, 5)}
                              </>
                            }
                          />
                          <Stack
                            direction="row"
                            spacing={2}
                            style={{ marginLeft: "16px" }}
                          >
                            <Button
                              variant="contained"
                              type="submit"
                              disableElevation
                              onClick={() =>
                                handleRequestAcceptSubmit(request.id)
                              }
                            >
                              {t("pages.user-family.request.accept")}
                            </Button>
                            <Button
                              variant="contained"
                              type="submit"
                              color="error"
                              disableElevation
                              onClick={() =>
                                handleRequestRejectSubmit(request.id)
                              }
                            >
                              {t("pages.user-family.request.reject")}
                            </Button>
                          </Stack>
                        </ListItemButton>
                        {(i + 1 < row.length || true) && <Divider />}
                      </Box>
                    ),
                  )}
                {familyMemberRequests &&
                  familyMemberRequests.map(
                    (request: any, i: number, row: any) => (
                      <Box key={request.id}>
                        <ListItemButton dense={true} disableTouchRipple>
                          <ListItemIcon>
                            <IconPersonSearch />
                          </ListItemIcon>
                          <ListItemText
                            primary={request.email_receiver}
                            secondary={
                              <>
                                <Box
                                  sx={{
                                    display: { xs: "none", md: "inline-block" },
                                  }}
                                >
                                  {t("pages.user-family.request.sent")}&nbsp;
                                </Box>
                                {new Date(request.created_at)
                                  .toISOString()
                                  .slice(0, 10) +
                                  " " +
                                  new Date(request.created_at)
                                    .toTimeString()
                                    .slice(0, 5)}
                              </>
                            }
                          />
                          <Stack
                            direction="row"
                            spacing={2}
                            style={{ marginLeft: "16px" }}
                          >
                            <Button
                              variant="contained"
                              type="submit"
                              color="info"
                              disableElevation
                              onClick={() =>
                                handleRequestCancelSubmit(request.id)
                              }
                            >
                              {t("pages.user-family.request.cancel")}
                            </Button>
                          </Stack>
                        </ListItemButton>
                        {(i + 1 < row.length || true) && <Divider />}
                      </Box>
                    ),
                  )}
                <Box>
                  <ListItemButton onClick={() => handleFamilyClick("request")}>
                    <ListItemText
                      primary={t("pages.user-family.request.title")}
                      secondary={t("pages.user-family.request.subtitle")}
                    />
                    {familyMembersOpen["request"] ? (
                      <IconExpandLess />
                    ) : (
                      <IconExpandMore />
                    )}
                  </ListItemButton>
                  <Collapse
                    in={familyMembersOpen["request"]}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Box className={styles.userFamilyMemberUpdate}>
                      <FormMemberRequest />
                    </Box>
                  </Collapse>
                </Box>
              </List>
            </Box>
          </Card>
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
