import { memo } from "react";
import { EVENT_TYPE_ICON } from "../../enums";
import Box from "@mui/material/Box";
import styles from "./styles.module.css";
import { Typography } from "@mui/material";
import IconPushPin from "@mui/icons-material/PushPin";

function MapMarkerEvent({ name, eventType }: any) {
  return (
    <Box className={styles.iconMarker}>
      <Box className={styles.iconEvent}>
        {eventType ? EVENT_TYPE_ICON[eventType] : <IconPushPin />}
      </Box>
      {name && (
        <Typography variant="body2" className={styles.iconText}>
          {name}
        </Typography>
      )}
    </Box>
  );
}

export default memo(MapMarkerEvent);
