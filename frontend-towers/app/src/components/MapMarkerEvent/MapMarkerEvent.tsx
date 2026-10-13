import { memo } from "react";
import {EVENT_TYPE_ICON} from "../../enums";
import Box from "@mui/material/Box";
import styles from "./styles.module.css";

function MapMarkerEvent({eventType}: any) {
  return (
      <Box className={styles.iconEvent}>
        {EVENT_TYPE_ICON[eventType]}
      </Box>
  );
}

export default memo(MapMarkerEvent);
