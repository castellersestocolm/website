import * as React from "react";
import "leaflet/dist/leaflet.css";
import IconLocationOn from "@mui/icons-material/LocationOn";
import { Marker, Tooltip } from "react-leaflet";
import { DivIcon } from "leaflet";
import { renderToString } from "react-dom/server";
import styles from "./styles.module.css";
import Box from "@mui/material/Box";

interface CustomMarkerProps {
  name: string;
  position: L.LatLngExpression;
  direction: string;
}

const MapMarker: React.FC<CustomMarkerProps> = ({
  name,
  position,
  direction,
}: any) => {
  const customIcon = new DivIcon({
    html: renderToString(
      <Box className={styles.markerIcon}>
        <IconLocationOn />
      </Box>,
    ),
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    className: styles.marker,
  });

  const eventHandlers = {
    click: () => {
      window
        .open("http://google.com/maps/place/" + position.join(","), "_blank")
        .focus();
    },
  };

  return (
    <Marker position={position} icon={customIcon} eventHandlers={eventHandlers}>
      {name && (
        <Tooltip
          direction={direction ? direction : "right"}
          offset={[direction === "right" ? 22 : -20, 0]}
          opacity={1}
          permanent
          className={styles.markerTooltip}
          eventHandlers={eventHandlers}
        >
          {name}
        </Tooltip>
      )}
    </Marker>
  );
};

export default MapMarker;
