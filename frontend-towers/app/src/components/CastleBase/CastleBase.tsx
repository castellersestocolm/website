import styles from "./styles.module.css";
import * as React from "react";
import Box from "@mui/material/Box";
import { Stage, Layer, Rect, Text } from "react-konva";
import { PositionType } from "../../enums";
import { useAppContext } from "../AppContext/AppContext";
import { useEffect, useRef, useState } from "react";

const COLOUR_BG_BY_POSITION_TYPE: any = {
  10: "#8080ff",
  20: "#9cff9c",
  30: "#ff0",
  40: "#a448ff",
  50: "#ffd1a3",
  60: "#ffaeae",
  70: "#a3d5ff",
  80: "#ffaeae",
  90: "#c1ffc1",
  100: "#cfcfcf",
  110: "#cfcfcf",
  120: "#cfcfcf",
  130: "#cfcfcf",
  140: "#cfcfcf",
  150: "#cfcfcf",
  160: "#e5a4d9",
  170: "#e5a4d9",
  180: "#e5a4d9",
};

const COLOUR_TEXT_BY_POSITION_TYPE: any = {
  10: "#fff",
  20: "#1d1d1d",
  30: "#1d1d1d",
  40: "#fff",
  50: "#1d1d1d",
  60: "#1d1d1d",
  70: "#1d1d1d",
  80: "#1d1d1d",
  90: "#1d1d1d",
  100: "#1d1d1d",
  110: "#1d1d1d",
  120: "#1d1d1d",
  130: "#1d1d1d",
  140: "#1d1d1d",
  150: "#1d1d1d",
  160: "#1d1d1d",
  170: "#1d1d1d",
  180: "#1d1d1d",
};

export default function CastleBase({ castle }: any) {
  const castlePlaces =
    castle &&
    castle.places.filter(
      (castlePlace: any) => castlePlace.position.type != null,
    );

  const minX = Math.min(
    ...castlePlaces.map((castlePlace: any) => castlePlace.placement.x),
  );
  const minY = Math.min(
    ...castlePlaces.map((castlePlace: any) => castlePlace.placement.y),
  );
  const maxX = Math.max(
    ...castlePlaces.map((castlePlace: any) => castlePlace.placement.x),
  );
  const maxY = Math.max(
    ...castlePlaces.map((castlePlace: any) => castlePlace.placement.y),
  );

  const sceneWidth = maxX - minX + 200;
  const sceneHeight = maxY - minY + 50;

  const [stageSize, setStageSize] = useState({
    width: sceneWidth,
    height: sceneHeight,
    scale: 1,
  });

  const containerRef = useRef(null);

  const updateSize = () => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;

    const scale = containerWidth / sceneWidth;

    setStageSize({
      width: sceneWidth * scale,
      height: sceneHeight * scale,
      scale: scale,
    });
  };

  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, [updateSize]);

  return (
    <Box className={styles.containerCastle} ref={containerRef}>
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        scaleX={stageSize.scale}
        scaleY={stageSize.scale}
      >
        <Layer>
          {castlePlaces.map((castlePlace: any) => {
            const castlePlaceText = (
              <Text
                text={
                  castlePlace.user &&
                  castlePlace.user.towers &&
                  castlePlace.user.towers.alias
                    ? castlePlace.user.towers.alias
                    : castlePlace.extra.text
                }
                align="center"
                fontSize={16}
                fontFamily="DM Sans,Roboto,Arial,sans-serif"
                x={castlePlace.placement.x - minX + 100}
                y={
                  castlePlace.placement.y -
                  minY +
                  25 +
                  castlePlace.size.height / 2 -
                  8
                }
                width={castlePlace.size.width}
                rotation={castlePlace.placement.angle}
                fill={
                  castlePlace.is_user
                    ? "white"
                    : COLOUR_TEXT_BY_POSITION_TYPE[castlePlace.position.type]
                }
              />
            );
            return (
              <>
                <Rect
                  x={castlePlace.placement.x - minX + 100}
                  y={castlePlace.placement.y - minY + 25}
                  width={castlePlace.size.width}
                  height={castlePlace.size.height}
                  rotation={castlePlace.placement.angle}
                  fill={
                    castlePlace.is_user
                      ? "black"
                      : COLOUR_BG_BY_POSITION_TYPE[castlePlace.position.type]
                  }
                />
                {castlePlaceText}
              </>
            );
          })}
        </Layer>
      </Stage>
    </Box>
  );
}
