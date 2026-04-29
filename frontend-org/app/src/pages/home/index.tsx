import styles from "./styles.module.css";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import { wpApiMediaRetrieve, wpApiPostList } from "../../api/wp";
import Page from "../../components/Page/Page";
import Alerts from "../../components/Alerts/Alerts";
import IconLogo from "../../components/IconLogo/IconLogo.jsx";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Stack,
  Pagination,
  Button,
  Link,
} from "@mui/material";
import { datetimeToLongString } from "../../utils/datetime";
import { useAppContext } from "../../components/AppContext/AppContext";
import { ROUTES } from "../../routes";
import ImageHero1 from "../../assets/images/hero/hero1.jpg";
import ImageHero2 from "../../assets/images/hero/hero2.jpg";
import ImageHero3 from "../../assets/images/hero/hero3.jpg";
import ImageHero4 from "../../assets/images/hero/hero4.jpg";
import ImageHero5 from "../../assets/images/hero/hero5.jpg";
import ImageHero6 from "../../assets/images/hero/hero6.jpg";
import ImageHero7 from "../../assets/images/hero/hero7.jpg";
import ImageHero8 from "../../assets/images/hero/hero8.jpg";
import ImageHero9 from "../../assets/images/hero/hero9.jpg";
import ImageHeroNewsletters from "../../assets/images/heros/newsletters.jpg";
import { LoaderClip } from "../../components/LoaderClip/LoaderClip";
import IconEast from "@mui/icons-material/East";
import { apiDocumentList, apiEventList } from "../../api";
import { DocumentType, EventType } from "../../enums";
import Hero from "../../components/Hero/Hero";

const BACKEND_BASE_URL = new URL(process.env.REACT_APP_ORG_API_URL).origin;

function HomePage() {
  const [t, i18n] = useTranslation("common");

  const { user, messages } = useAppContext();

  let navigate = useNavigate();

  const [wpPostsPage, setWpPostsPage] = React.useState(1);
  const [wpPosts, setWpPosts] = React.useState(undefined);
  const [wpMediaById, setWpMediaById] = React.useState<any>({});

  const [highligtedEvent, setHighlightedEvent] = React.useState(undefined);

  const [slideshowImageIndex, setSlideshowImageIndex] = React.useState(0);

  const slideshowImages = [
    ImageHero1,
    ImageHero8,
    ImageHero7,
    ImageHero9,
    ImageHero6,
    ImageHero5,
    ImageHero4,
    ImageHero3,
    ImageHero2,
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSlideshowImageIndex(
        (prevSlideshowImageIndex: number) =>
          (prevSlideshowImageIndex + 1) % slideshowImages.length,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [setSlideshowImageIndex, slideshowImages.length]);

  function handleWpPostClick(year: string, month: string, slug: string) {
    navigate(
      ROUTES["news-post"].path
        .replace(":year", year)
        .replace(":month", month)
        .replace(":slug", slug),
    );
  }

  React.useEffect(() => {
    wpApiPostList(i18n.resolvedLanguage, wpPostsPage).then((response) => {
      if (response.status === 200) {
        setWpPosts(response);
        if (response && response.data && response.data.length > 0) {
          for (let i = 0; i < response.data.length; i++) {
            const wpPost = response.data[i];
            if (wpPost.featured_media) {
              wpApiMediaRetrieve(wpPost.featured_media).then((response) => {
                if (response.status === 200) {
                  setWpMediaById((prevWpMediaById: any) => ({
                    ...prevWpMediaById,
                    [wpPost.featured_media]: response,
                  }));
                }
              });
            }
          }
        }
      }
    });
  }, [setWpPosts, wpPostsPage, setWpMediaById, i18n.resolvedLanguage]);

  React.useEffect(() => {
    apiEventList(1, 1, undefined, undefined, undefined, undefined, undefined, [
      EventType.GENERAL,
      EventType.TALK,
      EventType.GATHERING,
      EventType.WORKSHOP,
    ]).then((response) => {
      if (response.status === 200 && response.data.results.length > 0) {
        setHighlightedEvent(response.data.results[0]);
      }
    });
  }, [setHighlightedEvent, i18n.resolvedLanguage]);

  const hero = (
    <>
      <Box component="section" className={styles.hero}>
        <Box
          component="section"
          className={styles.heroInner}
          sx={{
            marginTop: { xs: "56px", md: "65px" },
            padding: {
              xs: messages ? "32px 0 64px 0" : "64px 0",
              md: messages ? "64px 0 132px 0" : "132px 0",
            },
          }}
        >
          <Container
            maxWidth="xl"
            sx={{
              position: "relative",
            }}
          >
            <Alerts />
            <Grid
              container
              spacing={2}
              sx={{ textAlign: { xs: "center", md: "left" } }}
              className={styles.heroGrid}
            >
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{ marginBottom: { xs: "32px", md: "0" } }}
              >
                <Box className={styles.heroLogo}>
                  <IconLogo />
                </Box>
                <Typography
                  variant="h3"
                  fontWeight="700"
                  className={styles.heroTitle}
                >
                  {t("pages.home-hero.title")}
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="700"
                  className={styles.heroSubtitle}
                >
                  {t("pages.home-hero.subtitle")}
                </Typography>
                <Typography variant="h6" className={styles.heroSubtitle}>
                  {user
                    ? t("pages.home-hero.subtitle3") +
                      (user.firstname ? ", " + user.firstname : "") +
                      "!"
                    : t("pages.home-hero.subtitle2")}
                </Typography>
                {!user && (
                  <Button
                    variant="outlined"
                    href={ROUTES["user-join"].path}
                    target={"_self"}
                    className={styles.heroButton}
                    disableElevation
                  >
                    {t("pages.home-join.list.button-join")}
                  </Button>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{ height: { xs: "300px", md: "500px" } }}
                  className={styles.heroImageBox}
                >
                  {slideshowImages
                    .concat(slideshowImages[0])
                    .map((slideshowImage: any, idx: number) => {
                      const isVisible =
                        idx === slideshowImageIndex ||
                        idx === slideshowImageIndex + 1 ||
                        (slideshowImageIndex >= slideshowImages.length - 1
                          ? idx === 0
                          : false);
                      return (
                        <Box
                          className={styles.heroImage}
                          style={{
                            backgroundImage: "url(" + slideshowImage + ")",
                            visibility: isVisible ? "visible" : "hidden",
                            opacity: isVisible ? 1 : 0,
                          }}
                        ></Box>
                      );
                    })}
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
      {highligtedEvent && (
        <Hero
          title={highligtedEvent.title}
          subtitle={datetimeToLongString(
            i18n.resolvedLanguage,
            highligtedEvent.time_from,
          )}
          hero={
            highligtedEvent.picture &&
            BACKEND_BASE_URL + highligtedEvent.picture.medium
          }
          content={
            <Box>
              {highligtedEvent.location && (
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="white"
                  align="center"
                  mt={1}
                >
                  <Link
                    color="white"
                    underline="none"
                    href={
                      "http://google.com/maps/place/" +
                      highligtedEvent.location.coordinate_lat +
                      "," +
                      highligtedEvent.location.coordinate_lon
                    }
                    target="_blank"
                  >
                    {highligtedEvent.location.name}
                  </Link>
                </Typography>
              )}
              {/*<Grid size={12} marginTop="24px">
                <Stack
                  direction="row"
                  spacing={2}
                  className={styles.joinButtons}
                >
                  <Button
                    variant="contained"
                    href={ROUTES["calendar-event"].path
                      .replace(":year", highligtedEvent.time_from.slice(0, 4))
                      .replace(":month", highligtedEvent.time_from.slice(5, 7))
                      .replace(":day", highligtedEvent.time_from.slice(8, 10))
                      .replace(":code", highligtedEvent.code)}
                    disableElevation
                  >
                    {t("pages.home-highlight.button-info")}
                  </Button>
                </Stack>
              </Grid>*/}
            </Box>
          }
        />
      )}
    </>
  );

  const footer = (
    <>
      <Hero
        title={t("pages.home-newsletters.title")}
        subtitle={t("pages.home-newsletters.subtitle")}
        hero={ImageHeroNewsletters}
        content={
          <Box>
            <Grid size={12} marginTop="24px">
              <Stack direction="row" spacing={2} className={styles.joinButtons}>
                <Button
                  variant="contained"
                  href={ROUTES["resources-newsletters"].path}
                  disableElevation
                >
                  {t("pages.home-newsletters.button-read")}
                </Button>
              </Stack>
            </Grid>
          </Box>
        }
      />
    </>
  );

  const content = (
    <>
      <Box component="section" className={styles.postsGrid}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            fontWeight="700"
            className={styles.postsTitle}
          >
            {t("pages.home-posts.title")}
          </Typography>
          {wpPosts ? (
            <>
              <Grid container spacing={4} className={styles.postsInnerGrid}>
                {wpPosts &&
                  wpPosts.data &&
                  wpPosts.data.length > 0 &&
                  wpPosts.data.map((wpPost: any) => {
                    return (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Card
                          className={styles.postCard}
                          elevation={0}
                          onClick={() =>
                            handleWpPostClick(
                              wpPost.date.slice(0, 4),
                              wpPost.date.slice(5, 7),
                              wpPost.slug,
                            )
                          }
                        >
                          <CardActionArea>
                            {wpMediaById &&
                            wpPost.featured_media &&
                            wpPost.featured_media in wpMediaById ? (
                              <CardMedia
                                component="img"
                                height="300"
                                image={
                                  wpMediaById[wpPost.featured_media].data
                                    .source_url
                                }
                              />
                            ) : undefined}
                            <CardContent className={styles.postCardContent}>
                              <Typography
                                gutterBottom
                                variant="h5"
                                fontWeight={700}
                                mb={1}
                                lineHeight={1.2}
                              >
                                {wpPost.title.rendered}
                              </Typography>
                              <Typography gutterBottom variant="body2" mb={0}>
                                {datetimeToLongString(
                                  i18n.resolvedLanguage,
                                  wpPost.date,
                                )}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "text.secondary" }}
                                component="div"
                              >
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: wpPost.excerpt.rendered,
                                  }}
                                ></div>
                              </Typography>
                              <Stack direction="column" spacing={1} mb={1}>
                                <Link
                                  onClick={() =>
                                    handleWpPostClick(
                                      wpPost.date.slice(0, 4),
                                      wpPost.date.slice(5, 7),
                                      wpPost.slug,
                                    )
                                  }
                                  color="secondary"
                                  underline="none"
                                  className={styles.link}
                                >
                                  <Typography variant="body1" component="span">
                                    {t("pages.home-posts.link-more")}
                                  </Typography>
                                  <IconEast className={styles.iconEast} />
                                </Link>
                              </Stack>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    );
                  })}
              </Grid>
              {wpPosts.data.length > 0 &&
                (wpPostsPage !== 1 ||
                  wpPosts.headers["x-wp-total"] > wpPosts.data.length) && (
                  <Stack alignItems="center">
                    <Pagination
                      page={wpPostsPage}
                      count={wpPosts.headers["x-wp-totalpages"]}
                      onChange={(e: any, value: number) =>
                        setWpPostsPage(value)
                      }
                    />
                  </Stack>
                )}
            </>
          ) : (
            <Box className={styles.pageLoader}>
              <LoaderClip />
            </Box>
          )}
        </Container>
      </Box>
    </>
  );

  return (
    <Page hero={hero} content={content} footer={footer} loading={!wpPosts} />
  );
}

export default HomePage;
