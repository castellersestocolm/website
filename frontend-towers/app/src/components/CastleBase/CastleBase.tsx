import styles from "./styles.module.css";
import * as React from "react";
import Box from "@mui/material/Box";
import { Stage, Layer, Rect, Label, Text } from "react-konva";
import { useEffect, useRef, useState } from "react";
import { PositionType } from "../../enums";
import { compareTowerPlaceWithPositionObjects } from "../../utils/sort";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Switch } from "@mui/material";
import { useTranslation } from "react-i18next";

const COLOUR_BG_BY_POSITION_TYPE: any = {
  10: "#8080ff",
  20: "#9cff9c",
  30: "#ff0",
  40: "#a448ff",
  50: "#ffd1a3",
  60: "#a3d5ff",
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
  const { t } = useTranslation("common");

  const castlePlaces =
    castle &&
    castle.places.filter(
      (castlePlace: any) => castlePlace.position.type != null,
    );

  const castlePlacesPinya =
    castlePlaces &&
    castlePlaces.filter((castlePlace: any) => {
      const castleLinkedPlaces = castlePlaces
        .filter(
          (castleLinkedPlace: any) =>
            castleLinkedPlace.external_id === castlePlace.external_link_id ||
            castleLinkedPlace.external_id === castlePlace.external_id,
        )
        .sort(compareTowerPlaceWithPositionObjects);
      return (
        castlePlace.position.type < PositionType.TRONC_SEGON &&
        (castlePlace.position.type !== PositionType.BAIX ||
          (castleLinkedPlaces.length > 0 &&
            castleLinkedPlaces[0].external_id === castlePlace.external_id))
      );
    });
  const castlePlacesTronc =
    castlePlaces &&
    castlePlaces.filter((castlePlace: any) => {
      const castleLinkedPlaces = castlePlaces
        .filter(
          (castleLinkedPlace: any) =>
            castleLinkedPlace.external_id === castlePlace.external_link_id ||
            castleLinkedPlace.external_id === castlePlace.external_id,
        )
        .sort(compareTowerPlaceWithPositionObjects);
      return (
        castlePlace.position.type >= PositionType.TRONC_SEGON ||
        (castlePlace.position.type === PositionType.BAIX &&
          castleLinkedPlaces.length > 0 &&
          castleLinkedPlaces[0].external_id !== castlePlace.external_id)
      );
    });

  const [displayTronc, setDisplayTronc] = useState(false);

  const currentCastlePlaces = displayTronc
    ? castlePlacesTronc
    : castlePlacesPinya;

  const minX = Math.min(
    ...currentCastlePlaces.map((castlePlace: any) => castlePlace.placement.x),
  );
  const minY = Math.min(
    ...currentCastlePlaces.map((castlePlace: any) => castlePlace.placement.y),
  );
  const maxX = Math.max(
    ...currentCastlePlaces.map((castlePlace: any) => castlePlace.placement.x),
  );
  const maxY = Math.max(
    ...currentCastlePlaces.map((castlePlace: any) => castlePlace.placement.y),
  );

  const sceneWidth = maxX - minX + 150;
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

    const scale = Math.min(containerWidth / sceneWidth, 1.25);

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
        className={styles.stageCastle}
      >
        <Layer>
          {currentCastlePlaces.map((castlePlace: any) => {
            const isUserOrFamily = castlePlace.is_user || castlePlace.is_family;
            const labelWidth =
              castlePlace.size.width - (isUserOrFamily ? 2 : 0);
            const labelHeight =
              castlePlace.size.height - (isUserOrFamily ? 2 : 0);
            const labelX = castlePlace.placement.x + (isUserOrFamily ? 1 : 0.5);
            const labelY = castlePlace.placement.y + (isUserOrFamily ? 1 : 0.5);
            return (
              <>
                <Label
                  x={labelX - minX + (displayTronc ? 35 : 75)}
                  y={labelY - minY + (displayTronc ? 10 : 15)}
                  width={labelWidth}
                  height={labelHeight}
                  rotation={castlePlace.placement.angle}
                >
                  <Rect
                    width={labelWidth}
                    height={labelHeight}
                    fill={
                      isUserOrFamily
                        ? "#757575"
                        : COLOUR_BG_BY_POSITION_TYPE[castlePlace.position.type]
                    }
                    stroke={
                      isUserOrFamily
                        ? COLOUR_BG_BY_POSITION_TYPE[castlePlace.position.type]
                        : "#757575"
                    }
                    strokeWidth={isUserOrFamily ? 3 : 0.5}
                    cornerRadius={4}
                  />
                  <Text
                    text={
                      castlePlace.user &&
                      castlePlace.user.towers &&
                      castlePlace.user.towers.alias
                        ? castlePlace.user.towers.alias.toUpperCase()
                        : castlePlace.extra.text.toUpperCase()
                    }
                    fontFamily="DM Sans"
                    fontSize={Math.round(
                      Math.sqrt(
                        Math.pow(labelWidth, 2) + Math.pow(labelHeight, 2),
                      ) / 5.5,
                    )}
                    fontStyle={isUserOrFamily ? "bold" : "normal"}
                    align="center"
                    padding={2}
                    verticalAlign="middle"
                    fill={
                      isUserOrFamily
                        ? "white"
                        : COLOUR_TEXT_BY_POSITION_TYPE[
                            castlePlace.position.type
                          ]
                    }
                    width={labelWidth}
                    height={labelHeight}
                  />
                </Label>
              </>
            );
          })}
        </Layer>
      </Stage>
      <FormGroup>
        <FormControlLabel
          className={styles.optionsCastleSwitch}
          control={
            <Switch
              onChange={(event) => setDisplayTronc(event.target.checked)}
            />
          }
          label={t("pages.calendar.section.agenda.event.castles-troncs")}
        />
      </FormGroup>
    </Box>
  );
}
