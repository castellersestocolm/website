import styles from "./styles.module.css";
import {
  Typography,
  Link,
  ListItem,
  List,
  ListItemText,
  Stack,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import { wpApiMediaRetrieve, wpApiPostList } from "../../api/wp";
import { datetimeToLongString } from "../../utils/datetime";
import { ROUTES } from "../../routes";
import IconWest from "@mui/icons-material/West";

function NewsPostPage() {
  const [t, i18n] = useTranslation("common");
  const { year, month, slug } = useParams();

  const [wpPost, setWpPost] = React.useState(undefined);
  const [wpMedia, setWpMedia] = React.useState(undefined);

  React.useEffect(() => {
    wpApiPostList(undefined, undefined, undefined, slug).then((response) => {
      if (
        response.status === 200 &&
        response.data &&
        response.data.length > 0
      ) {
        const currWpPost = response.data[0];
        setWpPost(currWpPost);
        if (currWpPost.featured_media) {
          wpApiMediaRetrieve(currWpPost.featured_media).then((response) => {
            if (response.status === 200 && response.data) {
              setWpMedia(response.data);
            }
          });
        }
      }
    });
  }, [setWpPost, setWpMedia, slug, i18n.resolvedLanguage]);

  console.log(wpMedia);

  const content = (
    <>
      {wpPost && (
        <Box className={styles.postContainerBox}>
          {wpMedia && (
            <img className={styles.postImage} src={wpMedia.source_url} />
          )}
          <Box className={styles.postContentBox}>
            <Typography variant="body1" component="div">
              <div
                dangerouslySetInnerHTML={{
                  __html: wpPost.content.rendered,
                }}
              ></div>
            </Typography>
          </Box>
          <Stack direction="column" spacing={1} className={styles.postLinks}>
            <Link
              href={ROUTES.home.path}
              color="secondary"
              underline="none"
              className={styles.link}
            >
              <IconWest className={styles.iconWest} />
              {t("pages.news-post.link-back")}
            </Link>
          </Stack>
        </Box>
      )}
    </>
  );

  return (
    <PageBase
      title={wpPost && wpPost.title.rendered}
      subtitle={
        wpPost && datetimeToLongString(i18n.resolvedLanguage, wpPost.date)
      }
      content={content}
      loading={!wpPost}
    />
  );
}

export default NewsPostPage;
