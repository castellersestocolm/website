import styles from "./styles.module.css";
import { Link, Stack, Typography } from "@mui/material";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import { apiDocumentList } from "../../api";
import PageBase from "../../components/PageBase/PageBase";
import Box from "@mui/material/Box";
import LanguageChip from "../../components/LanguageChip/LanguageChip";
import { DocumentType } from "../../enums";
import Pagination from "@mui/material/Pagination";
import { API_DOCUMENTS_LIST_PAGE_SIZE } from "../../consts";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_ORG_API_URL).origin;

function ResourcesNewslettersPage() {
  const [t, i18n] = useTranslation("common");

  const [documentsPage, setDocumentsPage] = React.useState(1);
  const [documents, setDocuments] = React.useState(undefined);

  React.useEffect(() => {
    apiDocumentList(documentsPage, undefined, [DocumentType.NEWSLETTER]).then(
      (response) => {
        if (response.status === 200) {
          setDocuments(response.data);
        }
      },
    );
  }, [setDocuments, documentsPage, i18n.resolvedLanguage]);

  const content = (
    <>
      <Typography variant="body1" mb={5}>
        {t("pages.resources-newsletters.text-1")}
      </Typography>
      {documents && documents.results.length > 0 && (
        <>
          <Box>
            <Grid container spacing={4} className={styles.resourcesGrid}>
              {documents.results.map((document: any) => {
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
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          component="span"
                        >
                          {document.name}
                          <LanguageChip
                            language={document.language}
                            size="small"
                          />
                        </Typography>
                        {document.date && (
                          <Typography variant="body2">
                            {new Date(document.date).toLocaleDateString(
                              i18n.resolvedLanguage,
                              {
                                year: "numeric",
                              },
                            )}
                          </Typography>
                        )}
                      </Box>
                    </Link>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
          {(documentsPage !== 1 ||
            documents.count > documents.results.length) && (
            <Stack alignItems="center" mt={3}>
              <Pagination
                page={documentsPage}
                count={Math.ceil(
                  documents.count / API_DOCUMENTS_LIST_PAGE_SIZE,
                )}
                onChange={(e: any, value: number) => setDocumentsPage(value)}
              />
            </Stack>
          )}
        </>
      )}
    </>
  );

  return (
    <PageBase
      title={t("pages.resources-newsletters.title")}
      content={content}
      loading={!documents}
    />
  );
}

export default ResourcesNewslettersPage;
