import { ClipLoader } from "react-spinners";
import * as React from "react";
import styles from "./styles.module.css";
import { useTheme } from "@mui/material";
import Box from "@mui/material/Box";

export const LoaderClip = (props: any) => {
  const theme = useTheme();

  return (
    <Box className={styles.loaderBox}>
      <ClipLoader
        color={theme.palette.primary.main}
        loading={props.loading != null ? props.loading : true}
        aria-label="Loading"
        data-testid="loader"
        size={32}
        className={styles.loader}
      />
    </Box>
  );
};
