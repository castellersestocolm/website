import styles from "./styles.module.css";
import { Container, Typography } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";

export default function HeroKulturfestivalen({ title, content, hero }: any) {
  return (
    <Container
      className={styles.heroContainer}
      sx={{ minHeight: { xs: "300px", md: "500px" } }}
    >
      <Box className={styles.heroTitleBox}>
        <Typography variant="h3" fontWeight="700" className={styles.heroTitle}>
          {title}
        </Typography>
        {content}
      </Box>
      <Box
        className={styles.heroImage}
        style={{ backgroundImage: "url(" + hero + ")" }}
      />
    </Container>
  );
}
