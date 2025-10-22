import styles from "./styles.module.css";
import { Divider, Link, Typography } from "@mui/material";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import ImageHeroResources from "../../assets/images/heros/resources.jpg";
import { apiDocumentList } from "../../api";
import PageUserImageHero from "../../components/PageUserImageHero/PageUserImageHero";
import Box from "@mui/material/Box";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_API_BASE_URL).origin;

function ResourcesPage() {
  const [t, i18n] = useTranslation("common");

  const [documents, setDocuments] = React.useState(undefined);

  React.useEffect(() => {
    apiDocumentList().then((response) => {
      if (response.status === 200) {
        setDocuments(response.data);
      }
    });
  }, [setDocuments, i18n.resolvedLanguage]);

  const content = (
    <>
      <Grid container spacing={4} className={styles.resourcesGrid}>
        {documents &&
          documents.results.length > 0 &&
          documents.results.map((document: any) => {
            return (
              <Grid
                size={{ xs: 12, sm: 6, md: 3 }}
                className={styles.resourcesGridItem}
              >
                <Link
                  href={BACKEND_BASE_URL + document.file}
                  underline="none"
                  color="textPrimary"
                >
                  <img
                    src={BACKEND_BASE_URL + document.preview.medium}
                    className={styles.resourcesFileImage}
                    alt={document.name}
                  />
                  <Box className={styles.resourcesFileTitle}>
                    <Typography variant="body2" fontWeight="600">
                      {document.name}
                      {i18n.resolvedLanguage !== document.language
                        ? " (" + document.language + ")"
                        : undefined}
                    </Typography>
                  </Box>
                </Link>
              </Grid>
            );
          })}
      </Grid>
    </>
  );

  return (
    <PageUserImageHero
      title={t("pages.resources.title")}
      content={content}
      hero={ImageHeroResources}
      loading={!documents}
    />
  );
}

export default ResourcesPage;
