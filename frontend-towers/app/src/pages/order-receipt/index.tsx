import styles from "./styles.module.css";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import { useAppContext } from "../../components/AppContext/AppContext";
import { Typography } from "@mui/material";
import { ROUTES } from "../../routes";
import { useNavigate, useParams } from "react-router-dom";
import { apiOrderRetrieve } from "../../api";
import { getEnumLabel, ORDER_STATUS_ICON, OrderStatus } from "../../enums";
import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import IconFitnessCenter from "@mui/icons-material/FitnessCenter";

function OrderReceiptPage() {
  const [t, i18n] = useTranslation("common");
  const { id } = useParams();

  let navigate = useNavigate();

  const { order, setOrder } = useAppContext();

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
    <>
      <Grid container spacing={4} className={styles.orderGrid}>
        {order && (
          <Typography variant="h5" fontWeight={700} textAlign="center">
            {"#"}
            {order.reference}
          </Typography>
        )}
        <Typography variant="body1" textAlign="center">
          {t("pages.order-receipt.order.message")}
        </Typography>
      </Grid>
      {order && order.logs && (
        <Timeline
          className={styles.orderTimeline}
          sx={{
            [`& .${timelineItemClasses.root}:before`]: {
              flex: 0,
              padding: 0,
            },
          }}
        >
          {order.logs.map((orderLog: any, ix: number) => {
            return (
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot
                    variant={ix === 0 ? "filled" : "outlined"}
                    style={{
                      boxShadow: "none",
                      color:
                        ix === 0
                          ? "var(--mui-palette-common-white)"
                          : "var(--mui-palette-grey-400)",
                    }}
                  >
                    {ORDER_STATUS_ICON[orderLog.status]}
                  </TimelineDot>
                  {ix < order.logs.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="body1" component="span">
                    {getEnumLabel(t, "order-status", orderLog.status)}
                  </Typography>
                  <Typography variant="body2">
                    {new Date(orderLog.created_at).toISOString().slice(0, 10) +
                      " " +
                      new Date(orderLog.created_at).toTimeString().slice(0, 8)}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      )}
    </>
  );

  return <PageBase title={t("pages.order-receipt.title")} content={content} />;
}

export default OrderReceiptPage;
