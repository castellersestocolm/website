import styles from "./styles.module.css";
import { Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import ImageHeroAboutBylaws from "../../assets/images/heros/about-bylaws.jpg";
import { useTranslation } from "react-i18next";
import { apiLegalBylawsList } from "../../api";
import markdown from "@wcj/markdown-to-html";
import { capitalizeFirstLetter } from "../../utils/string";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import LanguageChip from "../../components/LanguageChip/LanguageChip";

function AboutBylawsPage() {
  const [t, i18n] = useTranslation("common");

  const [bylaws, setBylaws] = React.useState(undefined);

  React.useEffect(() => {
    apiLegalBylawsList().then((response) => {
      if (response.status === 200) {
        setBylaws(response.data.results.find((bylaws: any) => true));
      }
    });
  }, [setBylaws, i18n.resolvedLanguage]);

  const content = (
    <>
      {bylaws && (
        <Box className={styles.aboutBylawsContainerBox}>
          <Typography variant="body1" component="div">
            <div
              dangerouslySetInnerHTML={{
                __html: markdown(bylaws.content).toString(),
              }}
            ></div>
          </Typography>
          <Typography
            variant="h6"
            fontWeight="700"
            align="center"
            marginTop="64px"
          >
            {capitalizeFirstLetter(
              new Date(bylaws.date).toLocaleDateString(i18n.resolvedLanguage, {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            )}
          </Typography>
        </Box>
      )}
    </>
  );

  return (
    <PageImageHero
      title={
        <>
          {t("pages.about-bylaws.title")}
          {bylaws && (
            <LanguageChip language={bylaws.language} marginLeft="16px" />
          )}
        </>
      }
      content={content}
      hero={ImageHeroAboutBylaws}
      loading={!bylaws}
    />
  );
}

export default AboutBylawsPage;
