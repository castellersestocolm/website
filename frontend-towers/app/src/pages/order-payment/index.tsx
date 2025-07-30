import styles from "./styles.module.css";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import { useAppContext } from "../../components/AppContext/AppContext";
import Box from "@mui/material/Box";
import {
  Card,
  Divider,
  Link,
  List,
  ListItemButton,
  Typography,
  Button,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ROUTES } from "../../routes";
import { useNavigate, useParams } from "react-router-dom";
import {
  apiOrderRetrieve,
  apiPaymentProviderList,
  apiOrderProviderUpdate,
  apiOrderComplete,
} from "../../api";
import { PaymentStatus, OrderStatus } from "../../enums";
import { amountToString } from "../../utils/money";
import { Loader } from "../../components/Loader/Loader";
import QRCode from "qrcode";
import IconAccountBalance from "@mui/icons-material/AccountBalance";
import IconMessage from "@mui/icons-material/Message";
import IconMoney from "@mui/icons-material/Money";
import IconPhone from "@mui/icons-material/Phone";
import {
  PAYMENT_SWISH_NUMBER,
  PAYMENT_SWISH_OWNER,
  PAYMENT_TRANSFER_BIC,
  PAYMENT_TRANSFER_IBAN,
  PAYMENT_TRANSFER_OWNER,
  PAYMENT_TRANSFER_PLUSGIRO,
} from "../../consts";
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_API_BASE_URL).origin;
const PAYMENT_PROVIDER_PAYPAL_CLIENT_ID =
  process.env.REACT_APP_PAYMENT_PROVIDER_PAYPAL_CLIENT_ID;

function OrderPaymentPage() {
  const [t, i18n] = useTranslation("common");
  const { id } = useParams();

  const { setMessages } = useAppContext();
  let navigate = useNavigate();

  const [order, setOrder] = React.useState(undefined);
  const [paymentProvider, setPaymentProvider] = React.useState(undefined);
  const [paymentProviderById, setPaymentProviderById] =
    React.useState(undefined);
  const [formPaymentProviderId, setFormPaymentProviderId] =
    React.useState(undefined);
  const [paymentSwishSvg, setPaymentSwishSvg] = React.useState(undefined);
  const [paymentPayPalOrderId, setPaymentPayPalOrderId] =
    React.useState(undefined);

  React.useEffect(() => {
    apiOrderRetrieve(id).then((response) => {
      if (response.status === 200) {
        const orderData = response.data;
        if (orderData) {
          if (orderData.status !== OrderStatus.CREATED) {
            localStorage.removeItem("orderId");
            localStorage.removeItem("order");
            navigate(
              ROUTES["order-receipt"].path.replace(":id", response.data.id),
              { replace: true },
            );
          }

          setOrder(orderData);
          localStorage.setItem("orderId", orderData.id);
          localStorage.setItem("order", JSON.stringify(orderData));

          if (
            orderData.payment_order &&
            paymentProviderById &&
            orderData.payment_order.provider.id in paymentProviderById
          ) {
            const orderPaymentProvider =
              paymentProviderById[orderData.payment_order.provider.id];
            if (orderPaymentProvider.is_enabled) {
              setPaymentProvider(orderPaymentProvider);
            }
          }
        }
      } else {
        localStorage.removeItem("orderId");
        localStorage.removeItem("order");
        navigate(ROUTES.order.path, { replace: true });
      }
    });
  }, [setOrder, setPaymentProvider, id, navigate, paymentProviderById]);

  React.useEffect(() => {
    apiPaymentProviderList().then((response) => {
      if (response.status === 200) {
        const paymentProviders = response.data;
        setPaymentProviderById(
          Object.fromEntries(
            paymentProviders.map((paymentProvider: any) => [
              paymentProvider.id,
              paymentProvider,
            ]),
          ),
        );

        const paymentProvidersEnabled = paymentProviders.filter(
          (paymentProvider: any) => paymentProvider.is_enabled,
        );
        if (
          !formPaymentProviderId &&
          paymentProvidersEnabled &&
          paymentProvidersEnabled.length > 0
        ) {
          setFormPaymentProviderId(paymentProvidersEnabled[0].id);
        }
      }
    });
  }, [
    setPaymentProviderById,
    setFormPaymentProviderId,
    formPaymentProviderId,
    i18n.resolvedLanguage,
  ]);

  React.useEffect(() => {
    if (order && order.payment_order) {
      if (order.payment_order.provider.code === "SWISH") {
        const textOrder = t("swish.payment.order") + " #" + order.reference;
        QRCode.toDataURL(
          "C" +
            PAYMENT_SWISH_NUMBER.replaceAll(" ", "") +
            ";" +
            order.amount.amount +
            ";" +
            textOrder +
            ";0",
          { width: 500, margin: 0 },
        )
          .then((url: string) => {
            setPaymentSwishSvg(url);
          })
          .catch((err: any) => {});
      } else {
        setPaymentSwishSvg(undefined);
      }

      if (order.payment_order.provider.code === "PAYPAL") {
        setPaymentPayPalOrderId(order.payment_order.external_id);
      } else {
        setPaymentPayPalOrderId(undefined);
      }
    } else {
      setPaymentSwishSvg(undefined);
      setPaymentPayPalOrderId(undefined);
    }
  }, [
    order,
    i18n.resolvedLanguage,
    setPaymentSwishSvg,
    setPaymentPayPalOrderId,
    t,
  ]);

  function handleSelectProvider(paymentProviderId: string) {
    const paymentProvider = paymentProviderById[paymentProviderId];
    if (paymentProvider.is_enabled) {
      setPaymentProvider(paymentProvider);
      apiOrderProviderUpdate(id, paymentProviderId).then((response) => {
        if (response.status === 200) {
          const orderData = response.data;
          setOrder(orderData);
          localStorage.setItem("order", JSON.stringify(orderData));
        } else {
          setMessages([
            { message: t("pages.order-cart.order.error"), type: "error" },
          ]);
          setTimeout(() => setMessages(undefined), 10000);
        }
      });
    }
  }

  function handleCompleteOrder() {
    return apiOrderComplete(id).then((response) => {
      if (response.status === 200) {
        const orderData = response.data;

        if (orderData.status !== OrderStatus.CREATED) {
          setOrder(orderData);
          localStorage.removeItem("orderId");
          localStorage.removeItem("order");
          navigate(
            ROUTES["order-receipt"].path.replace(":id", response.data.id),
          );
        }
      } else {
        setMessages([
          { message: t("pages.order-cart.order.error"), type: "error" },
        ]);
        setTimeout(() => setMessages(undefined), 10000);
      }
    });
  }

  const ButtonWrapper = ({ showSpinner }: any) => {
    const [{ isPending }] = usePayPalScriptReducer();

    return (
      <>
        {showSpinner && isPending && <div className="spinner" />}
        <PayPalButtons
          // style={style}
          disabled={false}
          // forceReRender={[style]}
          fundingSource={undefined}
          createOrder={() => paymentPayPalOrderId}
          onApprove={(data: any) => handleCompleteOrder()}
        />
      </>
    );
  };

  const payText =
    order &&
    paymentProvider &&
    (paymentProvider.code === "SWISH" ? (
      <Typography variant="body2" component="div" mt={1}>
        {t("pages.order-payment.providers-card.swish.qr-1")}
      </Typography>
    ) : paymentProvider.code === "PAYPAL" ? (
      <>
        <Typography variant="body2" component="div" mt={1}>
          {t("pages.order-payment.providers-card.paypal.window-1")}
        </Typography>
      </>
    ) : paymentProvider.code === "TRANSFER" ? (
      <Typography variant="body2" component="div" mt={1}>
        {t("pages.order-payment.providers-card.transfer.time-1")}
      </Typography>
    ) : undefined);

  const payContent =
    order &&
    paymentProvider &&
    (paymentProvider.code === "SWISH" && paymentSwishSvg ? (
      <Box className={styles.providerSwish}>
        <img src={paymentSwishSvg} alt="Swish QR" />
        <Typography
          variant="h5"
          component="span"
          fontWeight={700}
          className={styles.providerSwishText}
        >
          {amountToString(order.amount.amount)} {order.amount.currency}
        </Typography>
        <Typography
          variant="body1"
          component="span"
          className={styles.providerSwishText}
        >
          {t("swish.payment.order")}
          {" #"}
          {order.reference}
        </Typography>
        <Typography
          variant="body2"
          component="span"
          className={styles.providerSwishText}
        >
          {PAYMENT_SWISH_OWNER}
        </Typography>
        <Typography
          variant="body1"
          component="span"
          className={styles.providerSwishPhone}
        >
          <IconPhone />
          {PAYMENT_SWISH_NUMBER}
        </Typography>
        <Button
          variant="contained"
          type="button"
          color="primary"
          disableElevation
          onClick={handleCompleteOrder}
          className={styles.providerSwishButton}
        >
          {t("pages.order-payment.providers-card.complete")}
        </Button>
      </Box>
    ) : paymentProvider.code === "PAYPAL" && paymentPayPalOrderId ? (
      <Box className={styles.providerPayPal}>
        <PayPalScriptProvider
          options={{
            clientId: PAYMENT_PROVIDER_PAYPAL_CLIENT_ID,
            components: "buttons",
            currency: order.amount.currency,
          }}
        >
          <ButtonWrapper showSpinner={false} />
        </PayPalScriptProvider>
      </Box>
    ) : paymentProvider.code === "TRANSFER" ? (
      <Box className={styles.providerTransfer}>
        <List className={styles.providerTransferList}>
          <Box>
            <ListItemButton disableTouchRipple dense>
              <ListItemIcon>
                <IconAccountBalance />
              </ListItemIcon>
              <ListItemText
                primary={
                  <>
                    <Typography variant="body2" fontWeight={600}>
                      {PAYMENT_TRANSFER_OWNER}
                    </Typography>
                    <Typography variant="body2">
                      {"IBAN: "}
                      {PAYMENT_TRANSFER_IBAN}
                      {" (BIC: "}
                      {PAYMENT_TRANSFER_BIC}
                      {")"}
                    </Typography>
                    <Typography variant="body2">
                      {"PlusGirot: "}
                      {PAYMENT_TRANSFER_PLUSGIRO}
                    </Typography>
                  </>
                }
              ></ListItemText>
            </ListItemButton>
          </Box>
          <Box>
            <ListItemButton disableTouchRipple dense>
              <ListItemIcon>
                <IconMessage />
              </ListItemIcon>
              <ListItemText
                primary={
                  <>
                    <Typography variant="caption" color="textSecondary">
                      {t("pages.order-payment.providers-card.transfer.message")}
                    </Typography>
                    <Typography variant="body2">{order.reference}</Typography>
                  </>
                }
              ></ListItemText>
            </ListItemButton>
          </Box>
          <Box>
            <ListItemButton disableTouchRipple dense>
              <ListItemIcon>
                <IconMoney />
              </ListItemIcon>
              <ListItemText
                primary={
                  <>
                    <Typography variant="caption" color="textSecondary">
                      {t("pages.order-payment.providers-card.transfer.amount")}
                    </Typography>
                    <Typography variant="body2">
                      {amountToString(order.amount.amount, 2) +
                        " " +
                        order.amount.currency}
                    </Typography>
                  </>
                }
              ></ListItemText>
            </ListItemButton>
          </Box>
        </List>
        <Divider />
        <Button
          variant="contained"
          type="button"
          color="primary"
          disableElevation
          onClick={handleCompleteOrder}
          className={styles.providerTransferButton}
        >
          {t("pages.order-payment.providers-card.complete")}
        </Button>
      </Box>
    ) : undefined);

  const content = (
    <Grid container spacing={4} className={styles.orderGrid}>
      <Grid container spacing={4} className={styles.productsGrid}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={4} direction="column">
            <Card variant="outlined">
              <Box className={styles.userTopBox}>
                <Typography variant="h6" fontWeight="600" component="div">
                  {t("pages.order-payment.providers-card.title")}
                </Typography>
              </Box>
              <Divider />
              {paymentProvider ? (
                <>
                  <Box className={styles.providerBox}>
                    <Typography
                      variant="body1"
                      fontWeight="600"
                      component="div"
                    >
                      {paymentProvider.name}
                    </Typography>
                    {payText}
                    {!payContent && (
                      <Box className={styles.providerLoader}>
                        <Loader />
                      </Box>
                    )}
                  </Box>
                  {payContent && (
                    <>
                      <Divider />
                      {payContent}
                    </>
                  )}
                </>
              ) : (
                <Box className={styles.providerBox}>
                  <Typography variant="body2" component="span">
                    {t("pages.order-payment.providers-card.select")}
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>

        <Grid container size={{ xs: 12, md: 4 }} spacing={2}>
          {order &&
            paymentProviderById &&
            Object.keys(paymentProviderById).length > 0 && (
              <Grid container className={styles.paymentGrid}>
                {Object.values(paymentProviderById).map(
                  (paymentProvider: any, ix: number) => {
                    return (
                      <Card
                        variant="outlined"
                        className={
                          paymentProvider.is_enabled
                            ? styles.paymentCard
                            : styles.paymentCardDisabled
                        }
                        onClick={() => handleSelectProvider(paymentProvider.id)}
                      >
                        <Grid
                          container
                          spacing={0}
                          className={styles.paymentCardGrid}
                        >
                          <Grid size={6} className={styles.paymentCardText}>
                            <Typography
                              variant="body1"
                              fontWeight={700}
                              component="span"
                            >
                              {paymentProvider.name}
                            </Typography>
                          </Grid>
                          <Grid size={6} className={styles.paymentCardImage}>
                            {paymentProvider.picture &&
                            paymentProvider.picture.medium ? (
                              <img
                                src={
                                  BACKEND_BASE_URL +
                                  paymentProvider.picture.medium
                                }
                                alt={paymentProvider.name}
                              />
                            ) : (
                              <IconAccountBalance />
                            )}
                          </Grid>
                        </Grid>
                      </Card>
                    );
                  },
                )}
              </Grid>
            )}
        </Grid>
      </Grid>
    </Grid>
  );

  return <PageBase title={t("pages.order-cart.title")} content={content} />;
}

export default OrderPaymentPage;
