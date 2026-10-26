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
  description = undefined,
  content,
  contentPost,
  hero,
  loading = false,
  mobileFull = false,
  eventTheme = undefined,
}: any) {
  return (
    <>
      <Box
        component="section"
        className={styles.page}
        sx={{
          marginTop: { xs: "56px", md: "65px" },
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
          <Hero
            title={title}
            subtitle={subtitle}
            description={description}
            hero={hero}
            eventTheme={eventTheme}
          />
          {content && (
            <Container
              maxWidth="xl"
              sx={{
                paddingTop: mobileFull
                  ? "0"
                  : {
                      xs: "calc(4 * var(--mui-spacing))",
                      md: "calc(8 * var(--mui-spacing))",
                    },
                paddingLeft: mobileFull
                  ? "0"
                  : {
                      xs: "calc(3 * var(--mui-spacing))",
                      md: "calc(6 * var(--mui-spacing))",
                    },
                paddingRight: mobileFull
                  ? "0"
                  : {
                      xs: "calc(3 * var(--mui-spacing))",
                      md: "calc(6 * var(--mui-spacing))",
                    },
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
