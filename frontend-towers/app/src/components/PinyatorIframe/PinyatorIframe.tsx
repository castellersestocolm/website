import styles from "./styles.module.css";
import * as React from "react";
import Box from "@mui/material/Box";

export default function PinyatorIframe({ castle }: any) {
  const PINYATOR_BASE_URL = new URL(process.env.REACT_APP_PINYATOR_BASE_URL);

  const refIframe = React.useRef(null);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    function handleResize() {
      if (refIframe.current) {
        console.log("resized to: ", window.innerWidth, "x", window.innerHeight);
        console.log(refIframe);

        const width = refIframe.current.getBoundingClientRect().width;
        setHeight(width / 1.8);
      }
    }

    window.addEventListener("resize", handleResize);
    handleResize();
  });

  return (
    <Box className={styles.containerCastle}>
      <iframe
        ref={refIframe}
        src={PINYATOR_BASE_URL + "/Castell_Imatge.php?id=" + castle.external_id}
        title={"Pinya " + castle.name}
        className={styles.iframeCastle}
        style={{ height: height }}
        scrolling="no"
      />
    </Box>
  );
}
