import * as React from "react";
import Box from "@mui/material/Box";
import { Container, Divider, Link, MenuItem, Typography } from "@mui/material";
import styles from "./styles.module.css";
import IconLogo from "../../components/IconLogo/IconLogo.jsx";
import { useTranslation } from "react-i18next";
import IconFacebook from "@mui/icons-material/Facebook";
import IconInstagram from "@mui/icons-material/Instagram";
import IconButton from "@mui/material/IconButton";
import { ROUTES } from "../../routes";
import IconArrowOutward from "@mui/icons-material/ArrowOutward";

const ORG_INFO_EMAIL = process.env.REACT_APP_ORG_INFO_EMAIL;

export default function Footer() {
  const { t } = useTranslation("common");

  const pages: any = [
    {
      name: t("components.navbar-menu.home"),
      path: ROUTES.home.path,
      target: "_self",
    },
    {
      name: t("components.navbar-menu.towers"),
      path: ROUTES["external-towers"].path,
      target: "_blank",
    },
    {
      name: t("components.navbar-menu.about.contact"),
      path: ROUTES["about-contact"].path,
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
            <IconLogo />
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
                    target={page.target}
                  >
                    <Typography fontWeight={600}>{page.name}</Typography>
                    {page.path.startsWith("http") && (
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
            sx={{
              justifyContent: { xs: "center", md: "end" },
              marginRight: { md: "-8px" },
            }}
            className={styles.footerSocial}
          >
            <Typography className={styles.footerTextEmail}>
              <Link href={"mailto:" + ORG_INFO_EMAIL} underline="none">
                {ORG_INFO_EMAIL}
              </Link>
            </Typography>
            <IconButton
              href="https://www.facebook.com/les4barres"
              target="_blank"
              rel="nofollow"
              aria-label="facebook"
            >
              <IconFacebook />
            </IconButton>
            <IconButton
              href="https://www.instagram.com/les4barrescasal"
              target="_blank"
              rel="nofollow"
              aria-label="instagram"
            >
              <IconInstagram />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
