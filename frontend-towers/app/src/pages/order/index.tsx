import styles from "./styles.module.css";
import {
  Card,
  CardContent,
  ListItemButton,
  List,
  IconButton,
  ListItemText,
  Typography,
} from "@mui/material";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import ImageHeroOrder from "../../assets/images/heros/order.jpg";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import { apiProductList } from "../../api";
import Box from "@mui/material/Box";
import { useCallback } from "react";
import IconAdd from "@mui/icons-material/Add";
import IconRemove from "@mui/icons-material/Remove";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_API_BASE_URL).origin;

function OrderPage() {
  const [t, i18n] = useTranslation("common");

  const [products, setProducts] = React.useState(undefined);
  const [productSizesCart, setProductSizesCart] = React.useState<{
    [key: string]: number;
  }>({});

  React.useEffect(() => {
    apiProductList().then((response) => {
      if (response.status === 200) {
        setProducts(response.data);
      }
    });
  }, [setProducts, i18n.resolvedLanguage]);

  const handleProductSizeCartAdd = useCallback(
    (productSizeId: string) => {
      setProductSizesCart((productSizesCart) => ({
        ...Object.fromEntries(
          Object.entries(productSizesCart).map(([k, v], i) => [k, v]),
        ),
        [productSizeId]: Math.min(
          (productSizeId in productSizesCart
            ? productSizesCart[productSizeId]
            : 0) + 1,
          100,
        ),
      }));
    },
    [setProductSizesCart],
  );

  const handleProductSizeCartRemove = useCallback(
    (productSizeId: string) => {
      setProductSizesCart((productSizesCart) => ({
        ...Object.fromEntries(
          Object.entries(productSizesCart).map(([k, v], i) => [k, v]),
        ),
        [productSizeId]: Math.max(
          (productSizeId in productSizesCart
            ? productSizesCart[productSizeId]
            : 0) - 1,
          0,
        ),
      }));
    },
    [setProductSizesCart],
  );

  const content = (
    <>
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
                    <List className={styles.productsList}>
                      {product.sizes &&
                        product.sizes.length > 0 &&
                        product.sizes
                          .filter((productSize: any) => productSize.price)
                          .map((productSize: any, i: number, row: any) => {
                            console.log(priceAmountCommon, productSize.price);
                            return (
                              <>
                                <ListItemButton
                                  disableTouchRipple
                                  dense
                                  className={styles.productListItemButton}
                                >
                                  <Box
                                    className={styles.productListInner}
                                    flexDirection={{ xs: "column", lg: "row" }}
                                    alignItems={{ xs: "start", lg: "center" }}
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
                                              !(
                                                productSize.id in
                                                productSizesCart
                                              ) ||
                                              productSizesCart[
                                                productSize.id
                                              ] === 0
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
                                                productSize.id in
                                                  productSizesCart &&
                                                productSizesCart[
                                                  productSize.id
                                                ] > 0
                                                  ? "var(--mui-palette-primary-main)"
                                                  : "unset",
                                            }}
                                          >
                                            {productSize.id in productSizesCart
                                              ? productSizesCart[productSize.id]
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
                                              productSize.id in
                                                productSizesCart &&
                                              productSizesCart[
                                                productSize.id
                                              ] >= 100
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
                  </Card>
                </Grid>
              );
            })}
      </Grid>
    </>
  );

  return (
    <PageImageHero
      title={t("pages.order.title")}
      content={content}
      hero={ImageHeroOrder}
    />
  );
}

export default OrderPage;
