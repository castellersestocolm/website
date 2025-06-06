import * as React from "react";
import { useTranslation } from "react-i18next";
import ImageHeroCalendar20250614AnniversaryPerformance from "../../assets/images/heros/calendar-2025-06-14-anniversary-performance.jpg";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import { CardContent, Link } from "@mui/material";
import styles from "./styles.module.css";
import Grid from "@mui/material/Grid";
import ImagePoster from "../../assets/images/calendar/2025/06/14/anniversary-performance/poster.jpg";
import FilePoster from "../../assets/files/calendar/2025/06/14/anniversary-performance/poster.pdf";
import Map from "../../components/Map/Map";

function Calendar20250614AnniversaryPerformancePage() {
  const { t } = useTranslation("common");

  const content = (
    <>
      <Grid
        container
        spacing={4}
        className={styles.eventGrid}
        alignItems={"stretch"}
      >
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Link href={FilePoster}>
            <img
              src={ImagePoster}
              className={styles.eventFileImage}
              alt="poster"
            />
          </Link>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }}>
          <CardContent className={styles.mapCard}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d2031.8363464579922!2d18.03483759535642!3d59.313270709506206!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNTnCsDE4JzQ3LjkiTiAxOMKwMDInMTMuOCJF!5e0!3m2!1sca!2sse!4v1749198237734!5m2!1sca!2sse"
              width="600"
              height="450"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </CardContent>
        </Grid>
      </Grid>
    </>
  );

  return (
    <PageImageHero
      title={t("pages.calendar-2025-06-14-anniversary-performance.title")}
      content={content}
      hero={ImageHeroCalendar20250614AnniversaryPerformance}
    />
  );
}

export default Calendar20250614AnniversaryPerformancePage;
