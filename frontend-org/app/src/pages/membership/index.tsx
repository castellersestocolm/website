import styles from "./styles.module.css";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import {
  Button,
  Card,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import {
  apiMembershipList,
  apiMembershipRenewCreate,
  apiMembershipRenewList,
  apiOrderMembershipCreate,
} from "../../api";
import { useAppContext } from "../../components/AppContext/AppContext";
import Box from "@mui/material/Box";
import {
  getEnumLabel,
  MEMBERSHIP_STATUS_ICON,
  MembershipStatus,
} from "../../enums";
import IconPayment from "@mui/icons-material/Payment";
import IconWorkspaces from "@mui/icons-material/Workspaces";
import IconCalendarMonth from "@mui/icons-material/CalendarMonth";
import { dateToString } from "../../utils/datetime";
import IconEventRepeat from "@mui/icons-material/EventRepeat";
import { listToCommaSeparatedString } from "../../utils/string";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";

function MembershipPage() {
  const [t, i18n] = useTranslation("common");

  const { setMessages } = useAppContext();

  const [membership, setMembership] = React.useState(undefined);
  const [membershipRenewOptions, setMembershipRenewOptions] =
    React.useState(undefined);

  let navigate = useNavigate();

  React.useEffect(() => {
    apiMembershipList().then((response) => {
      if (response.status === 200) {
        const currentMembership = response.data.results.find(
          (membership: any) => {
            return membership.is_active;
          },
        );
        setMembership(currentMembership);
      }
    });
  }, [setMembership, i18n.resolvedLanguage]);

  React.useEffect(() => {
    apiMembershipRenewList().then((response) => {
      if (response.status === 200) {
        setMembershipRenewOptions(response.data);
      }
    });
  }, [setMembershipRenewOptions, i18n.resolvedLanguage]);

  function handleRenewSubmit(modules: number[]) {
    apiMembershipRenewCreate(modules).then((response) => {
      if (response.status === 200) {
        const currentMembership = response.data;

        const cartModules = currentMembership.modules.map((module: any) => {
          return { id: module.id };
        });
        apiOrderMembershipCreate(cartModules).then((response) => {
          if (response.status === 201) {
            navigate(
              ROUTES["membership-payment"].path.replace(
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
        });
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

  const content = (
    <>
      <Grid container spacing={4} className={styles.membershipGrid}>
        {membership && !membership.can_renew ? (
          <>
            <Typography variant="body1" textAlign="center">
              {membership.status === MembershipStatus.ACTIVE
                ? t("pages.membership.message-active-1")
                : membership.status === MembershipStatus.PROCESSING
                  ? t("pages.membership.message-processing-1")
                  : t("pages.membership.message-requested-1")}{" "}
              {dateToString(i18n.resolvedLanguage, membership.date_to)}{" "}
              {membership.status === MembershipStatus.ACTIVE
                ? t("pages.membership.message-active-2")
                : membership.status === MembershipStatus.PROCESSING
                  ? t("pages.membership.message-processing-2")
                  : t("pages.membership.message-requested-2")}{" "}
              {listToCommaSeparatedString(
                membership.modules.map((membershipModule: any) =>
                  getEnumLabel(t, "module", membershipModule.module),
                ),
                t,
              )}
              {"."}
            </Typography>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <Box className={styles.userTopBox}>
                  <Typography variant="h6" fontWeight="600" component="div">
                    {membership
                      ? t("pages.user-dashboard.section.membership.title")
                      : t(
                          "pages.user-dashboard.section.membership-renew.title",
                        )}
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
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <IconCalendarMonth />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          dateToString(
                            i18n.resolvedLanguage,
                            membership.date_from,
                          ) +
                          " → " +
                          dateToString(
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
              </Card>
            </Grid>
          </>
        ) : (
          membershipRenewOptions && (
            <>
              <Typography variant="body1" textAlign="center">
                {t("pages.membership.renew.message-1")}
              </Typography>
              <Grid container spacing={4} size={12}>
                {membershipRenewOptions.map(
                  (option: any, i: number, row: any) => {
                    return (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Card variant="outlined" className={styles.userCard}>
                          <Box className={styles.userTopBox}>
                            <Typography
                              variant="h6"
                              fontWeight="600"
                              component="div"
                            >
                              {t("pages.membership.renew.option")} {i + 1}
                            </Typography>
                          </Box>
                          <Divider />
                          <Box className={styles.userRenewDetailsBox}>
                            <List dense={true} className={styles.userList}>
                              <ListItemButton disableTouchRipple dense>
                                <ListItemIcon>
                                  <IconWorkspaces />
                                </ListItemIcon>
                                <ListItemText
                                  primary={option.modules.map(
                                    (membershipModule: any) => {
                                      return (
                                        <span
                                          className={
                                            styles.dashboardMembershipModule
                                          }
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
                                      <Typography
                                        variant="body2"
                                        component="span"
                                      >
                                        {option.date_to}
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
                                        component="span"
                                      >
                                        {option.amount.amount}{" "}
                                        {option.amount.currency}
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
                                          (moduleOption: any) =>
                                            moduleOption.module,
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
                            </List>
                          </Box>
                        </Card>
                      </Grid>
                    );
                  },
                )}
              </Grid>
            </>
          )
        )}
      </Grid>
    </>
  );

  return (
    <PageBase
      title={
        membership
          ? t("pages.membership.title")
          : t("pages.membership.title-renew")
      }
      content={content}
      loading={!membership || !membershipRenewOptions}
    />
  );
}

export default MembershipPage;
