import styles from "./styles.module.css";
import { Avatar, Divider, Link, Stack, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import ImageHeroAboutTeam from "../../assets/images/heros/about-team.jpg";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import { apiLegalGroupList } from "../../api";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import Pagination from "@mui/material/Pagination";
import { API_LEGAL_GROUP_LIST_PAGE_SIZE } from "../../consts";
import { languageToLocale } from "../../utils/locale";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_TOWERS_API_URL).origin;

function AboutTeamPage() {
  const [t, i18n] = useTranslation("common");

  const [groupsPage, setGroupsPage] = React.useState(1);
  const [groups, setGroups] = React.useState(undefined);
  const [isReady, setIsReady] = React.useState(false);

  const refMembers = React.useRef([]);

  React.useEffect(() => {
    setIsReady(false);
    apiLegalGroupList(groupsPage).then((response) => {
      if (response.status === 200) {
        setGroups(response.data);
      }
    });
    setIsReady(true);
  }, [setGroups, setIsReady, groupsPage, i18n.resolvedLanguage]);

  function handleChangeGroupsPage(value: number) {
    setIsReady(false);
    setGroupsPage(value);
  }

  React.useEffect(() => {
    if (groups != null && refMembers != null) {
      for (let i = 0; i < groups.results.length; i++) {
        for (let j = 0; j < groups.results[i].teams.length; j++) {
          const memberTeamIds = groups.results[i].teams[j].members.map(
            (member: any) => member.id,
          );
          const memberIds = Object.keys(refMembers.current);
          const members = Object.values(refMembers.current).filter(
            (member: any, i: number, row: any) =>
              memberTeamIds.includes(memberIds[i]),
          );
          const width = Math.max(
            150,
            ...members.map((member: any) => member.offsetWidth),
          );
          for (let j = 0; j < members.length; j++) {
            members[j].style.minWidth = width + "px";
          }
        }
      }
    }
  }, [groups]);

  const content = (
    <>
      <Box className={styles.aboutTeamContainerBox}>
        {groups &&
          groups.results.length > 0 &&
          groups.results.map((group: any) => {
            const teamYearFrom = group.date_from.slice(0, 4);
            const teamYearTo = group.date_to
              ? group.date_to.slice(0, 4)
              : new Date().getFullYear().toString();
            return (
              <>
                {group.teams.map((team: any, i: number, row: any) => {
                  const teamUserMembers = Object.values(
                    team.members &&
                      team.members.length > 0 &&
                      team.members.reduce((foundMembers: any, member: any) => {
                        if (!foundMembers[member.user.id]) {
                          foundMembers[member.user.id] = {
                            user: member.user,
                            members: [],
                          };
                        }
                        foundMembers[member.user.id].members.push(member);
                        return foundMembers;
                      }, {}),
                  );
                  return (
                    <>
                      <Box className={styles.aboutTeamBox} key={team.id}>
                        <Typography
                          variant="h5"
                          fontWeight="600"
                          component="div"
                          className={styles.aboutTeamBoxTitle}
                        >
                          {team.name}
                          {isReady &&
                            groupsPage !== 1 &&
                            " " +
                              teamYearFrom +
                              (teamYearFrom !== teamYearTo &&
                                "/" + teamYearTo.slice(2, 4))}
                        </Typography>
                        <Grid
                          container
                          spacing={3}
                          className={styles.aboutTeamGrid}
                        >
                          {teamUserMembers.map((userMember: any) => {
                            return (
                              <Grid
                                key={userMember.id}
                                direction="column"
                                display="flex"
                                alignItems="center"
                                flexDirection="column"
                                ref={(ref) => {
                                  refMembers.current[userMember.members[0].id] =
                                    ref;
                                }}
                              >
                                <Avatar
                                  alt={
                                    userMember.user.firstname +
                                    " " +
                                    userMember.user.lastname
                                  }
                                  src={
                                    BACKEND_BASE_URL +
                                    userMember.members[0].picture
                                  }
                                  className={styles.aboutTeamAvatar}
                                />
                                <Typography variant="body1" fontWeight="600">
                                  {userMember.user.firstname}{" "}
                                  {userMember.user.lastname}
                                </Typography>
                                {groupsPage === 1 &&
                                  userMember.user.contact &&
                                  userMember.user.contact.emails.length > 0 &&
                                  userMember.user.contact.emails.map(
                                    (contactEmail: any) => (
                                      <Typography variant="body2">
                                        <Link
                                          href={"mailto:" + contactEmail.email}
                                          underline="none"
                                          color="textDisabled"
                                        >
                                          {contactEmail.email}
                                        </Link>
                                      </Typography>
                                    ),
                                  )}
                                {userMember.members.map((member: any) => {
                                  const memberDateFrom =
                                    member.date_from &&
                                    member.date_from !== group.date_from &&
                                    new Date(member.date_from) < new Date()
                                      ? new Date(
                                          member.date_from,
                                        ).toLocaleDateString(
                                          languageToLocale(
                                            i18n.resolvedLanguage,
                                          ).code,
                                          {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                          },
                                        )
                                      : undefined;
                                  const memberDateTo =
                                    member.date_to &&
                                    (!group.date_to ||
                                      member.date_to !== group.date_to) &&
                                    new Date(member.date_to) < new Date()
                                      ? new Date(
                                          member.date_to,
                                        ).toLocaleDateString(
                                          languageToLocale(
                                            i18n.resolvedLanguage,
                                          ).code,
                                          {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                          },
                                        )
                                      : undefined;

                                  return (
                                    <>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                      >
                                        {member.role.name}
                                      </Typography>
                                      {(memberDateFrom || memberDateTo) && (
                                        <Typography
                                          variant="caption"
                                          color="textSecondary"
                                        >
                                          {memberDateFrom &&
                                            memberDateFrom + " "}
                                          {"-"}
                                          {memberDateTo && " " + memberDateTo}
                                        </Typography>
                                      )}
                                    </>
                                  );
                                })}
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                      {i + 1 < row.length && <Divider />}
                    </>
                  );
                })}
              </>
            );
          })}
        {groups &&
          groups.results.length > 0 &&
          (groupsPage !== 1 || groups.count > groups.results.length) && (
            <Stack alignItems="center">
              <Pagination
                page={groupsPage}
                count={Math.ceil(groups.count / API_LEGAL_GROUP_LIST_PAGE_SIZE)}
                onChange={(e: any, value: number) =>
                  handleChangeGroupsPage(value)
                }
              />
            </Stack>
          )}
      </Box>
    </>
  );

  return (
    <PageImageHero
      title={t("pages.about-team.title")}
      content={content}
      hero={ImageHeroAboutTeam}
      loading={!groups}
    />
  );
}

export default AboutTeamPage;
