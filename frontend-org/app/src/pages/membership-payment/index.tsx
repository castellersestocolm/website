import * as React from "react";
import PageBase from "../../components/PageBase/PageBase";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OrderPayment from "../../components/OrderPayment/OrderPayment";
import { ROUTES } from "../../routes";
import { useAppContext } from "../../components/AppContext/AppContext";

function MembershipPaymentPage() {
  const { id } = useParams();
  const { t } = useTranslation("common");

  const { user } = useAppContext();

  const [order, setOrder] = React.useState(undefined);
  const [paymentProvider, setPaymentProvider] = React.useState(undefined);

  let navigate = useNavigate();

  if (user === null) {
    navigate(ROUTES["user-login"].path);
  }

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
      title={t("pages.membership-cart.title")}
      content={content}
      loading={!order || !paymentProvider}
    />
  );
}

export default MembershipPaymentPage;
