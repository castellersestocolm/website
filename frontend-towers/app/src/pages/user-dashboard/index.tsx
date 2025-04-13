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
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import IconEast from "@mui/icons-material/East";
import { useAppContext } from "../../components/AppContext/AppContext";
import {
  apiEventList,
  apiMembershipList,
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
import Grid from "@mui/material/Grid2";
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
import FormMemberUpdate from "../../components/FormMemberUpdate/FormMemberUpdate";
import FormMemberCreate from "../../components/FormMemberCreate/FormMemberCreate";
import PageBase from "../../components/PageBase/PageBase";
import {
  EVENT_TYPE_ICON,
  EventType,
  FamilyMemberRequestStatus,
  getEnumLabel,
  MEMBERSHIP_STATUS_ICON,
  MembershipStatus,
  PAYMENT_STATUS_ICON,
  PaymentStatus,
  PaymentType,
} from "../../enums";
import FormMemberRequest from "../../components/FormMemberRequest/FormMemberRequest";
import FormDashboardUpdate from "../../components/FormDashboardUpdate/FormDashboardUpdate";
import markdown from "@wcj/markdown-to-html";
import FormCalendarRegistrationCreate from "../../components/FormCalendarRegistrationCreate/FormCalendarRegistrationCreate";
import { capitalizeFirstLetter } from "../../utils/string";

const ORG_INFO_EMAIL = process.env.REACT_APP_ORG_INFO_EMAIL;
const PINYATOR_BASE_URL = "https://localhost"  // new URL(process.env.REACT_APP_PINYATOR_BASE_URL);

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

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

  function handleSubmit() {
    apiUserLogout().then((response) => {
      setUser(null);
      navigate(ROUTES.home.path, { replace: true });
    });
  }

  if (user === null) {
    navigate(ROUTES["user-login"].path, { replace: true });
  }

  const [familyMembersOpen, setFamilyMembersOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [paymentsOpen, setPaymentsOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [updateOpen, setUpdateOpen] = React.useState(false);
  const [attendanceOpen, setAttendanceOpen] = React.useState(false);

  // const [memberships, setMemberships] = React.useState(undefined);
  const [payments, setPayments] = React.useState(undefined);
  const [membership, setMembership] = React.useState(undefined);
  const [castles, setCastles] = React.useState(undefined);
  const [castlesPublished, setCastlesPublished] = React.useState(undefined);

  const [castlePinya, setCastlePinya] = React.useState(0);

  const handleCastlePinyaChange = (
    event: React.SyntheticEvent,
    newValue: number,
  ) => {
    setCastlePinya(newValue);
  };

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

  React.useEffect(() => {
    if (user) {
      apiMembershipList().then((response) => {
        if (response.status === 200) {
          // setMemberships(response.data);
          setMembership(
            response.data.results.find((membership: any) => {
              return membership.is_active;
            }),
          );
        }
      });
      apiPaymentList().then((response) => {
        if (response.status === 200) {
          setPayments(response.data);
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
    // setMemberships
  ]);

  React.useEffect(() => {
    apiEventList().then((response) => {
      if (response.status === 200) {
        const event = response.data.results.find((event: any) => {
          return (
            event.type === EventType.REHEARSAL &&
            new Date(event.time_to) >= new Date()
          );
        });
        setRehearsal(event);
        if (event) {
          apiTowersCastleList(event.id).then((response) => {
            if (response.status === 200) {
              setCastles(response.data.results);
              setCastlesPublished(
                response.data.results.filter(
                  (castle: any) => castle.is_published,
                ),
              );
            }
          });
        }
      }
    });
  }, [setRehearsal, setCastles, setCastlesPublished]);

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
        <Divider />
        <Box className={styles.userLogoutBox}>
          <Link
            color="secondary"
            underline="none"
            component="button"
            onClick={handleSubmit}
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
      {membership && (
        <Card variant="outlined">
          <Box className={styles.userTopBox}>
            <Typography variant="h6" fontWeight="600" component="div">
              {t("pages.user-dashboard.section.membership.title")}
            </Typography>
          </Box>
          <Divider />
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
                    membership.amount.amount + " " + membership.amount.currency
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <IconWorkspaces />
                </ListItemIcon>
                <ListItemText
                  primary={membership.modules.map((membershipModule: any) => {
                    return (
                      <span className={styles.dashboardMembershipModule}>
                        {getEnumLabel(t, "module", membershipModule.module)}
                      </span>
                    );
                  })}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <IconCalendarMonth />
                </ListItemIcon>
                <ListItemText
                  primary={membership.date_from + " → " + membership.date_to}
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
          <Divider />
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
                  <ListItemButton dense={true}>
                    <ListItemIcon>
                      {EVENT_TYPE_ICON[rehearsal.type]}
                    </ListItemIcon>
                    <ListItemText
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
                              new Date(rehearsal.time_from).toLocaleDateString(
                                i18n.resolvedLanguage,
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              ),
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
                            <Typography variant="body2" color="textSecondary">
                              {t("pages.user-rehearsal.rehearsal.castles")}
                              {": "}
                              {castles
                                .map((castle: any) => castle.name)
                                .join(", ")}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItemButton>
                  {castlesPublished && castlesPublished.length > 0 && (
                    <>
                      <Divider />
                      <Tabs
                        value={castlePinya}
                        onChange={handleCastlePinyaChange}
                        variant="scrollable"
                        scrollButtons={false}
                        allowScrollButtonsMobile
                        aria-label="scrollable force tabs example"
                        className={styles.tabsCastle}
                        indicatorColor="primary"
                        TabIndicatorProps={{
                          style: { display: "none" },
                        }}
                        sx={{
                          ".Mui-selected": {
                            backgroundColor: "var(--mui-palette-primary-main)",
                            color:
                              "var(--mui-palette-primary-contrastText) !important",
                          },
                        }}
                      >
                        {castlesPublished.map((castle: any) => (
                          <Tab label={castle.name} />
                        ))}
                      </Tabs>
                      <Divider />
                      {castlesPublished.map((castle: any, ix: number) => (
                        <TabPanel value={castlePinya} index={ix}>
                          <Box className={styles.containerCastle}>
                            <iframe
                              src={
                                PINYATOR_BASE_URL +
                                "/Castell_Imatge.php?id=" +
                                castle.external_id
                              }
                              title={"Pinya " + castle.name}
                              className={styles.iframeCastle}
                              scrolling="no"
                            />
                          </Box>
                        </TabPanel>
                      ))}
                    </>
                  )}
                  <Divider />
                  <Box>
                    <ListItemButton
                      onClick={() => setAttendanceOpen(!attendanceOpen)}
                    >
                      <ListItemText
                        primary={t("pages.user-rehearsal.rehearsal.attending")}
                        secondary={
                          rehearsal.registrations.length > 0
                            ? t(
                                "pages.user-rehearsal.rehearsal.attending-list",
                              ) +
                              ": " +
                              rehearsal.registrations
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
                          family={user.family}
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
          <Card variant="outlined">
            <Box className={styles.userTopBox}>
              <Typography variant="h6" fontWeight="600" component="div">
                {t("pages.user-dashboard.section.payments.title")}
              </Typography>
            </Box>
            <Divider />

            <Box className={styles.userFamilyBox}>
              {payments && payments.length > 0 ? (
                <List className={styles.userFamilyList}>
                  {payments.map((payment: any, i: number, row: any) => (
                    <Box key={payment.id}>
                      <ListItemButton
                        onClick={() => handlePaymentClick(payment.id)}
                        dense={true}
                      >
                        <ListItemIcon>
                          {PAYMENT_STATUS_ICON[payment.status]}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <>
                              <Typography variant="body2" component="span">
                                {payment.type === PaymentType.CREDIT &&
                                  t("pages.user-payments.payment.refund") +
                                    " — "}
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
                            getEnumLabel(t, "payment-status", payment.status) +
                            " " +
                            (payment.status >= PaymentStatus.COMPLETED
                              ? t("pages.user-payments.payment.date-done")
                              : t("pages.user-payments.payment.date-doing")) +
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
                                  <ListItemButton dense={true}>
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
                  ))}
                </List>
              ) : (
                <Box className={styles.userFamilyEmpty}>
                  <Typography component="div">
                    {t("pages.user-dashboard.section.payments.empty")}
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
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
                          dense={true}
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
    />
  );
}

export default UserDashboardPage;
