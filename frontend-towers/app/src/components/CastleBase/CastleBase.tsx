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
  10: "#3c3c3c",
  20: "#f9b900",
  30: "#008546",
  40: "#f1f1f1",
  50: "#844f91",
  60: "#0a82c6",
  70: "#b75945",
  80: "#e3233d",
  90: "#bebebe",
  100: "#cfcfcf",
  110: "#cfcfcf",
  120: "#cfcfcf",
  130: "#cfcfcf",
  140: "#cfcfcf",
  150: "#cfcfcf",
  160: "#ef62a1",
  170: "#ef62a1",
  180: "#ef62a1",
  200: "#ef62a1",
};

const COLOUR_TEXT_BY_POSITION_TYPE: any = {
  10: "#fff",
  20: "#1d1d1d",
  30: "#fff",
  40: "#1d1d1d",
  50: "#fff",
  60: "#fff",
  70: "#fff",
  80: "#fff",
  90: "#1d1d1d",
  100: "#1d1d1d",
  110: "#1d1d1d",
  120: "#1d1d1d",
  130: "#1d1d1d",
  140: "#1d1d1d",
  150: "#1d1d1d",
  160: "#fff",
  170: "#fff",
  180: "#fff",
  200: "#fff",
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
              castlePlace.size.width - (isUserOrFamily ? 2 : 1);
            const labelHeight =
              castlePlace.size.height - (isUserOrFamily ? 2 : 1);
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
                    fill={COLOUR_BG_BY_POSITION_TYPE[castlePlace.position.type]}
                    stroke={"#1d1d1d"}
                    strokeWidth={isUserOrFamily ? 3 : 1}
                    dash={isUserOrFamily && [5, 2]}
                    cornerRadius={8}
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
                      COLOUR_TEXT_BY_POSITION_TYPE[castlePlace.position.type]
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
