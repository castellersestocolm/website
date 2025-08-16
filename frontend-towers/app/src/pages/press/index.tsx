import styles from "./styles.module.css";
import { Card, Stack, Typography } from "@mui/material";
import * as React from "react";
import ImageHeroPress from "../../assets/images/heros/press.jpg";
import { useTranslation } from "react-i18next";
import { apiMediaReleaseList } from "../../api";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import Pagination from "@mui/material/Pagination";
import markdown from "@wcj/markdown-to-html";
import { API_MEDIA_PRESS_LIST_PAGE_SIZE } from "../../consts";
import Grid from "@mui/material/Grid";
import { capitalizeFirstLetter } from "../../utils/string";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import Box from "@mui/material/Box";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_API_BASE_URL).origin;

function PressPage() {
  const [t, i18n] = useTranslation("common");
  let navigate = useNavigate();

  const [pressPage, setPressPage] = React.useState(1);
  const [releases, setReleases] = React.useState(undefined);

  React.useEffect(() => {
    apiMediaReleaseList(pressPage).then((response) => {
      if (response.status === 200) {
        setReleases(response.data);
      }
    });
  }, [setReleases, pressPage, i18n.resolvedLanguage]);

  function handlePressReleaseClick(
    year: string,
    month: string,
    day: string,
    slug: string,
  ) {
    console.log(year, month, day, slug);
    navigate(
      ROUTES["press-release"].path
        .replace(":year", year)
        .replace(":month", month)
        .replace(":day", day)
        .replace(":slug", slug),
    );
  }

  const content = (
    <>
      <Typography
        variant="h4"
        fontWeight="700"
        align="center"
        marginBottom="48px"
      >
        {t("pages.press.releases.title")}
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

  return (
    <PageImageHero
      title={t("pages.press.title")}
      content={content}
      hero={ImageHeroPress}
      loading={!releases}
    />
  );
}

export default PressPage;
