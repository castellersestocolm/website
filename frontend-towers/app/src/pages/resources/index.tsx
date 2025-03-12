import styles from "./styles.module.css";
import { Container, Link, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import { useTranslation } from "react-i18next";
import ImagePositions1 from "../../assets/images/resources/positions-1.png";
import ImagePositions2 from "../../assets/images/resources/positions-2.png";
import ImagePositions3 from "../../assets/images/resources/positions-3.png";
import FilePositions1 from "../../assets/files/resources/positions-1.pdf";
import FilePositions2 from "../../assets/files/resources/positions-2.pdf";
import FilePositions3 from "../../assets/files/resources/positions-3.pdf";
import Alerts from "../../components/Alerts/Alerts";

function ResourcesPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Box
        component="section"
        className={styles.resources}
        sx={{
          marginTop: { xs: "57px", md: "65px" },
          padding: { xs: "32px 0", md: "64px 0" },
        }}
      >
        <Container maxWidth="xl">
          <Alerts />
          <Typography
            variant="h3"
            fontWeight="700"
            className={styles.resourcesTitle}
          >
            {t("pages.resources.title")}
          </Typography>
          <Grid container spacing={4} className={styles.resourcesGrid}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Link href={FilePositions1}>
                <img
                  src={ImagePositions1}
                  className={styles.resourcesFileImage}
                  alt="positions for a pillar"
                />
              </Link>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Link href={FilePositions2}>
                <img
                  src={ImagePositions2}
                  className={styles.resourcesFileImage}
                  alt="positions for a tower"
                />
              </Link>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Link href={FilePositions3}>
                <img
                  src={ImagePositions3}
                  className={styles.resourcesFileImage}
                  alt="positions for a three"
                />
              </Link>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

export default ResourcesPage;
