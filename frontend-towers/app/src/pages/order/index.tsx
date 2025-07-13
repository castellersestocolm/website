import styles from "./styles.module.css";
import { Card, CardContent, Typography } from "@mui/material";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import ImageHeroOrder from "../../assets/images/heros/order.jpg";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import { apiProductList } from "../../api";
import Box from "@mui/material/Box";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_API_BASE_URL).origin;

function OrderPage() {
  const [t, i18n] = useTranslation("common");

  const [products, setProducts] = React.useState(undefined);

  React.useEffect(() => {
    apiProductList().then((response) => {
      if (response.status === 200) {
        setProducts(response.data);
      }
    });
  }, [setProducts, i18n.resolvedLanguage]);

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
