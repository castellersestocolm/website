import * as React from "react";
import PageBase from "../../components/PageBase/PageBase";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OrderPayment from "../../components/OrderPayment/OrderPayment";

function SponsorshipDonatePaymentPage() {
  const { id } = useParams();
  const { t } = useTranslation("common");

  const [order, setOrder] = React.useState(undefined);
  const [paymentProvider, setPaymentProvider] = React.useState(undefined);

  const content = (
    <OrderPayment
      id={id}
      order={order}
      setOrder={setOrder}
      paymentProvider={paymentProvider}
      setPaymentProvider={setPaymentProvider}
    />
  );

  return (
    <PageBase
      title={t("pages.sponsorship-donate-cart.title")}
      content={content}
      loading={!order || !paymentProvider}
    />
  );
}

export default SponsorshipDonatePaymentPage;
