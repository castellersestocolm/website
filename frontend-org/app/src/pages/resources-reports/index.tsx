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
import { LoaderClip } from "../../components/LoaderClip/LoaderClip";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_ORG_API_URL).origin;

function ResourcesReportsPage() {
  const [t, i18n] = useTranslation("common");

  const [documentsPage, setDocumentsPage] = React.useState(1);
  const [isReady, setIsReady] = React.useState(false);
  const [documents, setDocuments] = React.useState(undefined);

  React.useEffect(() => {
    setIsReady(false);
    apiDocumentList(
      documentsPage,
      undefined,
      [DocumentType.REPORT, DocumentType.FINANCIAL],
      ["date"],
    ).then((response) => {
      if (response.status === 200) {
        setDocuments(response.data);
      }
    });
    setIsReady(true);
  }, [setDocuments, setIsReady, documentsPage, i18n.resolvedLanguage]);

  function handleChangeDocumentsPage(value: number) {
    setIsReady(false);
    setDocumentsPage(value);
  }

  const content = (
    <Box mt={3}>
      {documents && documents.results.length > 0 && (
        <>
          {!isReady ? (
            <Box className={styles.pageLoader}>
              <LoaderClip />
            </Box>
          ) : (
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
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight="600"
                              component="span"
                              paddingRight="8px"
                            >
                              {document.name}
                            </Typography>
                            <LanguageChip
                              language={document.language}
                              size="small"
                              marginLeft={0}
                            />
                          </Box>
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
          )}
          {(documentsPage !== 1 ||
            documents.count > documents.results.length) && (
            <Stack alignItems="center" mt={4}>
              <Pagination
                page={documentsPage}
                count={Math.ceil(
                  documents.count / API_DOCUMENTS_LIST_PAGE_SIZE,
                )}
                onChange={(e: any, value: number) =>
                  handleChangeDocumentsPage(value)
                }
              />
            </Stack>
          )}
        </>
      )}
    </Box>
  );

  return (
    <PageBase
      title={t("pages.resources-reports.title")}
      content={content}
      loading={!documents}
    />
  );
}

export default ResourcesReportsPage;
