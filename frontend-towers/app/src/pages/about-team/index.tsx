import styles from "./styles.module.css";
import { Avatar, Divider, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import ImageHeroAboutTeam from "../../assets/images/heros/about-team.jpg";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid2";
import { apiLegalTeamList } from "../../api";
import PageImageHero from "../../components/PageImageHero/PageImageHero";

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

  const content = (
    <>
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
                <Grid container spacing={4} className={styles.aboutTeamGrid}>
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
                            member.user.firstname + " " + member.user.lastname
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
    </>
  );

  return (
    <PageImageHero
      title={t("pages.about-team.title")}
      content={content}
      hero={ImageHeroAboutTeam}
    />
  );
}

export default AboutTeamPage;
