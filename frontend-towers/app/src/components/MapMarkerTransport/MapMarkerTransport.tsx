import { memo } from "react";
import {TRANSPORT_MODE_ICON} from "../../enums";
import Box from "@mui/material/Box";
import styles from "./styles.module.css";

function MapMarkerTransport({transportType}: any) {
  return (
      <Box className={styles.iconTransport}>
        {TRANSPORT_MODE_ICON[transportType]}
      </Box>
  );
}

export default memo(MapMarkerTransport);
