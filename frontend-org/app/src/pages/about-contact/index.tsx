import * as React from "react";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import FormContactMessage from "../../components/FormContactMessage/FormContactMessage";
import { ContactMessageType } from "../../enums";

function AboutContactPage() {
  const { t } = useTranslation("common");

  const content = <FormContactMessage type={ContactMessageType.CONTACT} />;

  return <PageBase title={t("pages.about-contact.title")} content={content} />;
}

export default AboutContactPage;
