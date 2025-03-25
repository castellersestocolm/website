import * as React from "react";
import { MapContainer, Polyline, TileLayer } from "react-leaflet";
import styles from "./styles.module.css";
import MapMarker from "../MapMarker/MapMarker";
import MapConnectionMarker from "../MapConnectionMarker/MapConnectionMarker";

export default function Map({
  location,
  coordinates,
  connections,
  showConnectionLines,
  zoom,
}: any) {
  const coordinate_lats = [
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
  const coordinatesCentre = [
    (Math.min(...coordinate_lats) + Math.max(...coordinate_lats)) / 2,
    (Math.min(...coordinate_lons) + Math.max(...coordinate_lons)) / 2,
  ];

  return (
    <MapContainer
      key={coordinates}
      center={coordinatesCentre}
      zoom={zoom ? zoom : 15}
      scrollWheelZoom={false}
      className={styles.mapContainer}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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
    </MapContainer>
  );
}
