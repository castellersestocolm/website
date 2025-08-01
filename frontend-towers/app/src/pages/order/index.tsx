import styles from "./styles.module.css";
import {
  Card,
  CardContent,
  ListItemButton,
  List,
  IconButton,
  ListItemText,
  Typography,
  Stack,
  Button,
} from "@mui/material";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import { apiProductList } from "../../api";
import Box from "@mui/material/Box";
import { useCallback } from "react";
import IconAdd from "@mui/icons-material/Add";
import IconRemove from "@mui/icons-material/Remove";
import Select from "@mui/material/Select";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import IconAddShoppingCart from "@mui/icons-material/AddShoppingCart";
import { useAppContext } from "../../components/AppContext/AppContext";
import { ROUTES } from "../../routes";
import { getEnumLabel } from "../../enums";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_API_BASE_URL).origin;

function OrderPage() {
  const [t, i18n] = useTranslation("common");

  const { cart, setCart } = useAppContext();

  const [products, setProducts] = React.useState(undefined);
  const [productSizeById, setProductSizeById] = React.useState(undefined);
  const [selectedSize, setSelectedSize] = React.useState<{
    [key: string]: string;
  }>({});

  React.useEffect(() => {
    const tmpCartString = localStorage.getItem("cart");
    if (tmpCartString) {
      setCart(JSON.parse(tmpCartString));
    }
  }, [setCart]);

  React.useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart ? cart : ""));
  }, [cart]);

  React.useEffect(() => {
    apiProductList().then((response) => {
      if (response.status === 200) {
        setProducts(response.data);
        setProductSizeById({
          ...Object.fromEntries(
            response.data.results
              .map((product: any) =>
                product.sizes.map((productSize: any) => [
                  productSize.id,
                  [product, productSize],
                ]),
              )
              .flat(),
          ),
        });
        setSelectedSize({
          ...Object.fromEntries(
            response.data.results.map((product: any) => [
              product.id,
              product.sizes && product.sizes.length > 0 && product.sizes[0].id,
            ]),
          ),
        });
      }
    });
  }, [setProducts, setProductSizeById, setSelectedSize, i18n.resolvedLanguage]);

  const handleProductSizeCartAdd = useCallback(
    (productSizeId: string) => {
      setCart((cart: any) => ({
        ...Object.fromEntries(
          Object.entries(cart || {}).map(([k, v], i) => [k, v]),
        ),
        [productSizeId]: [
          Math.min(
            (cart && productSizeId in cart ? cart[productSizeId][0] : 0) + 1,
            productSizeById[productSizeId][0].ignore_stock
              ? 100
              : productSizeById[productSizeId][1].stock,
          ),
          productSizeById[productSizeId],
        ],
      }));
    },
    [setCart, productSizeById],
  );

  const handleProductSizeCartRemove = useCallback(
    (productSizeId: string) => {
      setCart((cart: any) => ({
        ...Object.fromEntries(
          Object.entries(cart || {}).map(([k, v], i) => [k, v]),
        ),
        [productSizeId]: [
          Math.max(
            (cart && productSizeId in cart ? cart[productSizeId][0] : 0) - 1,
            0,
          ),
          productSizeById[productSizeId],
        ],
      }));
    },
    [setCart, productSizeById],
  );

  const handleSelectSize = useCallback(
    (productId: string, productSizeId: string) => {
      setSelectedSize((selectedSize) => ({
        ...Object.fromEntries(
          Object.entries(selectedSize).map(([k, v], i) => [k, v]),
        ),
        [productId]: productSizeId,
      }));
    },
    [setSelectedSize],
  );

  function handleEmptyCart() {
    setCart(undefined);
  }

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

  const cartCount =
    cart &&
    parseInt(
      // @ts-ignore
      Object.values(cart).reduce(
        (partialSum: number, cartItem: any) => partialSum + cartItem[0],
        0,
      ),
    );

  const content = (
    <Grid container spacing={4} className={styles.orderGrid}>
      <Grid container spacing={4} className={styles.productsGrid}>
        {products &&
          products.results.length > 0 &&
          products.results
            .filter(
              (product: any) =>
                product.price && product.price.min && product.price.max,
            )
            .map((product: any, i: number, row: any) => {
              const priceAmountCommon =
                product.price.min.amount === product.price.max.amount
                  ? product.price.min.amount
                  : undefined;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card variant="outlined" className={styles.productCard}>
                    {product.images && product.images.length > 0 && (
                      <Box className={styles.productCardMediaBox}>
                        <Box className={styles.productCardMedia}>
                          <img
                            src={BACKEND_BASE_URL + product.images[0].picture}
                            alt={product.name}
                            className={styles.productCardMediaImage}
                          />
                        </Box>
                      </Box>
                    )}
                    <CardContent className={styles.productCardContent}>
                      <Typography
                        gutterBottom
                        variant="h5"
                        fontWeight={700}
                        component="div"
                      >
                        {product.name}
                      </Typography>
                      <Typography gutterBottom variant="h6" component="div">
                        {product.price.min.amount !== product.price.max.amount
                          ? product.price.min.amount +
                            " - " +
                            product.price.max.amount
                          : product.price.min.amount}{" "}
                        {product.price.min.currency}
                      </Typography>
                      {product.description && (
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          {product.description}
                        </Typography>
                      )}
                    </CardContent>
                    <CardContent>
                      <Stack direction="row" spacing={2}>
                        <FormControl className={styles.productSelect}>
                          <InputLabel id="demo-multiple-name-label">
                            {t("pages.order.product-card.size")}
                          </InputLabel>
                          <Select
                            labelId="demo-multiple-name-label"
                            id="demo-multiple-name"
                            defaultValue={
                              product.sizes &&
                              product.sizes.length > 0 &&
                              product.sizes[0].id
                            }
                            onChange={(event) =>
                              handleSelectSize(product.id, event.target.value)
                            }
                            input={
                              <OutlinedInput
                                label={t("pages.order.product-card.size")}
                              />
                            }
                            MenuProps={MenuProps}
                            variant="standard"
                          >
                            {product.sizes &&
                              product.sizes.length > 0 &&
                              product.sizes
                                .filter((productSize: any) => productSize.price)
                                .map((productSize: any, i: number) => {
                                  return (
                                    <MenuItem
                                      key={i}
                                      value={productSize.id}
                                      disabled={
                                        !(
                                          product.ignore_stock ||
                                          productSize.stock > 0
                                        ) ||
                                        (cart &&
                                          productSize.id in cart &&
                                          cart[productSize.id][0] >=
                                            (product.ignore_stock
                                              ? 100
                                              : productSize.stock))
                                      }
                                    >
                                      {productSize.category
                                        ? getEnumLabel(
                                            t,
                                            "product-size-category",
                                            productSize.category,
                                          ) + " — "
                                        : undefined}
                                      {productSize.size}
                                      {priceAmountCommon === undefined ||
                                      productSize.price.amount !==
                                        priceAmountCommon
                                        ? " — " +
                                          productSize.price.amount +
                                          " " +
                                          productSize.price.currency
                                        : ""}
                                    </MenuItem>
                                  );
                                })}
                          </Select>
                        </FormControl>
                        <Button
                          variant="contained"
                          disableElevation
                          aria-label="add"
                          size="small"
                          onClick={() =>
                            handleProductSizeCartAdd(selectedSize[product.id])
                          }
                        >
                          <IconAddShoppingCart />
                        </Button>
                      </Stack>
                    </CardContent>
                    {product.sizes &&
                      product.sizes.length > 0 &&
                      product.sizes.filter(
                        (productSize: any) =>
                          cart &&
                          productSize.id in cart &&
                          cart[productSize.id][0] > 0,
                      ).length > 0 && (
                        <List className={styles.productsList}>
                          {product.sizes
                            .filter(
                              (productSize: any) =>
                                productSize.price &&
                                productSize.id in cart &&
                                cart[productSize.id][0] > 0,
                            )
                            .map((productSize: any, i: number, row: any) => {
                              return (
                                <>
                                  <ListItemButton
                                    disableTouchRipple
                                    dense
                                    className={styles.productListItemButton}
                                  >
                                    <Box
                                      className={styles.productListInner}
                                      flexDirection="row"
                                      alignItems="center"
                                    >
                                      <ListItemText
                                        className={styles.productListItem}
                                        disableTypography
                                        primary={
                                          <Typography variant="body2">
                                            {productSize.size}
                                            {priceAmountCommon === undefined ||
                                            productSize.price.amount !==
                                              priceAmountCommon
                                              ? " — " +
                                                productSize.price.amount +
                                                " " +
                                                productSize.price.currency
                                              : ""}
                                          </Typography>
                                        }
                                      />
                                      <ListItemText
                                        className={styles.productListItem}
                                        disableTypography
                                        primary={
                                          <Box
                                            className={
                                              styles.productSizeCartInner
                                            }
                                          >
                                            <IconButton
                                              aria-label="remove"
                                              size="small"
                                              onClick={() =>
                                                handleProductSizeCartRemove(
                                                  productSize.id,
                                                )
                                              }
                                              disabled={
                                                !(productSize.id in cart) ||
                                                cart[productSize.id][0] === 0
                                              }
                                            >
                                              <IconRemove />
                                            </IconButton>
                                            <Typography
                                              variant="body2"
                                              className={
                                                styles.productSizeCartCount
                                              }
                                              style={{
                                                backgroundColor:
                                                  productSize.id in cart &&
                                                  cart[productSize.id][0] > 0
                                                    ? "var(--mui-palette-primary-main)"
                                                    : "unset",
                                              }}
                                            >
                                              {productSize.id in cart
                                                ? cart[productSize.id][0]
                                                : 0}
                                            </Typography>
                                            <IconButton
                                              aria-label="add"
                                              size="small"
                                              onClick={() =>
                                                handleProductSizeCartAdd(
                                                  productSize.id,
                                                )
                                              }
                                              disabled={
                                                !(
                                                  product.ignore_stock ||
                                                  productSize.stock > 0
                                                ) ||
                                                (productSize.id in cart &&
                                                  cart[productSize.id][0] >=
                                                    (product.ignore_stock
                                                      ? 100
                                                      : productSize.stock))
                                              }
                                            >
                                              <IconAdd />
                                            </IconButton>
                                          </Box>
                                        }
                                      />
                                    </Box>
                                  </ListItemButton>
                                </>
                              );
                            })}
                        </List>
                      )}
                  </Card>
                </Grid>
              );
            })}
      </Grid>
      {cartCount && cartCount > 0 ? (
        <Stack direction="row" spacing={2} className={styles.buttons}>
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
          <Button
            variant="contained"
            type="button"
            color="primary"
            disableElevation
            href={ROUTES["order-cart"].path}
          >
            {t("pages.order.product-card.order")}
          </Button>
        </Stack>
      ) : undefined}
    </Grid>
  );

  return (
    <PageBase
      title={t("pages.order.title")}
      content={content}
      loading={!products}
    />
  );
}

export default OrderPage;
