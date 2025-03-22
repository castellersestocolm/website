import styles from "./styles.module.css";
import { Avatar, Container, Divider, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import ImageHeroAboutTeam from "../../assets/images/heros/about-team.jpg";
import { useTranslation } from "react-i18next";
import Alerts from "../../components/Alerts/Alerts";
import Grid from "@mui/material/Grid2";
import { apiLegalTeamList } from "../../api";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_API_BASE_URL).origin;

function AboutTeamPage() {
  const [t, i18n] = useTranslation("common");

  const [teams, setTeams] = React.useState(undefined);

  React.useEffect(() => {
    apiLegalTeamList().then((response) => {
      if (response.status === 200) {
        setTeams(response.data.results);
      }
    });
  }, [setTeams, i18n.resolvedLanguage]);

  return (
    <>
      <Box
        component="section"
        className={styles.aboutTeam}
        sx={{
          marginTop: { xs: "57px", md: "65px" },
          padding: { xs: "32px 0", md: "64px 0" },
        }}
      >
        <Grid
          direction="column"
          display="flex"
          alignItems="center"
          flexDirection="column"
        >
          <Container className={styles.heroContainer}>
            <Box className={styles.aboutTeamTitleBox}>
              <Typography
                variant="h3"
                fontWeight="700"
                className={styles.aboutTeamTitle}
              >
                {t("pages.about-team.title")}
              </Typography>
            </Box>
            <Box
              sx={{ height: { xs: "300px", md: "500px" } }}
              className={styles.heroImage}
              style={{ backgroundImage: "url(" + ImageHeroAboutTeam + ")" }}
            />
          </Container>
          <Container
            maxWidth="xl"
            sx={{
              marginTop: { xs: "16px", md: "32px" },
              paddingTop: { xs: "32px", md: "64px" },
              paddingBottom: { xs: "32px", md: "64px" },
            }}
          >
            <Alerts />
            <Box className={styles.aboutTeamContainerBox}>
              {teams &&
                teams.length > 0 &&
                teams.map((team: any, i: number, row: any) => (
                  <>
                    <Box className={styles.aboutTeamBox}>
                      <Typography
                        variant="h5"
                        fontWeight="600"
                        component="div"
                        className={styles.aboutTeamBoxTitle}
                      >
                        {team.name}
                      </Typography>
                      <Grid
                        container
                        spacing={4}
                        className={styles.aboutTeamGrid}
                      >
                        {team.members &&
                          team.members.length > 0 &&
                          team.members.map((member: any) => (
                            <Grid
                              direction="column"
                              display="flex"
                              alignItems="center"
                              flexDirection="column"
                              className={styles.aboutTeamBoxMember}
                            >
                              <Avatar
                                alt={
                                  member.user.firstname +
                                  " " +
                                  member.user.lastname
                                }
                                src={BACKEND_BASE_URL + member.picture}
                                className={styles.aboutTeamAvatar}
                              />
                              <Typography variant="body1" fontWeight="600">
                                {member.user.firstname} {member.user.lastname}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {member.role.name}
                              </Typography>
                            </Grid>
                          ))}
                      </Grid>
                    </Box>
                    {i + 1 < row.length && <Divider />}
                  </>
                ))}
            </Box>
          </Container>
        </Grid>
      </Box>
    </>
  );
}

export default AboutTeamPage;
