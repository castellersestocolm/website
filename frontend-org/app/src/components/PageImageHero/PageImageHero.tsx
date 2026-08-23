import styles from "./styles.module.css";
import Alerts from "../Alerts/Alerts";
import { Container } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Hero from "../Hero/Hero";
import { LoaderClip } from "../LoaderClip/LoaderClip";

export default function PageImageHero({
  title,
  subtitle = undefined,
  content,
  contentPost,
  hero,
  loading = false,
  mobileFull = false,
}: any) {
  return (
    <>
      <Box
        component="section"
        className={styles.page}
        sx={{
          marginTop: { xs: mobileFull ? "0" : "56px", md: "65px" },
          padding: { xs: mobileFull ? "0" : "32px 0", md: "64px 0" },
          ...(loading
            ? {
                position: "absolute",
                bottom: 0,
                top: 0,
                left: 0,
                right: 0,
                alignItems: "stretch",
                display: "flex",
                flexGrow: 1,
                flexDirection: "row",
                zIndex: -100,
              }
            : {}),
        }}
      >
        <Grid
          direction="column"
          display="flex"
          alignItems="center"
          flexDirection="column"
          sx={
            loading
              ? {
                  alignItems: "stretch",
                  display: "flex",
                  flexGrow: 1,
                  flexDirection: "column",
                }
              : {}
          }
        >
          <Hero title={title} subtitle={subtitle} hero={hero} />
          {content && (
            <Container
              maxWidth="xl"
              sx={{
                marginTop: { xs: mobileFull ? "0" : "16px", md: "32px" },
                paddingTop: { xs: mobileFull ? "0" : "32px", md: "64px" },
                paddingBottom: { xs: mobileFull ? "0" : "24px", md: "32px" },
                paddingLeft: { xs: mobileFull ? "0" : "calc(2 * var(--mui-spacing))" },
                paddingRight: { xs: mobileFull ? "0" : "calc(2 * var(--mui-spacing))" },
                position: "relative",
                ...(loading
                  ? {
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                    }
                  : {}),
              }}
            >
              <Alerts />
              {loading ? (
                <Box className={styles.pageLoader}>
                  <LoaderClip />
                </Box>
              ) : (
                content
              )}
            </Container>
          )}
        </Grid>
      </Box>
      {contentPost}
    </>
  );
}
