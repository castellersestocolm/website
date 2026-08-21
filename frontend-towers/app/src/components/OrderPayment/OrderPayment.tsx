import styles from "./styles.module.css";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../AppContext/AppContext";
import Box from "@mui/material/Box";
import QRCode from "qrcode";
import {
  Card,
  Divider,
  List,
  ListItemButton,
  Typography,
  Button,
  Link,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import {
  apiOrderRetrieve,
  apiPaymentProviderList,
  apiOrderProviderUpdate,
  apiOrderComplete,
} from "../../api";
import { OrderStatus, OrderType } from "../../enums";
import { amountToString } from "../../utils/money";
import { LoaderBar } from "../LoaderBar/LoaderBar";
import IconAccountBalance from "@mui/icons-material/AccountBalance";
import IconMessage from "@mui/icons-material/Message";
import IconMoney from "@mui/icons-material/Money";
import {
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
import { useCallback } from "react";
import { isMobile } from "react-device-detect";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_TOWERS_API_URL).origin;
const PAYMENT_PROVIDER_PAYPAL_CLIENT_ID =
  process.env.REACT_APP_PAYMENT_PROVIDER_PAYPAL_CLIENT_ID;
const TOWERS_BASE_URL = new URL(process.env.REACT_APP_TOWERS_BASE_URL).origin;

declare global {
  interface Window {
    SumUpCard: any;
  }
}

window.SumUpCard = window.SumUpCard || {};

export default function OrderPayment({
  id,
  order,
  setOrder,
  paymentProvider,
  setPaymentProvider,
}: any) {
  const [t, i18n] = useTranslation("common");

  const { setMessages } = useAppContext();
  let navigate = useNavigate();

  const [paymentProviderById, setPaymentProviderById] =
    React.useState(undefined);
  const [formPaymentProviderId, setFormPaymentProviderId] =
    React.useState(undefined);
  const [paymentPayPalOrderId, setPaymentPayPalOrderId] =
    React.useState(undefined);
  const [paymentSumUpOrderId, setPaymentSumUpOrderId] =
    React.useState(undefined);
  const [paymentSumUpMounted, setPaymentSumUpMounted] = React.useState(false);
  const [paymentSESwishOrderId, setPaymentSESwishOrderId] =
    React.useState(undefined);
  const [paymentSESwishOrderQR, setPaymentSESwishOrderQR] =
    React.useState(undefined);

  const orderReceiptPath =
    order && order.type === OrderType.MEMBERSHIP
      ? ROUTES["membership-receipt"].path.replace(":id", id)
      : ROUTES["order-receipt"].path.replace(":id", id);

  React.useEffect(() => {
    apiOrderRetrieve(id).then((response) => {
      if (response.status === 200) {
        const orderData = response.data;
        if (orderData) {
          if (orderData.status !== OrderStatus.CREATED) {
            localStorage.removeItem("orderId");
            localStorage.removeItem("order");
            navigate(orderReceiptPath, { replace: true });
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
  }, [
    setOrder,
    setPaymentProvider,
    id,
    navigate,
    paymentProviderById,
    orderReceiptPath,
  ]);

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

  const handleCompleteOrder = useCallback(
    (
      datePaid: string = undefined,
      transactionId: string = undefined,
      transactionReference: string = undefined,
    ) => {
      return apiOrderComplete(
        id,
        datePaid,
        transactionId,
        transactionReference,
      ).then((response: any) => {
        if (response.status === 200) {
          const orderData = response.data;

          if (orderData.status !== OrderStatus.CREATED) {
            setOrder(orderData);
            localStorage.removeItem("orderId");
            localStorage.removeItem("order");
            navigate(orderReceiptPath);
          }
        } else {
          setMessages([
            { message: t("pages.order-cart.order.error"), type: "error" },
          ]);
          setTimeout(() => setMessages(undefined), 10000);
        }
      });
    },
    [id, navigate, setMessages, setOrder, t, orderReceiptPath],
  );

  React.useEffect(() => {
    if (order && order.payment_order) {
      if (order.payment_order.provider.code === "PAYPAL") {
        setPaymentPayPalOrderId(order.payment_order.external_id);
      } else {
        setPaymentPayPalOrderId(undefined);
      }

      if (order.payment_order.provider.code === "SUMUP") {
        setPaymentSumUpOrderId(order.payment_order.external_id);
      } else {
        setPaymentSumUpOrderId(undefined);
      }

      if (order.payment_order.provider.code === "SE_SWISH") {
        setPaymentSESwishOrderId(order.payment_order.external_id);

        if (
          order.payment_order.extra &&
          order.payment_order.extra.request_token
        ) {
          QRCode.toDataURL("D" + order.payment_order.extra.request_token, {
            width: 500,
            margin: 0,
          })
            .then((url: string) => {
              setPaymentSESwishOrderQR(url);
            })
            .catch((err: any) => {});
        }
      } else {
        setPaymentSESwishOrderId(undefined);
        setPaymentSESwishOrderQR(undefined);
      }
    } else {
      setPaymentPayPalOrderId(undefined);
      setPaymentSumUpOrderId(undefined);
      setPaymentSESwishOrderId(undefined);
      setPaymentSESwishOrderQR(undefined);
    }
  }, [
    order,
    i18n.resolvedLanguage,
    setPaymentPayPalOrderId,
    setPaymentSumUpOrderId,
    setPaymentSESwishOrderId,
    setPaymentSESwishOrderQR,
    t,
  ]);

  React.useEffect(() => {
    if (paymentSumUpOrderId) {
      setTimeout(() => {
        setPaymentSumUpMounted(true);
        window.SumUpCard.mount({
          id: "sumup-card",
          checkoutId: paymentSumUpOrderId,
          onResponse: (type: any, body: any) => {
            if (type === "success") {
              handleCompleteOrder(
                body.paid_at,
                body.transaction_id,
                body.transaction_code,
              );
            } else if (type === "error") {
              setMessages([
                { message: t("pages.order-cart.order.error"), type: "error" },
              ]);
              setTimeout(() => setMessages(undefined), 10000);
            }
          },
        });
      }, 1000);
    } else {
      if (window.SumUpCard && window.SumUpCard.unmount) {
        window.SumUpCard.unmount("sumup-card");
      }
      setPaymentSumUpMounted(false);
    }
  }, [
    paymentSumUpOrderId,
    handleCompleteOrder,
    setPaymentSumUpMounted,
    setMessages,
    t,
  ]);

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
    (paymentProvider.code === "SE_SWISH" ? (
      <Typography variant="body2" component="div" mt={1}>
        {isMobile
          ? t("pages.order-payment.providers-card.se-swish.window-phone-1")
          : t("pages.order-payment.providers-card.se-swish.window-1")}
      </Typography>
    ) : paymentProvider.code === "PAYPAL" ? (
      <>
        <Typography variant="body2" component="div" mt={1}>
          {t("pages.order-payment.providers-card.paypal.window-1")}
        </Typography>
      </>
    ) : paymentProvider.code === "SUMUP" ? (
      <>
        <Typography variant="body2" component="div" mt={1}>
          {t("pages.order-payment.providers-card.sumup.window-1")}
        </Typography>
      </>
    ) : paymentProvider.code === "TRANSFER" ? (
      <Typography variant="body2" component="div" mt={1}>
        {t("pages.order-payment.providers-card.transfer.time-1")}
      </Typography>
    ) : undefined);

  const payDisclaimer = (
    <>
      <Typography variant="body2" component="div">
        {t("pages.order-payment.terms-agreement.disclaimer-1")}{" "}
        <Link
          href={ROUTES["policy-purchase"].path}
          color="secondary"
          underline="none"
          target="_blank"
        >
          {t("pages.order-payment.terms-agreement.disclaimer-2")}
        </Link>
        {"."}
      </Typography>
      <Typography variant="body2" component="div" mt={1}>
        {t("pages.order-payment.terms-privacy.disclaimer-1")}{" "}
        <Link
          href={ROUTES["external-casal-policy-privacy"].path}
          color="secondary"
          underline="none"
          target="_blank"
        >
          {t("pages.order-payment.terms-privacy.disclaimer-2")}
        </Link>
        {"."}
      </Typography>
    </>
  );

  const payContent = (
    <>
      <Box
        style={{
          display:
            order && paymentProvider && paymentProvider.code === "SUMUP"
              ? "block"
              : "none",
        }}
      >
        {order && (
          <Box className={styles.providerTransfer}>
            <List className={styles.providerTransferList}>
              <Box>
                <ListItemButton disableTouchRipple dense>
                  <ListItemIcon>
                    <IconMoney />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <>
                        <Typography variant="caption" color="textSecondary">
                          {t(
                            "pages.order-payment.providers-card.transfer.amount",
                          )}
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
          </Box>
        )}
        {!paymentSumUpMounted && (
          <Box className={styles.providerBox}>
            <LoaderBar />
          </Box>
        )}
        <Box className={styles.providerSumup}>
          <div id="sumup-card" className="widget"></div>
        </Box>
      </Box>
      {order &&
        paymentProvider &&
        (paymentProvider.code === "SE_SWISH" ? (
          paymentSESwishOrderQR ? (
            <Box className={styles.providerSwish}>
              {!isMobile && <img src={paymentSESwishOrderQR} alt="Swish QR" />}
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
                {t("swish.payment.order")} {order.reference}
              </Typography>
              {isMobile ? (
                order.payment_order &&
                order.payment_order.extra &&
                order.payment_order.extra.request_token && (
                  <Button
                    variant="contained"
                    type="button"
                    color="primary"
                    disableElevation
                    href={
                      "swish://paymentrequest?token=" +
                      order.payment_order.extra.request_token +
                      "&callbackurl=" +
                      TOWERS_BASE_URL +
                      orderReceiptPath
                    }
                    className={styles.providerSwishButton}
                  >
                    {t("pages.order-payment.providers-se-swish.open")}
                  </Button>
                )
              ) : (
                <Button
                  variant="contained"
                  type="button"
                  color="primary"
                  disableElevation
                  onClick={() => handleCompleteOrder()}
                  className={styles.providerSwishButton}
                >
                  {t("pages.order-payment.providers-se-swish.complete")}
                </Button>
              )}
            </Box>
          ) : (
            <Box className={styles.providerBox}>
              <LoaderBar />
            </Box>
          )
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
                          {t(
                            "pages.order-payment.providers-card.transfer.message",
                          )}
                        </Typography>
                        <Typography variant="body2">
                          {order.reference}
                        </Typography>
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
                          {t(
                            "pages.order-payment.providers-card.transfer.amount",
                          )}
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
              onClick={() => handleCompleteOrder()}
              className={styles.providerTransferButton}
            >
              {t("pages.order-payment.providers-card.complete")}
            </Button>
          </Box>
        ) : undefined)}
    </>
  );

  return (
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
                        <LoaderBar />
                      </Box>
                    )}
                  </Box>
                  {payContent && (
                    <>
                      <Divider />
                      {payContent}
                    </>
                  )}
                  <Divider />
                  <Box className={styles.providerBox}>{payDisclaimer}</Box>
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
}
