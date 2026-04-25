import { Link, Typography } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import { ROUTES } from "../../routes";

const ORG_INFO_EMAIL = process.env.REACT_APP_ORG_INFO_EMAIL;

function PolicyPrivacyPage() {
  const { t } = useTranslation("common");

  const content = (
    <>
      <Typography variant="body1" mb={1}>
        {t("pages.policy-privacy.policy.text-1")}
      </Typography>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.policy-privacy.policy.section-1.title")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.policy-privacy.policy.section-1.text-1")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.policy-privacy.policy.section-1.text-2")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.policy-privacy.policy.section-1.text-3")}
      </Typography>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.policy-privacy.policy.section-2.title")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.policy-privacy.policy.section-2.text-1")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.policy-privacy.policy.section-2.text-2")}
      </Typography>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.policy-privacy.policy.section-3.title")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.policy-privacy.policy.section-3.text-1")}{" "}
        <Link href={ROUTES["about-contact"].path} underline="none">
          {t("pages.policy-privacy.policy.section-3.text-2")}
        </Link>{" "}
        {t("pages.policy-privacy.policy.section-3.text-3")}{" "}
        <Link href={"mailto:" + ORG_INFO_EMAIL} underline="none">
          {ORG_INFO_EMAIL}
        </Link>
        {"."}
      </Typography>
    </>
  );

  return <PageBase title={t("pages.policy-privacy.title")} content={content} />;
}

export default PolicyPrivacyPage;
