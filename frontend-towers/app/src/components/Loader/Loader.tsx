import { BarLoader } from "react-spinners";
import * as React from "react";
import styles from "./styles.module.css";
import { useTheme } from "@mui/material";
import Box from "@mui/material/Box";

export const Loader = (props: any) => {
  const theme = useTheme();

  return (
    <Box className={styles.loaderBox}>
      <BarLoader
        color={theme.palette.primary.main}
        loading={props.loading != null ? props.loading : true}
        aria-label="Loading"
        data-testid="loader"
        height={8}
        width="100%"
        speedMultiplier={0.75}
        className={styles.loader}
      />
    </Box>
  );
};
