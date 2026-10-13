import * as React from "react";
import MapMarkerTransport from "../MapMarkerTransport/MapMarkerTransport";
import MapMarkerEvent from "../MapMarkerEvent/MapMarkerEvent";
import "maplibre-gl/dist/maplibre-gl.css";
import { RMap, RMarker, RNavigationControl } from "maplibre-react-components";

export default function Map({
  coordinates,
  connections,
  zoom,
  eventType = undefined,
}: any) {
  return (
    <RMap
      minZoom={6}
      initialCenter={[coordinates[1], coordinates[0]]}
      initialZoom={zoom ? zoom : 15}
      mapStyle="https://tiles.versatiles.org/assets/styles/colorful/style.json"
    >
      <RNavigationControl position="top-right" visualizePitch={true} />
      {connections &&
        connections.length > 0 &&
        connections.map((connection: any) => {
          return (
            <>
              <RMarker
                longitude={connection.coordinate_lon}
                latitude={connection.coordinate_lat}
                initialAnchor="center"
                onClick={() => {
                  window
                    .open(
                      "http://google.com/maps/place/" +
                        [
                          connection.coordinate_lat,
                          connection.coordinate_lon,
                        ].join(","),
                      "_blank",
                    )
                    .focus();
                }}
              >
                <MapMarkerTransport transportType={connection.type} />
              </RMarker>
            </>
          );
        })}
      <RMarker
        longitude={coordinates[1]}
        latitude={coordinates[0]}
        initialAnchor="center"
        onClick={() => {
          window
            .open(
              "http://google.com/maps/place/" + coordinates.join(","),
              "_blank",
            )
            .focus();
        }}
      >
        <MapMarkerEvent eventType={eventType} />
      </RMarker>
    </RMap>
  );
}
