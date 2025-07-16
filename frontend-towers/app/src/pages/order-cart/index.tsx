import styles from "./styles.module.css";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import { useCallback } from "react";
import { useAppContext } from "../../components/AppContext/AppContext";
import Box from "@mui/material/Box";
import {
  Card,
  Divider,
  ListItemButton,
  List,
  ListItemText,
  Typography,
  ListItemIcon,
  Stack,
  Button,
} from "@mui/material";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import { apiEventRegistrationCreate, apiOrderCreate } from "../../api";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_API_BASE_URL).origin;

function OrderCartPage() {
  const { t } = useTranslation("common");

  const { cart, setCart, setMessages } = useAppContext();

  let navigate = useNavigate();

  React.useEffect(() => {
    const tmpCartString = localStorage.getItem("cart");
    if (tmpCartString) {
      const tmpCart = JSON.parse(tmpCartString);
      setCart(tmpCart);
    }
  }, [setCart]);

  React.useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart ? cart : ""));
  }, [cart]);

  function handleEmptyCart() {
    setCart(undefined);
    setMessages([
      { message: t("pages.order-cart.cancel.success"), type: "success" },
    ]);
    setTimeout(() => setMessages(undefined), 5000);
    navigate(ROUTES.order.path, { replace: true });
  }

  function handleCreateOrder() {
    const sizes = Object.values(cart)
      .filter(([quantity, [product, productSize]]: any[]) => quantity > 0)
      .map(([quantity, [product, productSize]]: any[]) => ({
        id: productSize.id,
        quantity: quantity,
      }));
    apiOrderCreate(sizes).then((response) => {
      if (response.status === 201) {
        setMessages([
          { message: t("pages.order-cart.order.success"), type: "success" },
        ]);
        setTimeout(() => setMessages(undefined), 10000);
        setCart(undefined);
        navigate(ROUTES["user-dashboard"].path, { replace: true });
      } else if (response.status === 400) {
        setMessages([
          { message: t("pages.order-cart.order.error"), type: "error" },
        ]);
        setTimeout(() => setMessages(undefined), 10000);
      }
    });
  }

  const cartAmount =
    (cart &&
      parseInt(
        // @ts-ignore
        Object.values(cart).reduce(
          (partialSum: number, cartItem: any) =>
            partialSum + cartItem[0] * cartItem[1][1].price.amount,
          0,
        ),
      )) ||
    0;

  const cartVatAmount =
    (cart &&
      parseInt(
        // @ts-ignore
        Object.values(cart).reduce(
          (partialSum: number, cartItem: any) =>
            partialSum + cartItem[0] * cartItem[1][1].price_vat.amount,
          0,
        ),
      )) ||
    0;

  const cartCurrency =
    (cart &&
      Object.values(cart).length > 0 &&
      // @ts-ignore
      Object.values(cart)[0][1][1].price.currency) ||
    "SEK";

  const content = (
    <Grid container spacing={4} className={styles.orderGrid}>
      <Grid container spacing={4} className={styles.productsGrid}>
        <Grid size={{ xs: 12, md: cart ? 8 : 12 }}>
          <Card variant="outlined">
            <Box className={styles.userTopBox}>
              <Typography variant="h6" fontWeight="600" component="div">
                {t("pages.order-cart.products-card.title")}
              </Typography>
            </Box>
            <Divider />

            {cart ? (
              <List className={styles.productsList}>
                {Object.values(cart)
                  .filter(
                    ([quantity, [product, productSize]]: any[]) => quantity > 0,
                  )
                  .map(
                    (
                      [quantity, [product, productSize]]: any[],
                      i: number,
                      row: any,
                    ) => {
                      console.log(productSize);
                      return (
                        <Box key={productSize.id}>
                          <ListItemButton disableTouchRipple dense>
                            <ListItemIcon className={styles.eventCardIcon}>
                              {product.images && product.images.length > 0 && (
                                <img
                                  src={
                                    BACKEND_BASE_URL + product.images[0].picture
                                  }
                                  alt={product.name}
                                  className={styles.eventCardImage}
                                />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                quantity +
                                " x " +
                                product.name +
                                " — " +
                                productSize.size
                              }
                            />
                            <Typography variant="body2" component="span">
                              {quantity * productSize.price.amount}{" "}
                              {productSize.price.currency}
                            </Typography>
                          </ListItemButton>
                        </Box>
                      );
                    },
                  )}
              </List>
            ) : (
              <Box className={styles.userDetailsBox}>asdasd</Box>
            )}
          </Card>
        </Grid>

        {cart ? (
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <Box className={styles.userTopBox}>
                <Typography variant="h6" fontWeight="600" component="div">
                  {t("pages.order-cart.summary-card.title")}
                </Typography>
              </Box>
              <Divider />
              <List className={styles.productsList}>
                <Box>
                  <ListItemButton disableTouchRipple dense>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          component="span"
                        >
                          {t("pages.order-cart.summary-card.subtotal")}
                        </Typography>
                      }
                    />
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      component="span"
                      className={styles.productAmount}
                    >
                      {cartAmount} {cartCurrency}
                    </Typography>
                  </ListItemButton>
                </Box>
                <Box>
                  <ListItemButton disableTouchRipple dense>
                    <ListItemText
                      primary={t("pages.order-cart.summary-card.shipping")}
                      secondary={t(
                        "pages.order-cart.summary-card.shipping.pickup-only",
                      )}
                    />
                    <Typography
                      variant="body2"
                      component="span"
                      className={styles.productAmount}
                    >
                      {"0 "}
                      {cartCurrency}
                    </Typography>
                  </ListItemButton>
                </Box>
                <Box>
                  <ListItemButton disableTouchRipple dense>
                    <ListItemText
                      primary={t("pages.order-cart.summary-card.taxes")}
                    />
                    <Typography variant="body2" component="span">
                      {cartVatAmount} {cartCurrency}
                    </Typography>
                  </ListItemButton>
                </Box>
                <Box>
                  <ListItemButton disableTouchRipple dense>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          fontWeight={700}
                          component="span"
                          className={styles.productAmount}
                        >
                          {t("pages.order-cart.summary-card.total")}
                        </Typography>
                      }
                    />
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      component="span"
                    >
                      {cartAmount} {cartCurrency}
                    </Typography>
                  </ListItemButton>
                </Box>
              </List>
              <Divider />
              <Box className={styles.summaryDetailsBox}>
                <Stack
                  direction="column"
                  spacing={2}
                  className={styles.buttons}
                >
                  <Button
                    variant="contained"
                    type="button"
                    color="primary"
                    disableElevation
                    className={styles.productAmount}
                    onClick={handleCreateOrder}
                  >
                    {t("pages.order.product-card.order")}
                  </Button>
                  <Stack
                    direction="row"
                    spacing={2}
                    className={styles.buttonsFill}
                  >
                    <Button
                      variant="contained"
                      type="button"
                      color="secondary"
                      disableElevation
                      href={ROUTES.order.path}
                    >
                      {t("pages.order.product-card.change")}
                    </Button>
                    <Button
                      variant="contained"
                      type="button"
                      name="delete"
                      color="error"
                      disableElevation
                      onClick={handleEmptyCart}
                    >
                      {t("pages.order.product-card.empty")}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Card>
          </Grid>
        ) : undefined}
      </Grid>
    </Grid>
  );

  return <PageBase title={t("pages.order-cart.title")} content={content} />;
}

export default OrderCartPage;
