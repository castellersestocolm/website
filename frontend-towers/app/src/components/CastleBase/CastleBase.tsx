import styles from "./styles.module.css";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import { Stage, Label, Layer, Rect, Text } from "react-konva";
import {
  getEnumLabel,
  PermissionLevel,
  PositionRelativePlacement,
  PositionType,
} from "../../enums";
import {
  compareTowerPlaceFamilyObjects,
  compareTowerPlaceWithPositionObjects,
} from "../../utils/sort";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Chip, Divider, Switch, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import { useAppContext } from "../AppContext/AppContext";

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

const COLOR_BG_BY_POSITION_TYPE_AND_RING: any = {
  50: [[2, "#ef62a1"]],
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

const COLOUR_BORDER_BY_POSITION_TYPE: any = {
  10: "#3c3c3c",
  20: "#f9b900",
  30: "#008546",
  40: "#1d1d1d",
  50: "#844f91",
  60: "#0a82c6",
  70: "#b75945",
  80: "#e3233d",
  90: "#1d1d1d",
  100: "#1d1d1d",
  110: "#1d1d1d",
  120: "#1d1d1d",
  130: "#1d1d1d",
  140: "#1d1d1d",
  150: "#1d1d1d",
  160: "#ef62a1",
  170: "#ef62a1",
  180: "#ef62a1",
  200: "#ef62a1",
};

const COLOR_BORDER_BY_POSITION_TYPE_AND_RING: any = {
  50: [[2, "#ef62a1"]],
};

const POSITION_TYPES_RELATIVE_TO_TYPE: any = {
  10: [
    3,
    [30, 40, 110],
    [
      PositionRelativePlacement.IN_FRONT,
      PositionRelativePlacement.IN_FRONT,
      PositionRelativePlacement.BELOW,
    ],
  ],
  20: [1, [10], [undefined]],
  30: [1, [10], [PositionRelativePlacement.IN_FRONT]],
  40: [1, [10], [PositionRelativePlacement.BEHIND]],
  50: [1, [40], [undefined]],
  60: [1, [10], [undefined]],
  70: [1, [10], [undefined]],
  80: [1, [60], [undefined]],
  90: [
    2,
    [50, 60, 70, 80, 90],
    [undefined, undefined, undefined, undefined, undefined],
  ],
  100: [
    2,
    [50, 60, 70, 80, 90, 100],
    [undefined, undefined, undefined, undefined, undefined],
  ],
  110: [
    1,
    [10, 120],
    [PositionRelativePlacement.ON_TOP, PositionRelativePlacement.BELOW],
  ],
  120: [
    1,
    [110, 130],
    [PositionRelativePlacement.ON_TOP, PositionRelativePlacement.BELOW],
  ],
  130: [
    1,
    [120, 140],
    [PositionRelativePlacement.ON_TOP, PositionRelativePlacement.BELOW],
  ],
  140: [
    1,
    [130, 150],
    [PositionRelativePlacement.ON_TOP, PositionRelativePlacement.BELOW],
  ],
  150: [
    1,
    [140, 160],
    [PositionRelativePlacement.ON_TOP, PositionRelativePlacement.BELOW],
  ],
  160: [
    1,
    [110, 120, 130, 140, 150],
    [
      PositionRelativePlacement.ON_TOP,
      PositionRelativePlacement.ON_TOP,
      PositionRelativePlacement.ON_TOP,
      PositionRelativePlacement.ON_TOP,
      PositionRelativePlacement.ON_TOP,
    ],
  ],
  170: [
    1,
    [110, 120, 130, 140, 150],
    [
      PositionRelativePlacement.ON_TOP,
      PositionRelativePlacement.ON_TOP,
      PositionRelativePlacement.ON_TOP,
      PositionRelativePlacement.ON_TOP,
      PositionRelativePlacement.ON_TOP,
    ],
  ],
  180: [
    1,
    [110, 120, 130, 140, 150],
    [
      PositionRelativePlacement.ON_TOP,
      PositionRelativePlacement.ON_TOP,
      PositionRelativePlacement.ON_TOP,
      PositionRelativePlacement.ON_TOP,
      PositionRelativePlacement.ON_TOP,
    ],
  ],
  200: [
    1,
    [110, 120, 130, 140, 150],
    [
      PositionRelativePlacement.ON_TOP,
      PositionRelativePlacement.ON_TOP,
      PositionRelativePlacement.ON_TOP,
      PositionRelativePlacement.ON_TOP,
      PositionRelativePlacement.ON_TOP,
    ],
  ],
};

const HEIGHT_FIELD_BY_POSITION_TYPE: any = {
  10: "height_shoulders",
  20: "height_shoulders",
  30: "height_arms",
  40: "height_shoulders",
  50: "height_arms",
  60: "height_arms",
  70: "height_arms",
  80: "height_arms",
  90: "height_shoulders",
  100: "height_shoulders",
  110: "height_shoulders",
  120: "height_shoulders",
  130: "height_shoulders",
  140: "height_shoulders",
  150: "height_shoulders",
  160: "height_shoulders",
  170: "height_shoulders",
  180: "height_shoulders",
  200: "height_shoulders",
};

export default function CastleBase({ castle }: any) {
  const { t } = useTranslation("common");
  const { user } = useAppContext();

  const castlePlaces =
    castle &&
    castle.places.filter(
      (castlePlace: any) => castlePlace.position.type != null,
    );

  const castleTexts =
    castle && castle.texts.filter((castleText: any) => castleText.text);

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

  const castlePlacesFamilyInit =
    castlePlaces &&
    castlePlaces.filter(
      (castlePlace: any) => castlePlace.is_user || castlePlace.is_family,
    );

  const castlePlacesFamilyExternalIds =
    castlePlacesFamilyInit &&
    castlePlacesFamilyInit
      .filter(
        (castlePlace: any) =>
          !castlePlace.external_link_id ||
          castlePlace.external_id <= castlePlace.external_link_id,
      )
      .map((castlePlace: any) => castlePlace.external_id);

  const castlePlacesFamily =
    castlePlacesFamilyInit &&
    castlePlacesFamilyInit.filter(
      (castlePlace: any) =>
        !castlePlacesFamilyExternalIds.includes(castlePlace.external_link_id),
    );

  const castlePlacesFamilyInstructions =
    castlePlacesFamily &&
    castlePlacesFamily
      .map((castlePlace: any) => {
        const otherCastlePlaces = castlePlaces.filter(
          (otherCastlePlace: any) =>
            (otherCastlePlace.external_next_id === castlePlace.external_id ||
              otherCastlePlace.external_id === castlePlace.external_next_id) &&
            otherCastlePlace.external_id !== castlePlace.external_id,
        );

        if (otherCastlePlaces.length > 0) {
          return [
            castlePlace,
            [
              [
                otherCastlePlaces.length === 1
                  ? otherCastlePlaces[0].external_id ===
                    castlePlace.external_next_id
                    ? PositionRelativePlacement.IN_FRONT
                    : PositionRelativePlacement.BEHIND
                  : PositionRelativePlacement.IN_BETWEEN,
                otherCastlePlaces,
              ],
            ],
          ];
        }

        const maxRelatives =
          POSITION_TYPES_RELATIVE_TO_TYPE[castlePlace.position.type][0];
        const relativeTypes =
          POSITION_TYPES_RELATIVE_TO_TYPE[castlePlace.position.type][1];
        const relativeRelatives =
          POSITION_TYPES_RELATIVE_TO_TYPE[castlePlace.position.type][2];

        const relativeCastlePlaces = castlePlaces.filter(
          (relativeCastlePlace: any) =>
            relativeCastlePlace.layer === castlePlace.layer &&
            (relativeCastlePlace.position.type === castlePlace.position.type ||
              castlePlace.position.type < PositionType.PRIMER) &&
            relativeTypes.includes(relativeCastlePlace.position.type),
        );

        if (relativeCastlePlaces.length > 0) {
          return [
            castlePlace,
            relativeCastlePlaces
              .map((relativeCastlePlace: any) => {
                const defaultRelative =
                  relativeRelatives[
                    relativeTypes.indexOf(relativeCastlePlace.position.type)
                  ];
                return [
                  defaultRelative
                    ? defaultRelative
                    : PositionRelativePlacement.CLOSE,
                  [relativeCastlePlace],
                ];
              })
              .slice(0, maxRelatives),
          ];
        }

        /* const relativeCloseCastlePlaces = castlePlaces.filter(
          (relativeCloseCastlePlace: any) =>
            relativeTypes.includes(relativeCloseCastlePlace.position.type),
        ).sort((a: any, b: any) => compareTowerPlaceCloseObjects(a, castlePlace));

        if (relativeCloseCastlePlaces.length > 0) {
          return [
            castlePlace,
            relativeCloseCastlePlaces
              .map((relativeCloseCastlePlace: any) => {
                const defaultRelative =
                  relativeRelatives[
                    relativeTypes.indexOf(relativeCloseCastlePlace.position.type)
                  ];
                return [
                  defaultRelative
                    ? defaultRelative
                    : PositionRelativePlacement.CLOSE,
                  [relativeCloseCastlePlace],
                ];
              })
              .slice(0, maxRelatives),
          ];
        } */

        return [castlePlace, []];
      })
      .filter(
        ([castlePlace, relativePositions]: any) =>
          relativePositions && relativePositions.length > 0,
      )
      .sort(compareTowerPlaceFamilyObjects);

  const [displayTronc, setDisplayTronc] = useState(false);
  const [displayHeights, setDisplayHeights] = useState(false);

  const actualDisplayTronc =
    displayTronc ||
    !castlePlacesPinya ||
    castlePlacesPinya.filter(
      (castlePlace: any) => castlePlace.position.type !== PositionType.BAIX,
    ).length === 0;

  const currentCastlePlaces = actualDisplayTronc
    ? castlePlacesTronc
    : castlePlacesPinya;

  const minX = Math.min(
    ...currentCastlePlaces.map((castlePlace: any) => castlePlace.placement.x),
    ...(castleTexts && actualDisplayTronc
      ? castleTexts.map((castleText: any) => castleText.placement.x)
      : []),
  );
  const minY = Math.min(
    ...currentCastlePlaces.map((castlePlace: any) => castlePlace.placement.y),
    ...(castleTexts && actualDisplayTronc
      ? castleTexts.map((castleText: any) => castleText.placement.y)
      : []),
  );
  const maxX = Math.max(
    ...currentCastlePlaces.map((castlePlace: any) => castlePlace.placement.x),
    ...(castleTexts && actualDisplayTronc
      ? castleTexts.map((castleText: any) => castleText.placement.x)
      : []),
  );
  const maxY = Math.max(
    ...currentCastlePlaces.map((castlePlace: any) => castlePlace.placement.y),
    ...(castleTexts && actualDisplayTronc
      ? castleTexts.map((castleText: any) => castleText.placement.y)
      : []),
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
  });

  return (
    <Box className={styles.containerCastle} ref={containerRef}>
      {castle &&
        castle.responsible &&
        (castle.responsible.user ||
          (castle.responsible.extra && castle.responsible.extra.text)) && (
          <Box className={styles.optionsCastleResponsible}>
            <Typography variant="body1">
              {t("pages.calendar.section.agenda.event.castles-responsible")}
              {": "}
              <strong>
                {castle.responsible.user &&
                castle.responsible.user.towers &&
                castle.responsible.user.towers.alias
                  ? castle.responsible.user.towers.alias.toUpperCase()
                  : castle.responsible.extra.text.toUpperCase()}
              </strong>
            </Typography>
          </Box>
        )}
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

            const colourBg =
              castlePlace.position.type in COLOR_BG_BY_POSITION_TYPE_AND_RING
                ? COLOR_BG_BY_POSITION_TYPE_AND_RING[castlePlace.position.type]
                    .filter(
                      ([minRing, colour]: any) => castlePlace.ring >= minRing,
                    )
                    .concat([
                      [
                        0,
                        COLOUR_BG_BY_POSITION_TYPE[castlePlace.position.type],
                      ],
                    ])[0][1]
                : COLOUR_BG_BY_POSITION_TYPE[castlePlace.position.type];
            const colourBorder =
              castlePlace.position.type in
              COLOR_BORDER_BY_POSITION_TYPE_AND_RING
                ? COLOR_BORDER_BY_POSITION_TYPE_AND_RING[
                    castlePlace.position.type
                  ]
                    .filter(
                      ([minRing, colour]: any) => castlePlace.ring >= minRing,
                    )
                    .concat([
                      [
                        0,
                        COLOUR_BORDER_BY_POSITION_TYPE[
                          castlePlace.position.type
                        ],
                      ],
                    ])[0][1]
                : COLOUR_BORDER_BY_POSITION_TYPE[castlePlace.position.type];

            const heightField =
              HEIGHT_FIELD_BY_POSITION_TYPE[castlePlace.position.type];

            return (
              <>
                <Label
                  x={labelX - minX + (actualDisplayTronc ? 35 : 75)}
                  y={labelY - minY + (actualDisplayTronc ? 10 : 15)}
                  width={labelWidth}
                  height={labelHeight}
                  rotation={castlePlace.placement.angle}
                >
                  <Rect
                    width={labelWidth}
                    height={labelHeight}
                    fill={isUserOrFamily ? "white" : colourBg}
                    stroke={
                      isUserOrFamily
                        ? castlePlace.position.type in
                          COLOUR_BORDER_BY_POSITION_TYPE
                          ? colourBorder
                          : colourBg
                        : "#1d1d1d"
                    }
                    strokeWidth={isUserOrFamily ? 3 : 1}
                    dash={isUserOrFamily && [5, 2]}
                    cornerRadius={8}
                  />
                  <Text
                    text={
                      displayHeights &&
                      castlePlace.user &&
                      castlePlace.user.towers &&
                      castlePlace.user.towers[heightField] &&
                      castlePlace.user.towers[heightField] > 1
                        ? (heightField.includes("arms") ? "↑ " : "") +
                          castlePlace.user.towers[heightField]
                        : castlePlace.user &&
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
                        ? "#1d1d1d"
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
          {actualDisplayTronc &&
            castleTexts &&
            castleTexts.map((castleText: any) => {
              return (
                <>
                  <Label
                    x={
                      castleText.placement.x -
                      minX +
                      (actualDisplayTronc ? 35 : 75)
                    }
                    y={
                      castleText.placement.y -
                      minY +
                      (actualDisplayTronc ? 10 : 15)
                    }
                    width={castleText.size.width}
                    height={castleText.size.height}
                    rotation={castleText.placement.angle}
                  >
                    <Text
                      text={castleText.text}
                      fontFamily="DM Sans"
                      fontSize={Math.round(
                        Math.sqrt(
                          Math.pow(castleText.size.width, 2) +
                            Math.pow(castleText.size.height, 2),
                        ) / 5.5,
                      )}
                      fontStyle={"bold"}
                      align="center"
                      padding={2}
                      verticalAlign="middle"
                      fill={"#1d1d1d"}
                      width={castleText.size.width}
                      height={castleText.size.height}
                    />
                  </Label>
                </>
              );
            })}
        </Layer>
      </Stage>

      {castlePlaces &&
        castlePlaces.length > 0 &&
        ((castlePlacesPinya &&
          castlePlacesPinya.filter(
            (castlePlace: any) =>
              castlePlace.position.type !== PositionType.BAIX,
          ).length > 0) ||
          (user && user.permission_level >= PermissionLevel.ADMIN)) && (
          <FormGroup className={styles.optionsCastleSwitches}>
            {castlePlacesPinya &&
              castlePlacesPinya.filter(
                (castlePlace: any) =>
                  castlePlace.position.type !== PositionType.BAIX,
              ).length > 0 && (
                <FormControlLabel
                  className={styles.optionsCastleSwitch}
                  control={
                    <Switch
                      onChange={(event) =>
                        setDisplayTronc(event.target.checked)
                      }
                    />
                  }
                  label={t(
                    "pages.calendar.section.agenda.event.castles-troncs",
                  )}
                />
              )}
            {user && user.permission_level >= PermissionLevel.ADMIN && (
              <FormControlLabel
                className={styles.optionsCastleSwitch}
                control={
                  <Switch
                    onChange={(event) =>
                      setDisplayHeights(event.target.checked)
                    }
                  />
                }
                label={t("pages.calendar.section.agenda.event.castles-heights")}
              />
            )}
          </FormGroup>
        )}
      {castlePlacesFamilyInstructions &&
        castlePlacesFamilyInstructions.length > 0 && (
          <Box className={styles.optionsCastlePositions}>
            <Divider />

            <TableContainer>
              <Table size="small">
                <TableBody>
                  {castlePlacesFamilyInstructions.map(
                    ([castlePlace, relativePositions]: any) => (
                      <TableRow
                        key={castlePlace.external_id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <Typography variant="body1">
                            <Chip
                              label={
                                castlePlace.user &&
                                castlePlace.user.towers &&
                                castlePlace.user.towers.alias
                                  ? castlePlace.user.towers.alias.toUpperCase()
                                  : castlePlace.extra.text.toUpperCase()
                              }
                              variant="outlined"
                              size="small"
                              sx={{
                                fontWeight: 700,
                                borderWidth: "3px",
                                borderRadius: "8px",
                                borderColor:
                                  castlePlace.position.type in
                                  COLOR_BORDER_BY_POSITION_TYPE_AND_RING
                                    ? COLOR_BORDER_BY_POSITION_TYPE_AND_RING[
                                        castlePlace.position.type
                                      ]
                                        .filter(
                                          ([minRing, colour]: any) =>
                                            castlePlace.ring >= minRing,
                                        )
                                        .concat([
                                          [
                                            0,
                                            COLOUR_BORDER_BY_POSITION_TYPE[
                                              castlePlace.position.type
                                            ],
                                          ],
                                        ])[0][1]
                                    : castlePlace.position.type in
                                        COLOUR_BORDER_BY_POSITION_TYPE
                                      ? COLOUR_BORDER_BY_POSITION_TYPE[
                                          castlePlace.position.type
                                        ]
                                      : COLOUR_BG_BY_POSITION_TYPE[
                                          castlePlace.position.type
                                        ],
                              }}
                            />
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1">
                            {relativePositions.map(
                              (
                                [relativePosition, castlePlaceRelatives]: any,
                                ix: number,
                              ) => {
                                const positionLabel = getEnumLabel(
                                  t,
                                  "towers-position-relative-placement",
                                  relativePosition,
                                );
                                const positionLabelText =
                                  ix > 0
                                    ? positionLabel.toLowerCase()
                                    : positionLabel;
                                return (
                                  <Typography component="span">
                                    {ix > 0 &&
                                      (ix >= relativePositions.length - 1
                                        ? " " + t("general.words.and") + " "
                                        : ", ")}
                                    {positionLabelText}{" "}
                                    {castlePlaceRelatives.map(
                                      (
                                        castlePlaceRelative: any,
                                        jx: number,
                                      ) => {
                                        return (
                                          <>
                                            {jx > 0 &&
                                              (jx >=
                                              castlePlaceRelatives.length - 1
                                                ? " " +
                                                  t("general.words.and") +
                                                  " "
                                                : ", ")}
                                            <Chip
                                              label={
                                                castlePlaceRelative.user &&
                                                castlePlaceRelative.user
                                                  .towers &&
                                                castlePlaceRelative.user.towers
                                                  .alias
                                                  ? castlePlaceRelative.user.towers.alias.toUpperCase()
                                                  : castlePlaceRelative.extra.text.toUpperCase()
                                              }
                                              variant="filled"
                                              size="small"
                                              sx={{
                                                backgroundColor:
                                                  castlePlaceRelative.position
                                                    .type in
                                                  COLOR_BG_BY_POSITION_TYPE_AND_RING
                                                    ? COLOR_BG_BY_POSITION_TYPE_AND_RING[
                                                        castlePlaceRelative
                                                          .position.type
                                                      ]
                                                        .filter(
                                                          ([
                                                            minRing,
                                                            colour,
                                                          ]: any) =>
                                                            castlePlaceRelative.ring >=
                                                            minRing,
                                                        )
                                                        .concat([
                                                          [
                                                            0,
                                                            COLOUR_BG_BY_POSITION_TYPE[
                                                              castlePlaceRelative
                                                                .position.type
                                                            ],
                                                          ],
                                                        ])[0][1]
                                                    : COLOUR_BG_BY_POSITION_TYPE[
                                                        castlePlaceRelative
                                                          .position.type
                                                      ],
                                                color:
                                                  COLOUR_TEXT_BY_POSITION_TYPE[
                                                    castlePlaceRelative.position
                                                      .type
                                                  ],
                                                borderRadius: "8px",
                                              }}
                                            />
                                          </>
                                        );
                                      },
                                    )}
                                  </Typography>
                                );
                              },
                            )}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
    </Box>
  );
}
