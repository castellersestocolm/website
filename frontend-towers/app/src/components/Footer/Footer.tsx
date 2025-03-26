import * as React from "react";
import Box from "@mui/material/Box";
import { Container, Divider, Link, MenuItem, Typography } from "@mui/material";
import styles from "./styles.module.css";
import IconLogoLong from "../../components/IconLogoLong/IconLogoLong.jsx";
import { useTranslation } from "react-i18next";
import IconFacebook from "@mui/icons-material/Facebook";
import IconInstagram from "@mui/icons-material/Instagram";
import IconWhatsApp from "@mui/icons-material/WhatsApp";
import IconButton from "@mui/material/IconButton";
import { ROUTES } from "../../routes";
import { useAppContext } from "../AppContext/AppContext";
import IconArrowOutward from "@mui/icons-material/ArrowOutward";

const TOWERS_INFO_EMAIL = process.env.REACT_APP_TOWERS_INFO_EMAIL;

export default function Footer() {
  const { t } = useTranslation("common");

  const { user } = useAppContext();

  const pages = [
    {
      name: t("components.navbar-menu.home"),
      path: ROUTES.home.path,
      target: "_self",
    },
    {
      name: t("components.navbar-menu.calendar"),
      path: ROUTES.calendar.path,
      target: "_self",
    },
    !user && {
      name: t("components.navbar-menu.membership"),
      path: ROUTES["external-form-membership"].path,
      target: "_blank",
    },
    // TODO: Temporary until we start accepting sign-ups
    // !user && {
    //   name: t("components.navbar-menu.membership"),
    //   path: ROUTES["user-join"].path,
    //   target: "_self",
    // },
    user && {
      name: t("components.navbar-menu.equipmment"),
      path: ROUTES["external-form-equipment"].path,
      target: "_blank",
    },
    {
      name: t("components.navbar-menu.resources"),
      path: ROUTES.resources.path,
      target: "_self",
    },
    {
      name: t("components.navbar-menu.trips.2025.berlin"),
      path: ROUTES["trips-2025-berlin"].path,
      target: "_self",
    },
  ];

  return (
    <Box component="section" className={styles.footerBar}>
      <Container
        maxWidth="xl"
        sx={{ padding: { xs: "32px 16px", md: "32px 32px" } }}
      >
        <Box
          sx={{ justifyContent: { xs: "center", md: "start" } }}
          className={styles.footerContainerBox1}
        >
          <Box className={styles.footerIcon}>
            <IconLogoLong />
          </Box>
          <Box
            sx={{ display: { xs: "none", md: "flex" } }}
            className={styles.footerMenu}
          >
            {pages.map((page) => (
              <>
                {page && (
                  <MenuItem
                    key={page.name}
                    disableTouchRipple
                    className={styles.footerMenuItem}
                    component={Link}
                    href={page.path}
                  >
                    <Typography fontWeight={600}>{page.name}</Typography>
                    {page.target === "_blank" && (
                      <IconArrowOutward className={styles.externalIcon} />
                    )}
                  </MenuItem>
                )}
              </>
            ))}
          </Box>
        </Box>
        <Divider />
        <Box
          sx={{ flexDirection: { xs: "column", md: "row" } }}
          className={styles.footerContainerBox2}
        >
          <Box
            sx={{ textAlign: { xs: "center", md: "left" } }}
            className={styles.footerSupport}
          >
            <Link
              className={styles.footerTextSuport}
              href={ROUTES["external-casal"].path}
              color="inherit"
              underline="none"
            >
              {t("components.footer.support")}
            </Link>
          </Box>
          <Box
            sx={{
              justifyContent: { xs: "center", md: "end" },
              marginRight: { md: "-8px" },
            }}
            className={styles.footerSocial}
          >
            <Typography className={styles.footerTextEmail}>
              <Link href={"mailto:" + TOWERS_INFO_EMAIL} underline="none">
                {TOWERS_INFO_EMAIL}
              </Link>
            </Typography>
            <IconButton
              href="https://www.facebook.com/castellersestocolm"
              target="_blank"
              rel="nofollow"
              aria-label="facebook"
            >
              <IconFacebook />
            </IconButton>
            <IconButton
              href="https://www.instagram.com/castellersestocolm"
              target="_blank"
              rel="nofollow"
              aria-label="instagram"
            >
              <IconInstagram />
            </IconButton>
            <IconButton
              href="https://chat.whatsapp.com/KOvo9eolMXcA6vwwEVip1p"
              target="_blank"
              rel="nofollow"
              aria-label="whatsapp"
            >
              <IconWhatsApp />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
