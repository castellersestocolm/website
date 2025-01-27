import * as React from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import styles from "./styles.module.css";
import { Container, Link, MenuItem, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../LanguageSelector/LanguageSelector";
import IconAccountCircle from "@mui/icons-material/AccountCircle";
import IconButton from "@mui/material/IconButton";

/*
        <IconButton size="large" aria-label="show 2 new messages" color="inherit">
          <Badge badgeContent={2} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
 */

export default function NavBar() {
  const { t } = useTranslation("common");

  const pages = [
    { name: t("components.navbar-menu.home"), path: "/" },
    { name: t("components.navbar-menu.resources"), path: "/resources" },
  ];

  return (
    <AppBar className={styles.navBar} position="sticky" elevation={0}>
      <Container maxWidth="xl" className={styles.navContainer}>
        <Toolbar>
          <Box
            sx={{ flexGrow: 1, display: "flex", alignContent: "start", px: 0 }}
          >
            {pages.map((page) => (
              <MenuItem
                key={page.name}
                disableTouchRipple
                className={styles.navMenuItem}
                component={Link}
                href={page.path}
              >
                <Typography fontWeight={600}>{page.name}</Typography>
              </MenuItem>
            ))}
          </Box>
          <Box sx={{ display: "flex", alignItems: "end", px: 0 }}>
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <>
                <LanguageSelector />
                {false ? <IconButton
              href="/user/dashboard"
              rel="nofollow"
              aria-label="account"
              className={styles.navMenuAccount}
            >
              <IconAccountCircle />
            </IconButton> : <MenuItem
                disableTouchRipple
                className={styles.navMenuLogin}
                component={Link}
                href="/user/login"
              >
                <Typography fontWeight={600}>{t("components.navbar-menu.login")}</Typography>
              </MenuItem>}
              </>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
