import { Typography } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import ImageHeroKids from "../../assets/images/heros/kids.jpg";

function ActivityKidsPage() {
  const { t } = useTranslation("common");

  const content = (
    <>
      <Typography variant="body1" mb={1}>
        {t("pages.activity-kids.content.section-1.text-1")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.activity-kids.content.section-1.text-2")}
      </Typography>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.activity-kids.content.section-2.title")}
      </Typography>
      <ul>
        <li>
          <Typography variant="body1" mb={1}>
            {t("pages.activity-kids.content.section-2.point-1")}
          </Typography>
        </li>
        <li>
          <Typography variant="body1" mb={1}>
            {t("pages.activity-kids.content.section-2.point-2")}
          </Typography>
        </li>
        <li>
          <Typography variant="body1" mb={1}>
            {t("pages.activity-kids.content.section-2.point-3")}
          </Typography>
        </li>
      </ul>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.activity-kids.content.section-3.title")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.activity-kids.content.section-3.text-1")}
      </Typography>
    </>
  );

  return (
    <PageImageHero
      title={t("pages.activity-kids.title")}
      content={content}
      hero={ImageHeroKids}
    />
  );
}

export default ActivityKidsPage;
