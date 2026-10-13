import { memo } from "react";
import { TRANSPORT_MODE_ICON } from "../../enums";
import Box from "@mui/material/Box";
import styles from "./styles.module.css";
import { Typography } from "@mui/material";

function MapMarkerTransport({ name, transportType }: any) {
  return (
    <Box className={styles.iconMarker}><Box className={styles.iconTransport}>
      {TRANSPORT_MODE_ICON[transportType]}
    </Box>
      <Typography variant="body2" className={styles.iconText}>
        {name}
      </Typography>
    </Box>
  );
}

export default memo(MapMarkerTransport);
