import styles from "./styles.module.css";
import { Card, Typography, Link, Stack } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { apiMediaReleaseList, apiMediaReleaseRetrieve } from "../../api";
import markdown from "@wcj/markdown-to-html";
import { capitalizeFirstLetter } from "../../utils/string";
import PageBase from "../../components/PageBase/PageBase";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { ROUTES } from "../../routes";
import Pagination from "@mui/material/Pagination";
import { API_MEDIA_PRESS_LIST_PAGE_SIZE } from "../../consts";
import ImageHeroPress from "../../assets/images/heros/press.jpg";
import PageImageHero from "../../components/PageImageHero/PageImageHero";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_API_BASE_URL).origin;

function PressReleasePage() {
  const [t, i18n] = useTranslation("common");
  const { slug } = useParams();
  let navigate = useNavigate();

  const [release, setRelease] = React.useState(undefined);
  const [pressPage, setPressPage] = React.useState(1);
  const [releases, setReleases] = React.useState(undefined);

  React.useEffect(() => {
    if (slug) {
      apiMediaReleaseRetrieve(slug).then((response) => {
        if (response.status === 200) {
          setRelease(response.data);
        }
      });
    } else {
      apiMediaReleaseList(pressPage).then((response) => {
        if (response.status === 200) {
          setReleases(response.data);
        }
      });
    }
  }, [setRelease, setReleases, pressPage, slug, i18n.resolvedLanguage]);

  function handlePressReleaseClick(
    year: string,
    month: string,
    day: string,
    slug: string,
  ) {
    navigate(
      ROUTES["press-release-date"].path
        .replace(":year", year)
        .replace(":month", month)
        .replace(":day", day)
        .replace(":slug", slug),
    );
  }

  const content = slug ? (
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
                        elevation={0}
                        style={{
                          backgroundImage:
                            "url(" +
                            BACKEND_BASE_URL +
                            releaseImage.picture +
                            ")",
                        }}
                        className={styles.pressReleaseCard}
                      >
                        {releaseImage.footnote && (
                          <Box className={styles.pressReleaseFootnote}>
                            <Typography variant="caption">
                              {releaseImage.footnote}
                            </Typography>
                          </Box>
                        )}
                      </Card>
                    </Link>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}
    </>
  ) : (
    <>
      <Typography
        variant="h4"
        fontWeight="700"
        align="center"
        marginBottom="48px"
      >
        {t("pages.press-releases.title")}
      </Typography>
      <Grid
        container
        spacing={4}
        className={styles.pressGrid}
        display="flex"
        alignItems="stretch"
      >
        {releases && releases.results.length > 0 && (
          <>
            <Grid
              container
              size={{ xs: 12, md: 10, lg: 8 }}
              spacing={3}
              direction="column"
            >
              {releases.results.map((release: any) => {
                return (
                  <Card
                    key={release.id}
                    variant="outlined"
                    className={
                      new Date(release.date) >= new Date()
                        ? styles.pressCardUnpublished
                        : styles.pressCard
                    }
                    onClick={() =>
                      handlePressReleaseClick(
                        release.date.slice(0, 4),
                        release.date.slice(5, 7),
                        release.date.slice(8, 10),
                        release.slug,
                      )
                    }
                  >
                    <Grid container spacing={1}>
                      <Grid size={3} className={styles.pressCardImage}>
                        {release.images && release.images.length > 0 && (
                          <Box
                            style={{
                              backgroundImage:
                                "url(" +
                                BACKEND_BASE_URL +
                                release.images[0].picture +
                                ")",
                            }}
                            className={styles.pressCardImageBox}
                          ></Box>
                        )}
                      </Grid>
                      <Grid size={9} className={styles.pressCardText}>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          className={styles.pressCardTitle}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: markdown(release.title).toString(),
                            }}
                          ></div>
                        </Typography>
                        {release.subtitle && (
                          <Typography
                            variant="h6"
                            fontWeight={500}
                            mt={1}
                            color="textSecondary"
                            className={styles.pressCardTitle}
                          >
                            <div
                              dangerouslySetInnerHTML={{
                                __html: markdown(release.subtitle).toString(),
                              }}
                            ></div>
                          </Typography>
                        )}
                        <Typography variant="body1" component="div">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: markdown(
                                // Should remove non alphanumerical characters from the end perhaps
                                release.content
                                  .replace("\n", " ")
                                  .replace("\n\n", " ")
                                  .replace("  ", " ")
                                  .slice(0, release.subtitle ? 150 : 250)
                                  .trim(".")
                                  .trim(",")
                                  .trim(":")
                                  .trim(";")
                                  .trim() + "...",
                              ).toString(),
                            }}
                          ></div>
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={700}
                          mt={1}
                          color="textSecondary"
                        >
                          {capitalizeFirstLetter(
                            new Date(release.date).toLocaleDateString(
                              i18n.resolvedLanguage,
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            ),
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>
                );
              })}
            </Grid>
            {(pressPage !== 1 || releases.count > releases.results.length) && (
              <Stack alignItems="center">
                <Pagination
                  count={Math.ceil(
                    releases.count / API_MEDIA_PRESS_LIST_PAGE_SIZE,
                  )}
                  onChange={(e: any, value: number) => setPressPage(value)}
                />
              </Stack>
            )}
          </>
        )}
      </Grid>
    </>
  );

  return slug ? (
    <PageBase
      title={release && release.title}
      content={content}
      loading={!release}
    />
  ) : (
    <PageImageHero
      title={t("pages.press.title")}
      content={content}
      hero={ImageHeroPress}
      loading={!releases}
    />
  );
}

export default PressReleasePage;
