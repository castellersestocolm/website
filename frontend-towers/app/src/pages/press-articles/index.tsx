import styles from "./styles.module.css";
import { Link, Typography } from "@mui/material";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import { apiDocumentList } from "../../api";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import Box from "@mui/material/Box";
import LanguageChip from "../../components/LanguageChip/LanguageChip";
import { DocumentType } from "../../enums";
import ImageHeroPress from "../../assets/images/heros/press.jpg";
import { capitalizeFirstLetter } from "../../utils/string";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_API_BASE_URL).origin;

function PressArticlePage() {
  const [t, i18n] = useTranslation("common");

  const [articles, setArticles] = React.useState(undefined);

  React.useEffect(() => {
    apiDocumentList(undefined, undefined, [DocumentType.PRESS]).then(
      (response) => {
        if (response.status === 200) {
          setArticles(response.data);
        }
      },
    );
  }, [setArticles, i18n.resolvedLanguage]);

  const content = (
    <>
      <Grid container spacing={4} className={styles.resourcesGrid}>
        {articles &&
          articles.results.length > 0 &&
          articles.results.map((document: any) => {
            return (
              <Grid
                size={{ xs: 12, sm: 6, md: 3 }}
                className={styles.resourcesGridItem}
              >
                <Link
                  href={
                    document.url_external
                      ? document.url_external
                      : BACKEND_BASE_URL + document.file
                  }
                  underline="none"
                  color="textPrimary"
                  target={document.url_external ? "_blank" : "_self"}
                >
                  <img
                    src={BACKEND_BASE_URL + document.preview.medium}
                    className={styles.resourcesFileImage}
                    alt={document.name}
                  />
                  <Box className={styles.resourcesFileTitle}>
                    <Typography variant="body2" fontWeight="600">
                      {document.name}
                      <LanguageChip language={document.language} size="small" />
                    </Typography>
                    {document.date && (
                      <Typography variant="body2">
                        {capitalizeFirstLetter(
                          new Date(document.date).toLocaleDateString(
                            i18n.resolvedLanguage,
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          ),
                        )}
                      </Typography>
                    )}
                  </Box>
                </Link>
              </Grid>
            );
          })}
      </Grid>
    </>
  );

  return (
    <PageImageHero
      title={t("pages.press-articles.title")}
      content={content}
      hero={ImageHeroPress}
      loading={!articles}
    />
  );
}

export default PressArticlePage;
