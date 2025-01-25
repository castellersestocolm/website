import * as React from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import styles from "./styles.module.css";
import { Container, MenuItem, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../LanguageSelector/LanguageSelector";

/*
        <IconButton size="large" aria-label="show 2 new messages" color="inherit">
          <Badge badgeContent={2} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
 */

export default function NavBar() {
  const { t } = useTranslation("common");

  const pages = [t("components.navbar-menu.home")];

  return (
    <AppBar className={styles.navBar} position="static" elevation={0}>
      <Container maxWidth="lg" className={styles.navContainer}>
        <Toolbar>
          <Box
            sx={{ flexGrow: 1, display: "flex", alignContent: "start", px: 0 }}
          >
            {pages.map((page) => (
              <MenuItem
                key={page}
                disableTouchRipple
                className={styles.navMenuItem}
              >
                <Typography fontWeight={600}>{page}</Typography>
              </MenuItem>
            ))}
          </Box>
          <Box sx={{ display: "flex", alignItems: "end", px: 0 }}>
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <>
                <LanguageSelector />
              </>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
