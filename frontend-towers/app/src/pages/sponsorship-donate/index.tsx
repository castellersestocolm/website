import styles from "./styles.module.css";
import {
  Typography,
  List,
  ListItemText,
  Card,
  Divider,
  ListItemButton,
  ListItemIcon,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { apiSponsorshipPageGet } from "../../api";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import ImageHeroSponsorshipDonate from "../../assets/images/heros/sponsorship-donate.jpg";
import MarkdownText from "../../components/MarkdownText/MarkdownText";
import { REWARD_TYPE_ICON, RewardType } from "../../enums";
import IconRule from "@mui/icons-material/Rule";
import { DynamicIcon } from "../../components/DynamicIcon/DynamicIcon";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_TOWERS_API_URL).origin;

function SponsorshipDonatePage() {
  const [t, i18n] = useTranslation("common");

  const [sponsorship, setSponsorship] = React.useState(undefined);

  React.useEffect(() => {
    apiSponsorshipPageGet("help-us").then((response) => {
      if (response.status === 200) {
        setSponsorship(response.data);
      }
    });
  }, [setSponsorship, i18n.resolvedLanguage]);

  const content = (
    <>
      <Box mb={5}>
        <Typography variant="h5" fontWeight={700} mb={1}>
          {t("pages.sponsorship-donate.section-1.title")}
        </Typography>
        <Typography variant="body1">
          <MarkdownText text={t("pages.sponsorship-donate.section-1.body-1")} />
        </Typography>
      </Box>
      <Box>
        <Typography variant="h5" fontWeight={700} mb={1}>
          {t("pages.sponsorship-donate.tiers.title")}
        </Typography>
        <Typography variant="body1" mb={2}>
          <MarkdownText text={t("pages.sponsorship-donate.tiers.body-1")} />
        </Typography>

        <Grid container spacing={3}>
          {sponsorship &&
            sponsorship.tiers &&
            sponsorship.tiers.length > 0 &&
            sponsorship.tiers.map((sponsorshipTier: any) => {
              const rewardGroups =
                sponsorshipTier.reward_groups &&
                sponsorshipTier.reward_groups.length > 0 &&
                sponsorshipTier.reward_groups.filter(
                  (rewardGroup: any) =>
                    rewardGroup.rewards && rewardGroup.rewards.length > 0,
                );

              return (
                <Grid container size={{ xs: 12, md: 6, lg: 4 }} direction="row">
                  <Card variant="outlined" className={styles.workshopsCard}>
                    <Box className={styles.workshopsTopBox}>
                      <Typography variant="h6" fontWeight={600}>
                        <MarkdownText text={sponsorshipTier.name} />
                      </Typography>
                    </Box>
                    <Divider />
                    <Box className={styles.rewardGroupBox}>
                      <Box className={styles.workshopsBottomBox}>
                        <Typography variant="body1" component="div">
                          <MarkdownText text={sponsorshipTier.description} />
                        </Typography>
                      </Box>
                      {rewardGroups && (
                        <>
                          <Divider />
                          {rewardGroups.map((rewardGroup: any) => {
                            const mustSelectAmount =
                              rewardGroup.max_rewards <
                              rewardGroup.rewards.length;

                            return (
                              <Grid container direction="row">
                                {mustSelectAmount && (
                                  <Grid
                                    size="auto"
                                    className={styles.rewardSelectGrid}
                                  >
                                    <IconRule />
                                    <Typography variant="body2" component="div">
                                      {t(
                                        "pages.sponsorship-donate.tiers.rewards-max",
                                      )}{" "}
                                      {rewardGroup.max_rewards}
                                    </Typography>
                                  </Grid>
                                )}
                                <Grid size="grow">
                                  <List className={styles.userFamilyList}>
                                    {rewardGroup.rewards.map(
                                      (reward: any, i: number, row: any) => (
                                        <>
                                          <Box key={reward.id}>
                                            <ListItemButton
                                              disableTouchRipple
                                              dense
                                            >
                                              <ListItemIcon
                                                className={styles.eventCardIcon}
                                              >
                                                {reward.type ===
                                                  RewardType.PRODUCT &&
                                                reward.product &&
                                                reward.product.images &&
                                                reward.product.images.length >
                                                  0 ? (
                                                  <img
                                                    src={
                                                      BACKEND_BASE_URL +
                                                      reward.product.images[0]
                                                        .picture
                                                    }
                                                    alt={reward.product.name}
                                                    className={
                                                      styles.eventCardImage
                                                    }
                                                  />
                                                ) : reward.icon ? <DynamicIcon iconName={reward.icon.code} /> : (
                                                  REWARD_TYPE_ICON[reward.type]
                                                )}
                                              </ListItemIcon>
                                              <ListItemText
                                                primary={
                                                  <Typography
                                                    variant="body2"
                                                    component="div"
                                                  >
                                                    {reward.type ===
                                                      RewardType.PRODUCT &&
                                                    reward.product ? (
                                                      <Typography
                                                        variant="body2"
                                                        component="div"
                                                      >
                                                        {reward.product.name}
                                                      </Typography>
                                                    ) : reward.type ===
                                                        RewardType.NEWSLETTER &&
                                                      reward.newsletter ? (
                                                      <Typography
                                                        variant="body2"
                                                        component="div"
                                                      >
                                                        {t(
                                                          "pages.sponsorship-donate.tiers.rewards.newsletter",
                                                        )}
                                                        {' "'}
                                                        {reward.newsletter.name}
                                                        {'"'}
                                                      </Typography>
                                                    ) : (
                                                      reward.name
                                                    )}
                                                  </Typography>
                                                }
                                                secondary={
                                                  reward.description && (
                                                    <Typography
                                                      variant="body2"
                                                      component="div"
                                                      color="textSecondary"
                                                    >
                                                      {reward.description}
                                                    </Typography>
                                                  )
                                                }
                                              />
                                            </ListItemButton>
                                          </Box>
                                          <Divider />
                                        </>
                                      ),
                                    )}
                                  </List>
                                </Grid>
                              </Grid>
                            );
                          })}
                        </>
                      )}
                    </Box>
                  </Card>
                </Grid>
              );
            })}
        </Grid>
      </Box>
    </>
  );

  return (
    <PageImageHero
      title={t("pages.sponsorship-donate.title")}
      subtitle={t("pages.sponsorship-donate.subtitle")}
      content={content}
      hero={ImageHeroSponsorshipDonate}
      loading={!sponsorship}
    />
  );
}

export default SponsorshipDonatePage;
