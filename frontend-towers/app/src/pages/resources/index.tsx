import styles from "./styles.module.css";
import { Link } from "@mui/material";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import ImageHeroResources from "../../assets/images/heros/resources.jpg";
import { apiDocumentList } from "../../api";
import PageUserImageHero from "../../components/PageUserImageHero/PageUserImageHero";

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
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Link href={BACKEND_BASE_URL + document.file}>
                  <img
                    src={BACKEND_BASE_URL + document.preview.medium}
                    className={styles.resourcesFileImage}
                    alt="positions for a pillar"
                  />
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
