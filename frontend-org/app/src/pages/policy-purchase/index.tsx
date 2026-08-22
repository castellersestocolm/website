import * as React from "react";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import { Typography } from "@mui/material";

function PolicyPurchasePage() {
  const { t } = useTranslation("common");

  const content = (
    <>
      <Typography variant="body1" mb={1} mt={4}>
        {t("pages.order-terms-agreement.box1.text1")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.order-terms-agreement.box1.text2")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.order-terms-agreement.box1.text3")}
      </Typography>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.order-terms-agreement.box2.title")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.order-terms-agreement.box2.text1")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.order-terms-agreement.box2.text2")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.order-terms-agreement.box2.text3")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.order-terms-agreement.box2.text4")}
      </Typography>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.order-terms-agreement.box3.title")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.order-terms-agreement.box3.text1")}
      </Typography>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.order-terms-agreement.box4.title")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.order-terms-agreement.box4.text1")}
      </Typography>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.order-terms-agreement.box5.title")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.order-terms-agreement.box5.text1")}
      </Typography>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.order-terms-agreement.box6.title")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.order-terms-agreement.box6.text1")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.order-terms-agreement.box6.text2")}
      </Typography>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.order-terms-agreement.box7.title")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.order-terms-agreement.box7.text1")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.order-terms-agreement.box7.text2")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.order-terms-agreement.box7.text3")}
      </Typography>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.order-terms-agreement.box8.title")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.order-terms-agreement.box8.text1")}
      </Typography>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.order-terms-agreement.box9.title")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.order-terms-agreement.box9.text1")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.order-terms-agreement.box9.text2")}
      </Typography>
    </>
  );

  return (
    <PageBase
      title={t("pages.order-terms-agreement.title")}
      content={content}
    />
  );
}

export default PolicyPurchasePage;
