import styles from "./styles.module.css";
import * as React from "react";
import Grid from "@mui/material/Grid2";
import { useTranslation } from "react-i18next";
import ImageHeroAssocation from "../../assets/images/heros/association.jpg";
import ImageLogoAssociation from "../../assets/images/association/logo.png";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import {
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import IconLooksOne from "@mui/icons-material/LooksOne";
import IconLooksTwo from "@mui/icons-material/LooksTwo";
import IconLooksThree from "@mui/icons-material/Looks3";
import { ROUTES } from "../../routes";
import IconArrowOutward from "@mui/icons-material/ArrowOutward";
import ImageCarousel from "../../components/ImageCarousel/ImageCarousel";
import ImageCarousel1 from "../../assets/images/association/carousel/car1.jpg";
import ImageCarousel2 from "../../assets/images/association/carousel/car2.jpg";
import ImageCarousel3 from "../../assets/images/association/carousel/car3.jpg";
import ImageCarousel4 from "../../assets/images/association/carousel/car4.jpg";
import ImageCarousel5 from "../../assets/images/association/carousel/car5.jpg";
import ImageCarousel6 from "../../assets/images/association/carousel/car6.jpg";
import ImageCarousel7 from "../../assets/images/association/carousel/car7.jpg";

function AssociationPage() {
  const { t } = useTranslation("common");

  const content = (
    <>
      <Grid container spacing={4} className={styles.associationGrid}>
        <Grid
          size={{ xs: 12, md: 4 }}
          className={styles.associationBox}
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          <img
            src={ImageLogoAssociation}
            className={styles.associationLogo}
            alt="logo"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} className={styles.associationBoxText}>
          <Typography
            variant="h4"
            fontWeight="700"
            align="center"
            marginBottom="32px"
          >
            {t("pages.association.box1.title")}
          </Typography>
          <Box className={styles.associationBoxTextInner}>
            <Typography marginBottom="16px">
              {t("pages.association.box1.text1")}
            </Typography>
          </Box>
          <Box className={styles.associationBoxTextInner} marginBottom="16px">
            <List dense={true}>
              <ListItem>
                <ListItemIcon>
                  <IconLooksOne />
                </ListItemIcon>
                <ListItemText
                  primary={t("pages.association.box1.list.item-1.title")}
                  secondary={
                    t("pages.association.box1.list.item-1.subtitle")
                      ? t("pages.association.box1.list.item-1.subtitle")
                      : null
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <IconLooksTwo />
                </ListItemIcon>
                <ListItemText
                  primary={t("pages.association.box1.list.item-2.title")}
                  secondary={
                    t("pages.association.box1.list.item-2.subtitle")
                      ? t("pages.association.box1.list.item-2.subtitle")
                      : null
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <IconLooksThree />
                </ListItemIcon>
                <ListItemText
                  primary={t("pages.association.box1.list.item-3.title")}
                  secondary={
                    t("pages.association.box1.list.item-3.subtitle")
                      ? t("pages.association.box1.list.item-3.subtitle")
                      : null
                  }
                />
              </ListItem>
            </List>
          </Box>
          <Stack
            direction="row"
            spacing={2}
            className={styles.associationButtons}
          >
            <Button
              variant="contained"
              href={ROUTES["external-casal-form-membership"].path}
              target={"_blank"}
              disableElevation
            >
              {t("pages.association.box1.list.button-join")}
              <IconArrowOutward className={styles.externalIcon} />
            </Button>
            <Button
              variant="contained"
              href={ROUTES["external-casal"].path}
              target={"_blank"}
              disableElevation
            >
              {t("pages.association.box1.list.button-info")}
              <IconArrowOutward className={styles.externalIcon} />
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </>
  );

  const carouselImages = [
    ImageCarousel1,
    ImageCarousel2,
    ImageCarousel3,
    ImageCarousel4,
    ImageCarousel5,
    ImageCarousel6,
    ImageCarousel7,
  ];

  const contentPost = (
    <Box
      className={styles.carouselBottom}
      sx={{ display: { xs: "none", md: "flex" } }}
    >
      <ImageCarousel images={carouselImages} dense={false} />
    </Box>
  );

  return (
    <PageImageHero
      title={t("pages.association.title")}
      content={content}
      contentPost={contentPost}
      hero={ImageHeroAssocation}
    />
  );
}

export default AssociationPage;
