import styles from "./styles.module.css";
import { Container, Typography, useTheme } from "@mui/material";
import * as React from "react";
import Box from "@mui/material/Box";
import { getColour } from "../../utils/colour";

export default function Hero({
  title,
  subtitle = undefined,
  content,
  hero,
  eventTheme = undefined,
}: any) {
  const theme = useTheme();

  return (
    <Container
      className={styles.heroContainer}
      sx={{
        minHeight: { xs: "300px", md: "500px" },
        backgroundColor:
          eventTheme && eventTheme.colour_primary
            ? getColour(theme, eventTheme.colour_primary)
            : theme.palette.grey["700"],
      }}
    >
      <Box className={styles.heroTitleBox}>
        <Typography variant="h3" fontWeight="700" className={styles.heroTitle}>
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="h5"
            fontWeight="700"
            mt={1}
            className={styles.heroTitle}
          >
            {subtitle}
          </Typography>
        )}
        {content}
      </Box>
      <Box
        className={styles.heroImage}
        style={{ backgroundImage: "url(" + hero + ")" }}
      />
    </Container>
  );
}
