import styles from "./styles.module.css";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import { useAppContext } from "../../components/AppContext/AppContext";
import Box from "@mui/material/Box";
import { Card, Divider, Link, Typography, Button } from "@mui/material";
import { ROUTES } from "../../routes";
import { useNavigate, useParams } from "react-router-dom";
import { apiOrderRetrieve } from "../../api";
import { OrderStatus } from "../../enums";

function OrderCompletePage() {
  const [t, i18n] = useTranslation("common");
  const { id, token } = useParams();

  let navigate = useNavigate();

  const [order, setOrder] = React.useState(undefined);

  React.useEffect(() => {
    apiOrderRetrieve(id).then((response) => {
      if (response.status === 200) {
        const orderData = response.data;
        setOrder(orderData);

        if (orderData) {
          if (orderData.status === OrderStatus.CREATED) {
            navigate(
              ROUTES["order-payment"].path.replace(":id", response.data.id),
            );
          }
        }
      } else {
        localStorage.removeItem("orderId");
        navigate(ROUTES.order.path, { replace: true });
      }
    });
  }, [setOrder, id, navigate, i18n.resolvedLanguage]);

  const content = (
    <Grid container spacing={4} className={styles.orderGrid}>
      <Grid container spacing={4} className={styles.productsGrid}>
        THANK YOU!
      </Grid>
    </Grid>
  );

  return <PageBase title={t("pages.order-cart.title")} content={content} />;
}

export default OrderCompletePage;
