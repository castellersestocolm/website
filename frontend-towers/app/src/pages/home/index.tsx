import Box from "@mui/material/Box";
import ImageHero from "../../assets/images/hero.jpg";
import ImageJoin from "../../assets/images/join.jpg";
import styles from "./styles.module.css";
import {
    Button,
    CardContent,
    Container,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stack,
    Typography
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import IconLogoColour from "../../components/IconLogoColour/IconLogoColour.jsx";
import IconTbana from "../../components/IconTbana/IconTbana.jsx";
import Grid from "@mui/material/Grid2";
import IconSchedule from "@mui/icons-material/Schedule";
import IconPlace from "@mui/icons-material/Place";
import IconBackpack from "@mui/icons-material/Backpack";
import IconGroups from "@mui/icons-material/Groups";
import IconSportsGymnastics from "@mui/icons-material/SportsGymnastics";
import IconEmergency from "@mui/icons-material/Emergency";
import IconLoyalty from "@mui/icons-material/Loyalty";
import IconCreditCardOff from "@mui/icons-material/CreditCardOff";
import IconCheckroom from "@mui/icons-material/Checkroom";
import IconPayment from "@mui/icons-material/Payment";
import IconVisibility from "@mui/icons-material/Visibility";
import IconNaturePeople from "@mui/icons-material/NaturePeople";
import IconFitnessCenter from "@mui/icons-material/FitnessCenter";
import IconLocalActivity from "@mui/icons-material/LocalActivity";
import IconAcUnit from "@mui/icons-material/AcUnit";
import IconMic from "@mui/icons-material/Mic";
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';

function HomePage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Box component="section" className={styles.hero}>
        <Container maxWidth="xl">
          <Grid container spacing={2} className={styles.heroGrid}>
            <Grid size={6}>
              <IconLogoColour />
              <Typography
                variant="h3"
                fontWeight="700"
                className={styles.heroTitle}
              >
                {t("pages.home-hero.title")}
              </Typography>
              <Typography
                variant="h5"
                fontWeight="700"
                className={styles.heroSubtitle}
              >
                {t("pages.home-hero.subtitle")}
              </Typography>
              <Typography variant="h6" className={styles.heroSubtitle}>
                {t("pages.home-hero.subtitle2")}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Box
                className={styles.heroImage}
                style={{ backgroundImage: "url(" + ImageHero + ")" }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box component="section" className={styles.rehearsals}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight="700"
            className={styles.rehearsalsTitle}
          >
            {t("pages.home-rehearsals.title")}
          </Typography>
          <Grid container spacing={4} className={styles.rehearsalsGrid}>
            <Grid size={5}>
              <React.Fragment>
                <CardContent className={styles.rehearsalsCard}>
                  <IconSchedule className={styles.rehearsalsIcon} />
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight="600"
                      className={styles.rehearsalsCardTitle}
                    >
                      {t("pages.home-rehearsals.box1.title")}
                    </Typography>
                    <Typography className={styles.rehearsalsCardText}>
                      {t("pages.home-rehearsals.box1.text1")}
                    </Typography>
                    <Typography className={styles.rehearsalsCardText2}>
                      {t("pages.home-rehearsals.box1.text2")}
                    </Typography>
                  </Box>
                </CardContent>
              </React.Fragment>
              <React.Fragment>
                <CardContent className={styles.rehearsalsCard}>
                  <IconPlace className={styles.rehearsalsIcon} />
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight="600"
                      className={styles.rehearsalsCardTitle}
                    >
                      {t("pages.home-rehearsals.box2.title")}
                    </Typography>
                    <Typography className={styles.rehearsalsCardText}>
                      {t("pages.home-rehearsals.box2.text1-1")}{" ("}
                        <IconTbana />
                      {t("pages.home-rehearsals.box2.text1-2")}{")"}
                    </Typography>
                    <Typography className={styles.rehearsalsCardText2}>
                      {t("pages.home-rehearsals.box2.text2")}
                    </Typography>
                  </Box>
                </CardContent>
              </React.Fragment>
              <React.Fragment>
                <CardContent className={styles.rehearsalsCard}>
                  <IconBackpack className={styles.rehearsalsIcon} />
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight="600"
                      className={styles.rehearsalsCardTitle}
                    >
                      {t("pages.home-rehearsals.box3.title")}
                    </Typography>
                    <Typography className={styles.rehearsalsCardText}>
                      {t("pages.home-rehearsals.box3.text1")}
                    </Typography>
                  </Box>
                </CardContent>
              </React.Fragment>
            </Grid>
            <Grid size={7}>
              <iframe
                title="calendar"
                className={styles.calendarEmbed}
                src="https://calendar.google.com/calendar/embed?height=600&wkst=2&ctz=Europe%2FStockholm&bgcolor=%23ffffff&showTitle=0&hl=en_GB&showTz=0&showCalendars=0&showPrint=0&title=Castellers%20d'Estocolm&src=Y19jMzM5YTdmZWI1YzA5YzEyNTE2OTU1ODMwNjg3ZmI3MDY1YTVmODgzYTZiZGNiYTc0Y2U1NzgxMTIzYjJjN2Y2QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&color=%238E24AA"
              ></iframe>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box component="section" className={styles.join}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={4}>
              <Box
                className={styles.joinImage}
                style={{ backgroundImage: "url(" + ImageJoin + ")" }}
              />
            </Grid>
            <Grid size={8}>
              <Typography
            variant="h3"
            fontWeight="700"
            className={styles.joinTitle}
          >
            {t("pages.home-join.title")}
          </Typography>
          <Grid container spacing={1} className={styles.joinGrid}>
            <Grid size={12}>
              <Typography
            variant="h5"
            fontWeight="700" className={styles.joinListTitle}
          >
            {t("pages.home-join.list.title")}
              </Typography></Grid>
            <Grid size={12} className={styles.joinList}>
              <List dense={true}>
              <ListItem>
                  <ListItemIcon>
                    <IconGroups />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("pages.home-join.list.item-1.title")}
                    secondary={t("pages.home-join.list.item-1.subtitle") ? t("pages.home-join.list.item-1.subtitle") : null}
                  />
                </ListItem>
              <ListItem>
                  <ListItemIcon>
                    <IconSportsGymnastics />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("pages.home-join.list.item-2.title")}
                    secondary={t("pages.home-join.list.item-2.subtitle") ? t("pages.home-join.list.item-2.subtitle") : null}
                  />
                </ListItem>
              <ListItem>
                  <ListItemIcon>
                    <IconEmergency />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("pages.home-join.list.item-3.title")}
                    secondary={t("pages.home-join.list.item-3.subtitle") ? t("pages.home-join.list.item-3.subtitle") : null}
                  />
                </ListItem>
              <ListItem>
                  <ListItemIcon>
                    <IconLoyalty />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("pages.home-join.list.item-4.title")}
                    secondary={t("pages.home-join.list.item-4.subtitle") ? t("pages.home-join.list.item-4.subtitle") : null}
                  />
                </ListItem>
              <ListItem>
                  <ListItemIcon>
                    <IconCreditCardOff />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("pages.home-join.list.item-5.title")}
                    secondary={t("pages.home-join.list.item-5.subtitle") ? t("pages.home-join.list.item-5.subtitle") : null}
                  />
                </ListItem>
              </List></Grid>
              <Grid size={12}>
              <Typography
            variant="h5"
            fontWeight="700" className={styles.joinListTitle}
          >
            {t("pages.home-join.list-like.title")}
              </Typography></Grid>
              <Grid size={12} className={styles.joinList}>
              <List dense={true}>
              <ListItem>
                  <ListItemIcon>
                    <IconCheckroom />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("pages.home-join.list-like.item-1.title")}
                    secondary={t("pages.home-join.list-like.item-1.subtitle") ? t("pages.home-join.list-like.item-1.subtitle") : null}
                  />
                </ListItem>
              <ListItem>
                  <ListItemIcon>
                    <IconPayment />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("pages.home-join.list-like.item-2.title")}
                    secondary={t("pages.home-join.list-like.item-2.subtitle") ? t("pages.home-join.list-like.item-2.subtitle") : null}
                  />
                </ListItem>
              </List>
              </Grid>
            <Grid size={12}>
        <Stack direction="row" spacing={2} className={styles.joinButtons}>
        <Button variant="contained" href="/user/join" disableElevation>{t("pages.home-join.list.button-join")}</Button>
        </Stack>
          </Grid>
          </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box component="section" className={styles.timeline}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight="700"
            className={styles.timelineTitle}
          >
            {t("pages.home-timeline.title")}
          </Typography>
          <Grid container spacing={4} className={styles.timelineGrid}>
              <Timeline position="alternate">
      <TimelineItem>
        <TimelineOppositeContent
          sx={{ m: 'auto 0' }}
          align="right"
          variant="body2"
          color="text.secondary"
        >
          {t("pages.home-timeline.item-1.time")}
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineConnector />
          <TimelineDot color="primary">
            <IconGroups className={styles.timelineIcon} />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="h6" component="span">
            {t("pages.home-timeline.item-1.title")}
          </Typography>
          <Typography>{t("pages.home-timeline.item-1.subtitle")}</Typography>
        </TimelineContent>
      </TimelineItem>
                  <TimelineItem>
        <TimelineOppositeContent
          sx={{ m: 'auto 0' }}
          variant="body2"
          color="text.secondary"
        >
          {t("pages.home-timeline.item-2.time")}
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineConnector />
          <TimelineDot color="primary">
            <IconVisibility className={styles.timelineIcon} />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="h6" component="span">
            {t("pages.home-timeline.item-2.title")}
          </Typography>
          <Typography>{t("pages.home-timeline.item-2.subtitle")}</Typography>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineOppositeContent
          sx={{ m: 'auto 0' }}
          align="right"
          variant="body2"
          color="text.secondary"
        >
          {t("pages.home-timeline.item-3.time")}
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineConnector />
          <TimelineDot color="primary">
            <IconNaturePeople className={styles.timelineIcon} />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="h6" component="span">
            {t("pages.home-timeline.item-3.title")}
          </Typography>
          <Typography>{t("pages.home-timeline.item-3.subtitle")}</Typography>
        </TimelineContent>
      </TimelineItem>
                  <TimelineItem>
        <TimelineOppositeContent
          sx={{ m: 'auto 0' }}
          variant="body2"
          color="text.secondary"
        >
          {t("pages.home-timeline.item-4.time")}
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineConnector />
          <TimelineDot color="primary">
            <IconFitnessCenter className={styles.timelineIcon} />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="h6" component="span">
            {t("pages.home-timeline.item-4.title")}
          </Typography>
          <Typography>{t("pages.home-timeline.item-4.subtitle")}</Typography>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineOppositeContent
          sx={{ m: 'auto 0' }}
          align="right"
          variant="body2"
          color="text.secondary"
        >
          {t("pages.home-timeline.item-5.time")}
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineConnector />
          <TimelineDot color="primary">
            <IconLocalActivity className={styles.timelineIcon} />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="h6" component="span">
            {t("pages.home-timeline.item-5.title")}
          </Typography>
          <Typography>{t("pages.home-timeline.item-5.subtitle")}</Typography>
        </TimelineContent>
      </TimelineItem>
                  <TimelineItem>
        <TimelineOppositeContent
          sx={{ m: 'auto 0' }}
          variant="body2"
          color="text.secondary"
        >
          {t("pages.home-timeline.item-6.time")}
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineConnector />
          <TimelineDot color="primary">
            <IconAcUnit className={styles.timelineIcon} />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="h6" component="span">
            {t("pages.home-timeline.item-6.title")}
          </Typography>
          <Typography>{t("pages.home-timeline.item-6.subtitle")}</Typography>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineOppositeContent
          sx={{ m: 'auto 0' }}
          align="right"
          variant="body2"
          color="text.secondary"
        >
          {t("pages.home-timeline.item-7.time")}
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineConnector />
          <TimelineDot color="primary">
            <IconMic className={styles.timelineIcon} />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="h6" component="span">
            {t("pages.home-timeline.item-7.title")}
          </Typography>
          <Typography>{t("pages.home-timeline.item-7.subtitle")}</Typography>
        </TimelineContent>
      </TimelineItem>
              </Timeline>
          </Grid>
        </Container>
      </Box>
      <Box component="section">
        <object
          className={styles.mapEmbed}
          aria-label="map"
          data="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d10549.351169868873!2d17.99051515699911!3d59.35840008798483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNTnCsDIxJzI3LjQiTiAxN8KwNTknMzguOCJF!5e0!3m2!1sca!2sse!4v1726217485573!5m2!1sca!2sse"
        ></object>
      </Box>
    </>
  );
}

export default HomePage;
