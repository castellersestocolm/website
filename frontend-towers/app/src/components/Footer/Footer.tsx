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
import { PermissionLevel } from "../../enums";
import LanguageChip from "../LanguageChip/LanguageChip";

const TOWERS_INFO_EMAIL = process.env.REACT_APP_TOWERS_INFO_EMAIL;

export default function Footer() {
  const { t } = useTranslation("common");

  const { user } = useAppContext();

  const pages: any = [
    {
      name: t("components.navbar-menu.home"),
      path: ROUTES.home.path,
      target: "_self",
      language: undefined,
    },
    {
      name: t("components.navbar-menu.calendar"),
      path: ROUTES.calendar.path,
      target: "_self",
      language: undefined,
    },
    !user && {
      name: t("components.navbar-menu.membership"),
      path: ROUTES["user-join"].path,
      target: "_self",
      language: undefined,
    },
    {
      name: user
        ? t("components.navbar-menu.equipmment")
        : t("components.navbar-menu.merch"),
      path: ROUTES.order.path,
      target: "_self",
      language: undefined,
    },
    {
      name: t("components.navbar-menu.resources"),
      path: ROUTES.resources.path,
      target: "_self",
      language: undefined,
    },
    {
      name: t("components.navbar-menu.press-release"),
      path: ROUTES["press-release"].path,
      target: "_self",
      language: undefined,
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
            {pages.map((page: any) => (
              <>
                {page && (
                  <MenuItem
                    key={page.name}
                    disableTouchRipple
                    className={styles.footerMenuItem}
                    component={Link}
                    href={page.path}
                  >
                    <Typography fontWeight={600}>
                      {page.name}
                      {page.language && (
                        <LanguageChip language={page.language} size="small" />
                      )}
                    </Typography>
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
            <Typography variant="body2">
              {t("components.footer.support-1")}{" "}
              <Link
                className={styles.footerTextSuport}
                href={ROUTES.association.path}
                color="inherit"
                fontWeight="600"
                underline="none"
              >
                {t("components.footer.support-2")}
              </Link>
              {"."}
            </Typography>
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
