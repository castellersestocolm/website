import styles from "./styles.module.css";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import {
  Box,
  Button,
  Card,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { ROUTES } from "../../routes";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../components/AppContext/AppContext";
import { apiOrderRequestCreate, apiPaymentRequestGet } from "../../api";
import { PaymentStatus } from "../../enums";

function PaymentRequestPage() {
  const [t, i18n] = useTranslation("common");
  const { id } = useParams();

  const { setMessages } = useAppContext();

  const [paymentRequest, setPaymentRequest] = React.useState(undefined);

  let navigate = useNavigate();

  React.useEffect(() => {
    apiPaymentRequestGet(id).then((response) => {
      if (response.status === 200) {
        setPaymentRequest(response.data);
      } else {
        navigate(ROUTES.home.path, { replace: true });
      }
    });
  }, [setPaymentRequest, id, navigate, i18n.resolvedLanguage]);

  function handlePaymentRequestSubmit() {
    const cartRequestLines =
      paymentRequest &&
      paymentRequest.lines.map((line: any) => {
        return { id: line.id };
      });
    apiOrderRequestCreate(cartRequestLines).then((response) => {
      if (response.status === 201) {
        navigate(
          ROUTES["request-payment"].path.replace(":id", response.data.id),
        );
      } else {
        setMessages([
          { message: t("pages.order-cart.order.error"), type: "error" },
        ]);
        setTimeout(() => setMessages(undefined), 10000);
      }
    });
  }

  const content = (
    <>
      {paymentRequest && (
        <Grid container gap={3} mt={4} mb={4} justifyContent="center">
          <Grid size={{ xs: 12, sm: 10, md: 7, lg: 6 }}>
            <Card variant="outlined">
              <Box className={styles.userTopBox}>
                <Typography variant="h6" fontWeight="600" component="div">
                  {t("pages.payment-request.table-lines.title")}
                </Typography>
              </Box>
              <Divider />
              <Box className={styles.userFamilyBox}>
                <List className={styles.userFamilyList}>
                  {paymentRequest.lines.map(
                    (line: any, i: number, row: any) => (
                      <>
                        <Box key={line.id}>
                          <ListItemButton disableTouchRipple dense>
                            <ListItemText
                              primary={
                                <Typography variant="body2" component="span">
                                  {line.description}
                                </Typography>
                              }
                            />
                            <Typography variant="body2" component="span">
                              {Math.abs(line.amount.amount)}{" "}
                              {line.amount.currency}
                            </Typography>
                          </ListItemButton>
                        </Box>
                        {i + 1 < row.length && <Divider />}
                      </>
                    ),
                  )}
                </List>
              </Box>
            </Card>
            <Grid container spacing={3} mt={3} justifyContent="center">
              <Stack direction="row" spacing={2} whiteSpace="nowrap">
                <Button
                  variant="contained"
                  type="button"
                  disableElevation
                  onClick={handlePaymentRequestSubmit}
                >
                  {t("pages.payment-request.payment")}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Grid>
      )}
    </>
  );

  return (
    <PageBase
      title={t("pages.payment-request.title")}
      content={content}
      loading={!paymentRequest}
    />
  );
}

export default PaymentRequestPage;
