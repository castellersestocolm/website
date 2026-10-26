import * as React from "react";
import ImageHeroAboutContact from "../../assets/images/heros/about-contact.jpg";
import { useTranslation } from "react-i18next";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import FormContactMessage from "../../components/FormContactMessage/FormContactMessage";
import { ContactMessageType } from "../../enums";

function AboutContactPage() {
  const { t } = useTranslation("common");

  const content = <FormContactMessage type={ContactMessageType.CONTACT} />;

  return (
    <PageImageHero
      title={t("pages.about-contact.title")}
      content={content}
      hero={ImageHeroAboutContact}
    />
  );
}

export default AboutContactPage;
