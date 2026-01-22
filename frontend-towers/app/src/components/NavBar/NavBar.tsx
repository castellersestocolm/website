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
  useTheme,
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
import { OrderStatus, PermissionLevel } from "../../enums";
import IconShoppingCart from "@mui/icons-material/ShoppingCartOutlined";
import IconShoppingCartCheckout from "@mui/icons-material/ShoppingCartCheckout";
import { styled } from "@mui/material/styles";
import Badge, { badgeClasses } from "@mui/material/Badge";
import LanguageChip from "../LanguageChip/LanguageChip";

/*
        <IconButton size="large" aria-label="show 2 new messages" color="inherit">
          <Badge badgeContent={2} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
 */

export default function NavBar() {
  const { t } = useTranslation("common");

  const theme = useTheme();

  const { user, cart, setCart, order, setOrder } = useAppContext();

  React.useEffect(() => {
    const tmpOrderString = localStorage.getItem("order");
    setOrder(tmpOrderString ? JSON.parse(tmpOrderString) : undefined);

    const tmpCartString = localStorage.getItem("cart");
    setCart(tmpCartString ? JSON.parse(tmpCartString) : undefined);
  }, [setOrder, setCart]);

  const pages: any = [
    {
      name: t("components.navbar-menu.home"),
      path: ROUTES.home.path,
      target: "_self",
      permission: undefined,
      language: undefined,
    },
    {
      name: t("components.navbar-menu.calendar"),
      path: ROUTES.calendar.path,
      target: "_self",
      permission: undefined,
      language: undefined,
    },
    !user && {
      name: t("components.navbar-menu.membership"),
      path: ROUTES["user-join"].path,
      target: "_self",
      permission: undefined,
      language: undefined,
    },
    {
      name: user
        ? t("components.navbar-menu.equipmment")
        : t("components.navbar-menu.merch"),
      path: ROUTES.order.path,
      target: "_self",
      permission: undefined,
      language: undefined,
    },
    {
      name: t("components.navbar-menu.resources"),
      path: ROUTES.resources.path,
      target: "_self",
      permission: undefined,
      language: undefined,
    },
    /** {
      name: t("components.navbar-menu.trips"),
      children: [
        {
          name: t("components.navbar-menu.trips.2025.berlin"),
          path: ROUTES["trips-2025-berlin"].path,
          target: "_self",
        },
      ],
    }, **/
    {
      name: t("components.navbar-menu.business"),
      children: [
        {
          name: t("components.navbar-menu.business.workshops"),
          path: ROUTES["business-workshops"].path,
          target: "_self",
          language: "en",
        },
        {
          name: t("components.navbar-menu.business.performances"),
          path: ROUTES["business-performances"].path,
          target: "_self",
          language: "en",
        },
      ],
    },
    {
      name: t("components.navbar-menu.press"),
      children: [
        {
          name: t("components.navbar-menu.press-article"),
          path: ROUTES["press-article"].path,
          target: "_self",
          language: undefined,
        },
        {
          name: t("components.navbar-menu.press-release"),
          path: ROUTES["press-release"].path,
          target: "_self",
          language: undefined,
        },
      ],
    },
    {
      name: t("components.navbar-menu.about"),
      children: [
        {
          name: t("components.navbar-menu.about.team"),
          path: ROUTES["about-team"].path,
          target: "_self",
          language: undefined,
        },
        {
          name: t("components.navbar-menu.about.bylaws"),
          path: ROUTES["about-bylaws"].path,
          target: "_self",
          language: undefined,
        },
        {
          name: t("components.navbar-menu.about.association"),
          path: ROUTES.association.path,
          target: "_self",
          language: undefined,
        },
        {
          name: t("components.navbar-menu.about.contact"),
          path: ROUTES["about-contact"].path,
          target: "_self",
          language: undefined,
        },
      ],
    },
    {
      name: t("components.navbar-menu.admin"),
      path: ROUTES.admin.path,
      target: "_self",
      permission: PermissionLevel.ADMIN,
      language: undefined,
    },
  ];

  const CartBadge = styled(Badge)`
    & .${badgeClasses.badge} {
      top: -12px;
      right: -6px;
      background-color: ${theme.palette.secondary.main};
      color: ${theme.palette.text.secondary};
    }
  `;

  const cartCount =
    cart &&
    parseInt(
      // @ts-ignore
      Object.values(cart).reduce(
        (partialSum: number, cartItem: any) => partialSum + cartItem[0],
        0,
      ),
    );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <AppBar className={styles.navBar} position="fixed" elevation={0}>
      <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <List className={styles.drawer}>
          {pages
            .filter(
              (page: any) =>
                page &&
                (!page.permission ||
                  page.permission === PermissionLevel.NONE ||
                  (user && user.permission_level >= PermissionLevel.ADMIN)),
            )
            .map((page: any) => (
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
                          {childrenPage.language && (
                            <LanguageChip
                              language={childrenPage.language}
                              size="small"
                            />
                          )}
                        </Typography>
                        {childrenPage.target === "_blank" && (
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
                      <Typography>
                        {page.name}
                        {page.language && (
                          <LanguageChip language={page.language} size="small" />
                        )}
                      </Typography>
                      {page.target === "_blank" && (
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
            {pages
              .filter(
                (page: any) =>
                  page &&
                  (!page.permission ||
                    page.permission === PermissionLevel.NONE ||
                    (user && user.permission_level >= PermissionLevel.ADMIN)),
              )
              .map((page: any) => (
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
                                {page.language && (
                                  <LanguageChip
                                    language={page.language}
                                    size="small"
                                  />
                                )}
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
                                    {childrenPage.language && (
                                      <LanguageChip
                                        language={childrenPage.language}
                                        size="small"
                                      />
                                    )}
                                  </Typography>
                                  {childrenPage.target === "_blank" && (
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
                        {page.target === "_blank" && (
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
                {order && order.status === OrderStatus.CREATED ? (
                  <IconButton
                    href={ROUTES["order-payment"].path.replace(":id", order.id)}
                    rel="nofollow"
                    aria-label="account"
                    className={styles.navMenuAccount}
                  >
                    <IconShoppingCartCheckout fontSize="small" />
                  </IconButton>
                ) : cartCount && cartCount > 0 ? (
                  <IconButton
                    href={ROUTES["order-cart"].path}
                    rel="nofollow"
                    aria-label="account"
                    className={styles.navMenuAccount}
                  >
                    <IconShoppingCart fontSize="small" />
                    <CartBadge
                      badgeContent={cartCount}
                      color="primary"
                      overlap="circular"
                    />
                  </IconButton>
                ) : undefined}
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
