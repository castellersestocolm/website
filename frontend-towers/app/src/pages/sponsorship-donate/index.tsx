import styles from "./styles.module.css";
import {
  Typography,
  List,
  ListItemText,
  Card,
  Divider,
  ListItemButton,
  ListItemIcon,
  Stack,
  Button,
  FormHelperText,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { apiMembershipList, apiSponsorshipPageGet } from "../../api";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import ImageHeroSponsorshipDonate from "../../assets/images/heros/sponsorship-donate.jpg";
import MarkdownText from "../../components/MarkdownText/MarkdownText";
import { REWARD_TYPE_ICON, RewardType } from "../../enums";
import IconRule from "@mui/icons-material/Rule";
import { DynamicIcon } from "../../components/DynamicIcon/DynamicIcon";
import { compareTierPrice } from "../../utils/sort";
import { useAppContext } from "../../components/AppContext/AppContext";
import Checkbox from "@mui/material/Checkbox";
import FormLabel from "@mui/material/FormLabel";
import Select from "@mui/material/Select";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import { useState } from "react";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_TOWERS_API_URL).origin;

function SponsorshipDonatePage() {
  const [t, i18n] = useTranslation("common");

  const [sponsorship, setSponsorship] = React.useState(undefined);
  const [membership, setMembership] = React.useState(undefined);
  const [rewardIdsSelected, setRewardIdsSelected] = React.useState<any>({});
  const [currencies, setCurrencies] = React.useState([]);
  const [currency, setCurrency] = React.useState(undefined);
  const [validationErrors, setValidationErrors] = useState(undefined);

  const { user } = useAppContext();

  React.useEffect(() => {
    if (user) {
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
    }
  }, [user, i18n.resolvedLanguage, setMembership, t]);

  React.useEffect(() => {
    apiSponsorshipPageGet("donate").then((response) => {
      if (response.status === 200) {
        setSponsorship(response.data);
      }
    });
  }, [setSponsorship, i18n.resolvedLanguage]);

  React.useEffect(() => {
    if (sponsorship) {
      setRewardIdsSelected(
        Object.fromEntries(
          sponsorship.tiers.map((sponsorshipTier: any) => [
            sponsorshipTier.id,
            sponsorshipTier.reward_groups &&
            sponsorshipTier.reward_groups.length > 0
              ? Object.fromEntries(
                  sponsorshipTier.reward_groups.map((rewardGroup: any) => [
                    rewardGroup.id,
                    rewardGroup.rewards && rewardGroup.rewards.length > 0
                      ? rewardGroup.rewards
                          .map((reward: any) => reward.id)
                          .slice(
                            0,
                            Math.min(
                              rewardGroup.min_rewards,
                              rewardGroup.max_rewards,
                            ),
                          )
                      : {},
                  ]),
                )
              : {},
          ]),
        ),
      );
    } else {
      setRewardIdsSelected({});
    }
  }, [sponsorship, setRewardIdsSelected]);

  React.useEffect(() => {
    if (sponsorship) {
      setCurrencies(
        sponsorship.tiers && sponsorship.tiers.length > 0
          ? [
              ...new Set(
                sponsorship.tiers
                  .filter(
                    (sponsorshipTier: any) =>
                      sponsorshipTier.prices &&
                      sponsorshipTier.prices.length > 0,
                  )
                  .map((sponsorshipTier: any) =>
                    sponsorshipTier.prices
                      .map((tierPrice: any) => [
                        tierPrice.amount.currency,
                        ...Object.keys(tierPrice.amount.exchange),
                      ])
                      .flat(),
                  )
                  .flat(),
              ),
            ].sort()
          : [],
      );
      setCurrency(
        sponsorship.tiers && sponsorship.tiers.length > 0
          ? sponsorship.tiers
              .filter(
                (sponsorshipTier: any) =>
                  sponsorshipTier.prices && sponsorshipTier.prices.length > 0,
              )
              .map((sponsorshipTier: any) =>
                sponsorshipTier.prices.map(
                  (tierPrice: any) => tierPrice.amount.currency,
                ),
              )
              .flat()[0]
          : undefined,
      );
    } else {
      setCurrencies([]);
      setCurrency(undefined);
    }
  }, [sponsorship, setCurrencies, setCurrency]);

  const handleRewardCheckbox = (
    event: React.ChangeEvent<HTMLInputElement>,
    tier: any,
    rewardGroup: any,
    reward: any,
  ) => {
    const rewardIdsCurrent = rewardIdsSelected[tier.id][rewardGroup.id];

    if (event.target.checked) {
      const rewardIdsNew = [
        ...rewardIdsCurrent.slice(0, Math.max(0, rewardGroup.max_rewards - 1)),
        reward.id,
      ];
      setRewardIdsSelected({
        ...rewardIdsSelected,
        [tier.id]: {
          ...rewardIdsSelected[tier.id],
          [rewardGroup.id]: rewardIdsNew,
        },
      });
    } else {
      const rewardIdsNew = rewardIdsCurrent.filter(
        (rewardId: string) => rewardId !== reward.id,
      );
      setRewardIdsSelected({
        ...rewardIdsSelected,
        [tier.id]: {
          ...rewardIdsSelected[tier.id],
          [rewardGroup.id]: rewardIdsNew,
        },
      });
    }
  };

  const userMembershipModules =
    membership &&
    membership.modules.map((membershipModule: any) => membershipModule.module);

  const content = (
    <>
      <Box mb={5}>
        <Typography variant="h5" fontWeight={700} mb={1}>
          {t("pages.sponsorship-donate.section-1.title")}
        </Typography>
        <Typography variant="body1" mb={1}>
          <MarkdownText text={t("pages.sponsorship-donate.section-1.body-1")} />
        </Typography>
        <Typography variant="body1" mb={1}>
          <MarkdownText text={t("pages.sponsorship-donate.section-1.body-2")} />
        </Typography>
        <Typography variant="body1" mb={1}>
          <MarkdownText text={t("pages.sponsorship-donate.section-1.body-3")} />
        </Typography>
        <Typography variant="body1" mb={1}>
          <MarkdownText text={t("pages.sponsorship-donate.section-1.body-4")} />
        </Typography>
      </Box>
      <Box mb={5}>
        <Typography variant="h5" fontWeight={700} mb={1}>
          {t("pages.sponsorship-donate.tiers.title")}
        </Typography>
        <Typography variant="body1" mb={2}>
          <MarkdownText text={t("pages.sponsorship-donate.tiers.body-1")} />
        </Typography>
        <Grid container spacing={3}>
          <Grid
            container
            size={{ xs: 12, md: 3, lg: 2 }}
            direction="column"
            className={styles.tierGrid}
          >
            <FormGrid>
              <FormLabel htmlFor="currency">
                {t("pages.sponsorship-donate.tiers.currency-select.label")}
              </FormLabel>
              <Select
                id="currency"
                name="currency"
                type="text"
                autoComplete="currency"
                size="small"
                input={<OutlinedInput />}
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                MenuProps={MenuProps}
                variant="standard"
              >
                {currencies &&
                  currencies.map((currencyCurrent: any, i: number) => {
                    return (
                      <MenuItem
                        key={currencyCurrent}
                        value={currencyCurrent}
                        selected={currency === currencyCurrent}
                      >
                        {currencyCurrent}
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormGrid>
          </Grid>
        </Grid>
      </Box>
      <form
      // onSubmit={handleSubmit}
      >
        {!user && (
          <Box mb={5}>
            <Typography variant="h5" fontWeight={700} mb={1}>
              {t("pages.sponsorship-donate.tiers.form.entity-title")}
            </Typography>
            <Grid container spacing={3}>
              <FormGrid size={{ xs: 12, md: 3 }}>
                <FormLabel htmlFor="firstname" required>
                  {t("pages.user-join.form.first-name")}
                </FormLabel>
                <OutlinedInput
                  id="firstname"
                  name="firstname"
                  type="text"
                  placeholder="Namn"
                  autoComplete="first name"
                  required
                  size="small"
                  disabled={user}
                  defaultValue={user && user.firstname}
                  error={
                    validationErrors &&
                    validationErrors.entity &&
                    validationErrors.entity.firstname
                  }
                />
                {validationErrors &&
                  validationErrors.entity &&
                  validationErrors.entity.firstname && (
                    <FormHelperText error>
                      {validationErrors.entity.firstname[0].detail}
                    </FormHelperText>
                  )}
              </FormGrid>
              <FormGrid size={{ xs: 12, md: 3 }}>
                <FormLabel htmlFor="lastname" required>
                  {t("pages.user-join.form.last-name")}
                </FormLabel>
                <OutlinedInput
                  id="lastname"
                  name="lastname"
                  type="text"
                  placeholder="Namnsson"
                  autoComplete="last name"
                  required
                  size="small"
                  disabled={user}
                  defaultValue={user && user.lastname}
                  error={
                    validationErrors &&
                    validationErrors.entity &&
                    validationErrors.entity.lastname
                  }
                />
                {validationErrors &&
                  validationErrors.entity &&
                  validationErrors.entity.lastname && (
                    <FormHelperText error>
                      {validationErrors.entity.lastname[0].detail}
                    </FormHelperText>
                  )}
              </FormGrid>
              <FormGrid size={{ xs: 12, md: 3 }} className={styles.field}>
                <FormLabel htmlFor="email" required>
                  {t("pages.user-join.form.email")}
                </FormLabel>
                <OutlinedInput
                  id="email"
                  name="email"
                  type="email"
                  placeholder="namn@namnsson.se"
                  autoComplete="email"
                  disabled={user}
                  defaultValue={user && user.email}
                  error={
                    validationErrors &&
                    validationErrors.entity &&
                    validationErrors.entity.email
                  }
                  required
                  size="small"
                />
                {validationErrors &&
                  validationErrors.entity &&
                  validationErrors.entity.email && (
                    <FormHelperText error>
                      {validationErrors.entity.email[0].detail}
                    </FormHelperText>
                  )}
              </FormGrid>
              <FormGrid size={{ xs: 12, md: 3 }} className={styles.field}>
                <FormLabel htmlFor="phone" required>
                  {t("pages.user-join.form.phone")}
                </FormLabel>
                <OutlinedInput
                  id="phone"
                  name="phone"
                  type="phone"
                  placeholder="+4687461000"
                  autoComplete="phone"
                  disabled={user}
                  defaultValue={user && user.phone}
                  error={
                    validationErrors &&
                    validationErrors.entity &&
                    validationErrors.entity.phone
                  }
                  required
                  size="small"
                />
                {validationErrors &&
                  validationErrors.entity &&
                  validationErrors.entity.phone && (
                    <FormHelperText error>
                      {validationErrors.entity.phone[0].detail}
                    </FormHelperText>
                  )}
              </FormGrid>
            </Grid>
          </Box>
        )}
        <Box>
          <Typography variant="h5" fontWeight={700} mb={2}>
            {t("pages.sponsorship-donate.tiers.form.tier-title")}
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
                const tierPrice =
                  sponsorshipTier.prices &&
                  sponsorshipTier.prices.length > 0 &&
                  sponsorshipTier.prices
                    .sort(compareTierPrice)
                    .find(
                      (tierPrice: any) =>
                        !tierPrice.module ||
                        (userMembershipModules &&
                          userMembershipModules.includes(tierPrice.module)),
                    );

                return (
                  <Grid
                    container
                    size={{ xs: 12, md: 6, lg: 4 }}
                    gap={3}
                    direction="column"
                    className={styles.tierGrid}
                  >
                    <Card variant="outlined" className={styles.tierCard}>
                      <Box className={styles.tierTopBox}>
                        <Typography variant="h6" fontWeight={600} flexGrow={1}>
                          <MarkdownText text={sponsorshipTier.name} />
                        </Typography>
                        {tierPrice && (
                          <Typography variant="h6" fontWeight={600}>
                            {!currency || currency === tierPrice.amount.currency
                              ? tierPrice.amount.amount +
                                " " +
                                tierPrice.amount.currency
                              : "~" +
                                tierPrice.amount.exchange[currency].amount +
                                " " +
                                tierPrice.amount.exchange[currency].currency}
                          </Typography>
                        )}
                      </Box>
                      <Divider />
                      <Box className={styles.rewardGroupBox}>
                        <Box className={styles.tierBottomBox}>
                          <Typography variant="body1" component="div">
                            <MarkdownText text={sponsorshipTier.description} />
                          </Typography>
                        </Box>
                        {rewardGroups && (
                          <>
                            <Divider />
                            <Box className={styles.tierMidBox}>
                              <Typography variant="body1" fontWeight={600}>
                                {t(
                                  "pages.sponsorship-donate.tiers.rewards-title",
                                )}
                              </Typography>
                            </Box>
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
                                      <Typography
                                        variant="body2"
                                        component="div"
                                      >
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
                                        (reward: any, i: number, row: any) => {
                                          const isRewardChecked =
                                            sponsorshipTier.id in
                                              rewardIdsSelected &&
                                            Object.keys(
                                              rewardIdsSelected[
                                                sponsorshipTier.id
                                              ],
                                            ).includes(rewardGroup.id) &&
                                            rewardIdsSelected[
                                              sponsorshipTier.id
                                            ][rewardGroup.id].includes(
                                              reward.id,
                                            );

                                          return (
                                            <>
                                              <Box key={reward.id}>
                                                <ListItemButton
                                                  disableTouchRipple
                                                  dense
                                                >
                                                  {mustSelectAmount && (
                                                    <Checkbox
                                                      className={
                                                        styles.rewardCheckbox
                                                      }
                                                      checked={isRewardChecked}
                                                      onChange={(e) =>
                                                        handleRewardCheckbox(
                                                          e,
                                                          sponsorshipTier,
                                                          rewardGroup,
                                                          reward,
                                                        )
                                                      }
                                                    />
                                                  )}
                                                  <ListItemIcon
                                                    className={
                                                      styles.eventCardIcon
                                                    }
                                                  >
                                                    {reward.type ===
                                                      RewardType.PRODUCT &&
                                                    reward.product &&
                                                    reward.product.images &&
                                                    reward.product.images
                                                      .length > 0 ? (
                                                      <img
                                                        src={
                                                          BACKEND_BASE_URL +
                                                          reward.product
                                                            .images[0].picture
                                                        }
                                                        alt={
                                                          reward.product.name
                                                        }
                                                        className={
                                                          styles.eventCardImage
                                                        }
                                                      />
                                                    ) : reward.icon ? (
                                                      <DynamicIcon
                                                        iconName={
                                                          reward.icon.code
                                                        }
                                                      />
                                                    ) : (
                                                      REWARD_TYPE_ICON[
                                                        reward.type
                                                      ]
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
                                                            {
                                                              reward.product
                                                                .name
                                                            }
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
                                                            {
                                                              reward.newsletter
                                                                .name
                                                            }
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
                                          );
                                        },
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
                    <Stack
                      direction="row"
                      spacing={2}
                      whiteSpace="nowrap"
                      justifyContent="center"
                    >
                      <Button
                        variant="contained"
                        type="submit"
                        style={{ width: "auto" }}
                        color="primary"
                        disableElevation
                        disabled
                        // onClick={handleRegistrationProcess}
                      >
                        {t("pages.sponsorship-donate.tiers.button-choose")}
                      </Button>
                    </Stack>
                  </Grid>
                );
              })}
          </Grid>
        </Box>
      </form>
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
