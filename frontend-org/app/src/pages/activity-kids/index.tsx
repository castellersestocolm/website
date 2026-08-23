import {
  Typography,
  Grid,
  Card,
  Box,
  Divider,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  List,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Stack,
  Button,
  Link,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import { useAppContext } from "../../components/AppContext/AppContext";
import ImageHeroKids from "../../assets/images/heros/kids.jpg";
import styles from "./styles.module.css";
import {
  getEnumLabel,
  Module,
  ProgramCourseRegistrationStatus,
  ProgramType,
} from "../../enums";
import { useState } from "react";
import {
  apiActivityProgramCourseList,
  apiActivityProgramCourseRegistrationCreate,
  apiActivityProgramCourseRegistrationDelete,
  apiOrderCourseCreate,
} from "../../api";
import { datetimeToLongString, dateToString } from "../../utils/datetime";
import IconAccountCircle from "@mui/icons-material/AccountCircle";
import IconCalendarMonth from "@mui/icons-material/CalendarMonth";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import IconEast from "@mui/icons-material/East";

function ActivityKidsPage() {
  const [t, i18n] = useTranslation("common");

  const { user, setMessages } = useAppContext();

  let navigate = useNavigate();

  const [programCourses, setProgramCourses] = useState(undefined);

  const userFamilyMemberCannotManage =
    user &&
    user.family &&
    user.family.members &&
    user.family.members.length > 0 &&
    user.family.members.filter((member: any) => !member.user.can_manage);

  React.useEffect(() => {
    apiActivityProgramCourseList([ProgramType.ESPLAI]).then((response) => {
      if (response.status === 200) {
        setProgramCourses(response.data);
      }
    });
  }, [setProgramCourses, i18n.resolvedLanguage]);

  function handleRegistrationCreate(userId: string, courseId: string) {
    apiActivityProgramCourseRegistrationCreate(userId, courseId).then(
      (response) => {
        if (response.status === 200) {
          apiActivityProgramCourseList([ProgramType.ESPLAI]).then(
            (response) => {
              if (response.status === 200) {
                setProgramCourses(response.data);
              }
            },
          );
        }
      },
    );
  }

  function handleRegistrationDelete(registrationId: string) {
    apiActivityProgramCourseRegistrationDelete(registrationId).then(
      (response) => {
        if (response.status === 204) {
          apiActivityProgramCourseList([ProgramType.ESPLAI]).then(
            (response) => {
              if (response.status === 200) {
                setProgramCourses(response.data);
              }
            },
          );
        }
      },
    );
  }

  function handleCourseRegistrationProcess(courseId: string) {
    if (
      programCourses &&
      programCourses.results &&
      programCourses.results.length > 0
    ) {
      const programCourse = programCourses.results.find(
        (programCourse: any) => programCourse.id === courseId,
      );
      if (programCourse) {
        const cartCourseRegistrations = programCourse.registrations
          .filter(
            (registration: any) =>
              registration.status === ProgramCourseRegistrationStatus.REQUESTED,
          )
          .map((registration: any) => {
            return { id: registration.id };
          });

        apiOrderCourseCreate(cartCourseRegistrations).then((response) => {
          if (response.status === 201) {
            navigate(
              ROUTES["course-payment"].path.replace(":id", response.data.id),
            );
          } else {
            setMessages([
              { message: t("pages.order-cart.order.error"), type: "error" },
            ]);
            setTimeout(() => setMessages(undefined), 10000);
          }
        });
      }
    }
  }

  const content = (
    <>
      <Typography variant="body1" mb={1}>
        {t("pages.activity-kids.content.section-1.text-1")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.activity-kids.content.section-1.text-2")}
      </Typography>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.activity-kids.content.section-2.title")}
      </Typography>
      <ul>
        <li>
          <Typography variant="body1" mb={1}>
            {t("pages.activity-kids.content.section-2.point-1")}
          </Typography>
        </li>
        <li>
          <Typography variant="body1" mb={1}>
            {t("pages.activity-kids.content.section-2.point-2")}
          </Typography>
        </li>
        <li>
          <Typography variant="body1" mb={1}>
            {t("pages.activity-kids.content.section-2.point-3")}
          </Typography>
        </li>
      </ul>
      <Grid container gap={3} mt={5} mb={5} justifyContent="center">
        <Grid size={{ xs: 12, sm: 10, md: 7, lg: 5, xl: 4 }}>
          <Card variant="outlined" className={styles.pricesCard}>
            <Box className={styles.pricesTopBox}>
              <Typography variant="h6" fontWeight="600" component="div">
                {t("pages.activity-kids.prices.title")}
              </Typography>
            </Box>
            <Divider />

            <Box>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: 0,
                        },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {getEnumLabel(t, "module", Module.ORG)}
                        {" ("}
                        {t("pages.activity-kids.prices.family")}
                        {")"}
                      </TableCell>
                      <TableCell align="right">{"250 SEK"}</TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: 0,
                        },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {t("pages.activity-kids.prices.kid-1")}
                      </TableCell>
                      <TableCell align="right">{"200 SEK"}</TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: 0,
                        },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {t("pages.activity-kids.prices.kid-2")}
                      </TableCell>
                      <TableCell align="right">{"100 SEK"}</TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: 0,
                        },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {t("pages.activity-kids.prices.kid-3")}
                      </TableCell>
                      <TableCell align="right">{"0 SEK"}</TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: 0,
                        },
                      }}
                      className={styles.pricesTableRowTotal}
                    >
                      <TableCell component="th" scope="row">
                        {t("pages.activity-kids.prices.summary-total")}
                      </TableCell>
                      <TableCell align="right">
                        {"450 SEK"}
                        {"/"}
                        {t("pages.activity-kids.prices.summary-year")}
                      </TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: 0,
                        },
                      }}
                      className={styles.pricesTableRowTotal}
                    >
                      <TableCell component="th" scope="row">
                        {t("pages.activity-kids.prices.summary-total-2")}
                      </TableCell>
                      <TableCell align="right">
                        {"550 SEK"}
                        {"/"}
                        {t("pages.activity-kids.prices.summary-year")}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.activity-kids.content.section-3.title")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.activity-kids.content.section-3.text-1")}
      </Typography>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.activity-kids.content.section-register.title")}
      </Typography>
      {(!userFamilyMemberCannotManage ||
        userFamilyMemberCannotManage.length === 0) && (
        <>
          <Typography variant="body1" mb={1}>
            {t("pages.activity-kids.content.section-register.text-login")}
          </Typography>
          <Typography variant="body1" mb={1}>
            <Link
              color="secondary"
              underline="none"
              href={
                user ? ROUTES["user-dashboard"].path : ROUTES["user-login"].path
              }
              className={styles.link}
            >
              {user
                ? t(
                    "pages.activity-kids.content.section-register.text-login-family",
                  )
                : t(
                    "pages.activity-kids.content.section-register.text-login-link",
                  )}
              <IconEast className={styles.iconEast} />
            </Link>
          </Typography>
        </>
      )}
      {programCourses &&
        programCourses.results &&
        programCourses.results.length > 0 &&
        userFamilyMemberCannotManage &&
        userFamilyMemberCannotManage.length > 0 && (
          <>
            {programCourses.results.map((programCourse: any) => {
              const registrationsRequested = programCourse.registrations.filter(
                (registration: any) =>
                  registration.status ===
                  ProgramCourseRegistrationStatus.REQUESTED,
              );

              return (
                <>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    mb={1}
                    textAlign="center"
                  >
                    {dateToString(
                      i18n.resolvedLanguage,
                      programCourse.date_from,
                    ) +
                      " → " +
                      dateToString(
                        i18n.resolvedLanguage,
                        programCourse.date_to,
                      )}
                  </Typography>

                  <Grid container gap={3} mt={3} mb={3} justifyContent="center">
                    {programCourse.events &&
                      programCourse.events.length > 0 && (
                        <Grid size={{ xs: 12, sm: 10, md: 7, lg: 5, xl: 4 }}>
                          <Card variant="outlined">
                            <Box className={styles.userTopBox}>
                              <Typography
                                variant="h6"
                                fontWeight="600"
                                component="div"
                              >
                                {t(
                                  "pages.activity-kids.content.section-register.title-events",
                                )}
                              </Typography>
                            </Box>
                            <Divider />
                            <Box className={styles.userFamilyBox}>
                              <List className={styles.userFamilyList}>
                                {programCourse.events.map(
                                  (event: any, i: number, row: any) => (
                                    <>
                                      <Box key={event.id}>
                                        <ListItemButton
                                          disableTouchRipple
                                          dense
                                        >
                                          <ListItemIcon>
                                            <IconCalendarMonth />
                                          </ListItemIcon>
                                          <ListItemText
                                            primary={
                                              <Typography
                                                variant="body2"
                                                component="span"
                                              >
                                                {datetimeToLongString(
                                                  i18n.resolvedLanguage,
                                                  event.time_from,
                                                )}
                                              </Typography>
                                            }
                                            secondary={
                                              event.location &&
                                              event.location.name
                                            }
                                          ></ListItemText>
                                        </ListItemButton>
                                      </Box>
                                      {i + 1 < row.length && <Divider />}
                                    </>
                                  ),
                                )}
                              </List>
                            </Box>
                          </Card>
                        </Grid>
                      )}
                    {userFamilyMemberCannotManage &&
                      userFamilyMemberCannotManage.length > 0 && (
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
                                {t(
                                  "pages.activity-kids.content.section-register.title-registrations",
                                )}
                              </Typography>
                              {registrationsRequested &&
                                registrationsRequested.length > 0 && (
                                  <Button
                                    variant="outlined"
                                    type="submit"
                                    style={{ width: "auto" }}
                                    color="secondary"
                                    disableElevation
                                    onClick={() =>
                                      handleCourseRegistrationProcess(
                                        programCourse.id,
                                      )
                                    }
                                  >
                                    {t(
                                      "pages.activity-kids.content.section-register.button-pay",
                                    )}
                                  </Button>
                                )}
                            </Box>
                            <Divider />
                            <Box className={styles.userFamilyBox}>
                              <List className={styles.userFamilyList}>
                                {userFamilyMemberCannotManage.map(
                                  (member: any, i: number, row: any) => {
                                    const registration =
                                      programCourse.registrations.find(
                                        (registration: any) =>
                                          registration.entity.id ===
                                          member.user.entity.id,
                                      );

                                    return (
                                      <>
                                        <Box key={member.id}>
                                          <ListItemButton
                                            disableTouchRipple
                                            dense
                                          >
                                            <ListItemIcon>
                                              <IconAccountCircle />
                                            </ListItemIcon>
                                            <Box
                                              className={
                                                styles.userFamilyListInner
                                              }
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
                                                  <Typography
                                                    variant="body2"
                                                    component="span"
                                                  >
                                                    {member.user.lastname
                                                      ? member.user.firstname +
                                                        " " +
                                                        member.user.lastname
                                                      : member.user.firstname}
                                                  </Typography>
                                                }
                                                secondary={
                                                  registration && (
                                                    <Typography
                                                      variant="body2"
                                                      style={{
                                                        color:
                                                          registration.status ===
                                                          ProgramCourseRegistrationStatus.ACTIVE
                                                            ? "var(--mui-palette-success-main)"
                                                            : "var(--mui-palette-error-main)",
                                                        whiteSpace: "nowrap",
                                                      }}
                                                    >
                                                      {registration.status ===
                                                      ProgramCourseRegistrationStatus.ACTIVE
                                                        ? t(
                                                            "pages.activity-kids.content.section-register.status-active",
                                                          )
                                                        : registration.status ===
                                                            ProgramCourseRegistrationStatus.PROCESSING
                                                          ? t(
                                                              "pages.activity-kids.content.section-register.status-processing",
                                                            )
                                                          : t(
                                                              "pages.activity-kids.content.section-register.status-requested",
                                                            )}
                                                    </Typography>
                                                  )
                                                }
                                              ></ListItemText>

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
                                                  disabled={
                                                    registration &&
                                                    registration.status >
                                                      ProgramCourseRegistrationStatus.REQUESTED
                                                  }
                                                  onClick={() => {
                                                    if (registration) {
                                                      handleRegistrationDelete(
                                                        registration.id,
                                                      );
                                                    } else {
                                                      handleRegistrationCreate(
                                                        member.user.id,
                                                        programCourse.id,
                                                      );
                                                    }
                                                  }}
                                                >
                                                  {registration &&
                                                  registration.status >=
                                                    ProgramCourseRegistrationStatus.REQUESTED
                                                    ? t(
                                                        "pages.activity-kids.content.section-register.button-deregister",
                                                      )
                                                    : t(
                                                        "pages.activity-kids.content.section-register.button-register",
                                                      )}
                                                </Button>
                                              </Stack>
                                            </Box>
                                          </ListItemButton>
                                        </Box>
                                        {i + 1 < row.length && <Divider />}
                                      </>
                                    );
                                  },
                                )}
                              </List>
                            </Box>
                          </Card>
                        </Grid>
                      )}
                  </Grid>
                </>
              );
            })}
          </>
        )}
    </>
  );

  return (
    <PageImageHero
      title={t("pages.activity-kids.title")}
      content={content}
      hero={ImageHeroKids}
    />
  );
}

export default ActivityKidsPage;
