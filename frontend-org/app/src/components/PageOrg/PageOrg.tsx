import styles from "./styles.module.css";
import { Container, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import ImageLogo from "../../assets/images/header/logo.png";

export default function PageOrg({ title, subtitle, content }: any) {
  return (
    <>
      <Box
        component="section"
        className={styles.pageTitleBox}
        sx={{
          padding: { xs: "96px 0 32px 0", md: "128px 0 64px 0" },
        }}
      >
        <Container maxWidth="lg">
          <img src={ImageLogo} className={styles.logo} alt="logo" />
          <Typography
            variant="h3"
            fontWeight="700"
            className={styles.pageTitle}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="h5"
              fontWeight="700"
              className={styles.pageSubtitle}
            >
              {subtitle}
            </Typography>
          )}
        </Container>
      </Box>
      <Box
        component="section"
        className={styles.page}
        sx={{
          padding: { xs: "32px 0", md: "64px 0" },
        }}
      >
        <Container maxWidth="lg">{content}</Container>
      </Box>
    </>
  );
}
