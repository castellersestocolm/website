import styles from "./styles.module.css";
import { Card, Typography, Link } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { apiMediaReleaseRetrieve } from "../../api";
import markdown from "@wcj/markdown-to-html";
import { capitalizeFirstLetter } from "../../utils/string";
import PageBase from "../../components/PageBase/PageBase";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_API_BASE_URL).origin;

function PressReleasePage() {
  const [t, i18n] = useTranslation("common");
  const { slug } = useParams();

  const [release, setRelease] = React.useState(undefined);

  React.useEffect(() => {
    apiMediaReleaseRetrieve(slug).then((response) => {
      if (response.status === 200) {
        setRelease(response.data);
      }
    });
  }, [setRelease, slug, i18n.resolvedLanguage]);

  const content = (
    <>
      {release && (
        <Box className={styles.pressContainerBox} mt={3}>
          {release.subtitle && (
            <Typography
              variant="h5"
              fontWeight={500}
              mt={1}
              mb={3}
              textAlign="center"
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: markdown(release.subtitle).toString(),
                }}
              ></div>
            </Typography>
          )}

          <Typography
            variant="h6"
            fontWeight={700}
            align="center"
            color="textSecondary"
            mb={3}
          >
            {capitalizeFirstLetter(
              new Date(release.date).toLocaleDateString(i18n.resolvedLanguage, {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            )}
          </Typography>
          <Typography variant="body1" component="div">
            <div
              dangerouslySetInnerHTML={{
                __html: markdown(release.content).toString(),
              }}
            ></div>
          </Typography>
          {release.images && release.images.length > 0 && (
            <Grid container spacing={2} mt={5}>
              {release.images.map((releaseImage: any) => {
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Link href={BACKEND_BASE_URL + releaseImage.picture}>
                      <Card
                        variant="outlined"
                        style={{
                          backgroundImage:
                            "url(" +
                            BACKEND_BASE_URL +
                            releaseImage.picture +
                            ")",
                        }}
                        className={styles.pressReleaseCard}
                      ></Card>
                    </Link>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}
    </>
  );

  return (
    <PageBase
      title={release && release.title}
      content={content}
      loading={!release}
    />
  );
}

export default PressReleasePage;
