import { memo } from "react";
import { EVENT_TYPE_ICON } from "../../enums";
import Box from "@mui/material/Box";
import styles from "./styles.module.css";
import { Typography, useTheme } from "@mui/material";
import IconPushPin from "@mui/icons-material/PushPin";
import { DynamicIcon } from "../DynamicIcon/DynamicIcon";
import { getColour } from "../../utils/colour";

function MapMarkerEvent({ name, eventType, eventTheme = undefined }: any) {
  const theme = useTheme();

  return (
    <Box className={styles.iconMarker}>
      <Box
        className={styles.iconEvent}
        sx={{
          backgroundColor:
            eventTheme && eventTheme.colour_primary
              ? getColour(theme, eventTheme.colour_primary)
              : theme.palette.primary.contrastText,
          color:
            eventTheme && eventTheme.colour_icon
              ? getColour(theme, eventTheme.colour_icon)
              : theme.palette.secondary.contrastText,
        }}
      >
        {eventTheme && eventTheme.icon ? (
          <DynamicIcon iconName={eventTheme.icon.code} />
        ) : eventType ? (
          EVENT_TYPE_ICON[eventType]
        ) : (
          <IconPushPin />
        )}
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
