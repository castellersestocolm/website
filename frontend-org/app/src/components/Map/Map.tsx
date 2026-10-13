import * as React from "react";
import MapMarkerTransport from "../MapMarkerTransport/MapMarkerTransport";
import MapMarkerEvent from "../MapMarkerEvent/MapMarkerEvent";
import "maplibre-gl/dist/maplibre-gl.css";
import { RMap, RMarker, RNavigationControl } from "maplibre-react-components";

export default function Map({
  location,
  coordinates,
  connections,
  showConnectionLines,
  zoom,
  eventType = undefined,
}: any) {
  /*const coordinate_lats = [
    coordinates[0],
    ...(connections
      ? connections.map((connection: any) => connection.coordinate_lat)
      : []),
  ];
  const coordinate_lons = [
    coordinates[1],
    ...(connections
      ? connections.map((connection: any) => connection.coordinate_lon)
      : []),
  ];
  const coordinatesCentre: [number, number] = [
    (Math.min(...coordinate_lons) + Math.max(...coordinate_lons)) / 2,
    (Math.min(...coordinate_lats) + Math.max(...coordinate_lats)) / 2,
  ];*/

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
                <MapMarkerTransport
                  name={connection.name}
                  transportType={connection.type}
                />
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
    /*<MapContainer
      key={coordinates}
      // @ts-ignore
      center={coordinatesCentre}
      zoom={zoom ? zoom : 15}
      scrollWheelZoom={false}
      className={styles.mapContainer}
  >
    <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=cb1_2up7_1_d0d414edadc82b3cc1eaec4f"
    />
    <MapMarker
        name={location ? location.name : undefined}
        position={coordinates}
        direction={"right"}
    />
    {connections &&
        connections.length > 0 &&
        connections.map((connection: any) => {
          return (
              <>
                <MapConnectionMarker
                    name={connection.name}
                    position={[
                      connection.coordinate_lat,
                      connection.coordinate_lon,
                    ]}
                    transport={connection.type}
                    direction={
                      connection.coordinate_lon >= coordinates[1] ? "right" : "left"
                    }
                />
                <Polyline
                    positions={[
                      coordinates,
                      [connection.coordinate_lat, connection.coordinate_lon],
                    ]}
                    color="#1d1d1d"
                    weight={2}
                    dashArray="4 6"
                />
              </>
          );
        })}
  </MapContainer>*/
  );
}
