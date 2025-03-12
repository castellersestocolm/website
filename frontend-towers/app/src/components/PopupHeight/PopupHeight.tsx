import * as React from "react";
import { Unstable_Popup as BasePopup } from "@mui/base/Unstable_Popup";
import { styled } from "@mui/system";
import styles from "./styles.module.css";
import IconInfoOutlined from "@mui/icons-material/InfoOutlined";
import IconButton from "@mui/material/IconButton";
import IconHeightShoulders from "../IconHeightShoulders/IconHeightShoulders.jsx";
import IconHeightArms from "../IconHeightArms/IconHeightArms.jsx";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";

interface PopupHeightProps {
  type: "shoulders" | "arms";
}

export default function PopupHeight({ type }: PopupHeightProps) {
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(anchor ? null : event.currentTarget);
  };

  const open = Boolean(anchor);
  const id = open ? "simple-popper" : undefined;

  return (
    <>
      <IconButton
        color="secondary"
        disableRipple
        className={styles.infoIcon}
        type="button"
        onClick={handleClick}
      >
        <IconInfoOutlined />
      </IconButton>
      <BasePopup id={id} open={open} anchor={anchor}>
        <PopupBody>
          {type === "arms" ? (
            <Grid direction="row" display="flex">
              <Box className={styles.heightIcon}>
                <IconHeightArms />
              </Box>
            </Grid>
          ) : (
            <Grid direction="row" display="flex">
              <Box className={styles.heightIcon}>
                <IconHeightShoulders />
              </Box>
            </Grid>
          )}
        </PopupBody>
      </BasePopup>
    </>
  );
}

const grey = {
  200: "#DAE2ED",
  700: "#434D5B",
  900: "#1C2025",
};

const PopupBody = styled("div")(
  ({ theme }) => `
  width: max-content;
  padding: 12px 16px;
  margin: 8px;
  border-radius: 8px;
  border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
  background-color: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
  box-shadow: ${
    theme.palette.mode === "dark"
      ? `0px 4px 8px rgb(0 0 0 / 0.7)`
      : `0px 4px 8px rgb(0 0 0 / 0.1)`
  };
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  z-index: 1;
`,
);
