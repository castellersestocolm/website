import * as React from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import styles from "./styles.module.css";
import {
  Button,
  Container,
  Link,
  List,
  ListItem,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../LanguageSelector/LanguageSelector";
import IconAccountCircle from "@mui/icons-material/AccountCircle";
import IconButton from "@mui/material/IconButton";
import IconMenu from "@mui/icons-material/Menu";
import IconArrowOutward from "@mui/icons-material/ArrowOutward";
import { useAppContext } from "../AppContext/AppContext";
import { ROUTES } from "../../routes";
import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";

export default function NavBar() {
  const { t } = useTranslation("common");

  const { user } = useAppContext();

  const pages: any = [
    {
      name: t("components.navbar-menu.home"),
      path: ROUTES.home.path,
      target: "_self",
    },
    {
      name: t("components.navbar-menu.website"),
      path: ROUTES["external-website"].path,
      target: "_self",
    },
  ];

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <AppBar className={styles.navBar} position="fixed" elevation={0}>
      <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <List className={styles.drawer}>
          {pages.map((page: any) => (
            <>
              {page &&
                (page.children ? (
                  page.children.map((childrenPage: any) => (
                    <ListItem
                      key={childrenPage.name}
                      component={Link}
                      href={childrenPage.path}
                      target={childrenPage.target}
                      className={styles.drawerItem}
                    >
                      <Typography>
                        {page.name}
                        {" — "}
                        {childrenPage.name}
                      </Typography>
                      {childrenPage.path.startsWith("http") && (
                        <IconArrowOutward className={styles.externalIcon} />
                      )}
                    </ListItem>
                  ))
                ) : (
                  <ListItem
                    key={page.name}
                    component={Link}
                    href={page.path}
                    target={page.target}
                    className={styles.drawerItem}
                  >
                    <Typography>{page.name}</Typography>
                    {page.path.startsWith("http") && (
                      <IconArrowOutward className={styles.externalIcon} />
                    )}
                  </ListItem>
                ))}
            </>
          ))}
        </List>
      </Drawer>

      <Container maxWidth="xl" className={styles.navContainer}>
        <Toolbar>
          <Box
            sx={{ flexGrow: 1, display: "flex", alignContent: "start", px: 0 }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setIsDrawerOpen(true)}
              sx={{ display: { xs: "flex", md: "none" } }}
            >
              <IconMenu />
            </IconButton>
            {pages.map((page: any) => (
              <>
                {page &&
                  (page.children ? (
                    <PopupState variant="popover" popupId="demo-popup-menu">
                      {(popupState) => (
                        <React.Fragment>
                          <Button
                            key={page.name}
                            disableTouchRipple
                            className={styles.navMenuItem}
                            component={Link}
                            sx={{ display: { xs: "none", md: "flex" } }}
                            {...bindTrigger(popupState)}
                          >
                            <Typography fontWeight={600}>
                              {page.name}
                            </Typography>
                          </Button>
                          <Menu
                            {...bindMenu(popupState)}
                            className={styles.nestedNavMenu}
                          >
                            {page.children.map((childrenPage: any) => (
                              <MenuItem
                                key={childrenPage.name}
                                className={styles.nestedNavButton}
                                component={Link}
                                href={childrenPage.path}
                                target={childrenPage.target}
                              >
                                <Typography fontWeight={600}>
                                  {childrenPage.name}
                                </Typography>
                                {childrenPage.path.startsWith("http") && (
                                  <IconArrowOutward
                                    className={styles.externalIcon}
                                  />
                                )}
                              </MenuItem>
                            ))}
                          </Menu>
                        </React.Fragment>
                      )}
                    </PopupState>
                  ) : (
                    <MenuItem
                      key={page.name}
                      disableTouchRipple
                      className={styles.navMenuItem}
                      component={Link}
                      href={page.path}
                      target={page.target}
                      sx={{ display: { xs: "none", md: "flex" } }}
                    >
                      <Typography fontWeight={600}>{page.name}</Typography>
                      {page.path.startsWith("http") && (
                        <IconArrowOutward className={styles.externalIcon} />
                      )}
                    </MenuItem>
                  ))}
              </>
            ))}
          </Box>
          <Box sx={{ display: "flex", alignItems: "end", px: 0 }}>
            <Box sx={{ display: "flex" }}>
              <>
                <LanguageSelector />
                {user ? (
                  <IconButton
                    href={ROUTES["user-dashboard"].path}
                    rel="nofollow"
                    aria-label="account"
                    className={styles.navMenuAccount}
                  >
                    <IconAccountCircle />
                  </IconButton>
                ) : (
                  <MenuItem
                    disableTouchRipple
                    className={styles.navMenuLogin}
                    component={Link}
                    href={ROUTES["user-login"].path}
                  >
                    <Typography fontWeight={600}>
                      {t("components.navbar-menu.login")}
                    </Typography>
                  </MenuItem>
                )}
              </>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
