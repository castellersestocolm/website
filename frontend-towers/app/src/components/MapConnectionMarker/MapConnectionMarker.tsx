import * as React from "react";
import "leaflet/dist/leaflet.css";
import { Marker, Tooltip } from "react-leaflet";
import { DivIcon } from "leaflet";
import { renderToString } from "react-dom/server";
import styles from "./styles.module.css";
import { TRANSPORT_MODE_ICON, TransportMode } from "../../enums";
import Box from "@mui/material/Box";

interface CustomMarkerProps {
  name: string;
  position: L.LatLngExpression;
  transport: TransportMode;
  direction: string;
}

const MapConnectionMarker: React.FC<CustomMarkerProps> = ({
  name,
  position,
  transport,
  direction,
}: any) => {
  const customIcon = new DivIcon({
    html: renderToString(
      <Box className={styles.markerIcon}>{TRANSPORT_MODE_ICON[transport]}</Box>,
    ),
    iconSize: [22, 22],
    iconAnchor: [11, 11],
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
          offset={[direction === "right" ? 19 : -15, 0]}
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

export default MapConnectionMarker;
