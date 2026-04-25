import styles from "./styles.module.css";
import { Container, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import { LoaderClip } from "../LoaderClip/LoaderClip";

export default function PageBase({
  title,
  subtitle = undefined,
  content,
  loading = false,
}: any) {
  return (
    <>
      <Box
        component="section"
        className={styles.page}
        sx={{
          marginTop: { xs: "56px", md: "65px" },
          padding: { xs: "32px 0", md: "64px 0" },
          ...(loading
            ? {
                position: "absolute",
                bottom: 0,
                top: 0,
                left: 0,
                right: 0,
                alignItems: "start",
                display: "flex",
                flexGrow: 1,
                flexDirection: "column",
                zIndex: -100,
              }
            : {}),
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
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
          <Box className={styles.pageHeader}>
            <Typography
              variant="h3"
              fontWeight="700"
              className={styles.pageTitle}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="h6"
                fontWeight="700"
                className={styles.pageSubtitle}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {loading ? (
            <Box className={styles.pageLoader}>
              <LoaderClip />
            </Box>
          ) : (
            content
          )}
        </Container>
      </Box>
    </>
  );
}
