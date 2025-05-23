import styles from "./styles.module.css";
import Box from "@mui/material/Box";
import * as React from "react";
import ImageCarousel1 from "../../assets/images/carousel/car1.jpg";
import ImageCarousel2 from "../../assets/images/carousel/car2.jpg";
import ImageCarousel4 from "../../assets/images/carousel/car4.jpg";
import ImageCarousel5 from "../../assets/images/carousel/car5.jpg";
import ImageCarousel6 from "../../assets/images/carousel/car6.jpg";
import ImageCarousel7 from "../../assets/images/carousel/car7.jpg";
import ImageCarousel8 from "../../assets/images/carousel/car8.jpeg";
import ImageCarousel9 from "../../assets/images/carousel/car9.jpg";
import ImageCarousel10 from "../../assets/images/carousel/car10.jpeg";
import ImageCarousel11 from "../../assets/images/carousel/car11.jpg";
import ImageCarousel13 from "../../assets/images/carousel/car13.jpg";
import ImageCarousel14 from "../../assets/images/carousel/car14.jpg";
import ImageCarousel15 from "../../assets/images/carousel/car15.jpg";
import ImageCarousel17 from "../../assets/images/carousel/car17.jpg";
import ImageCarousel18 from "../../assets/images/carousel/car18.jpeg";
import ImageCarousel22 from "../../assets/images/carousel/car22.jpeg";
import ImageCarousel23 from "../../assets/images/carousel/car23.jpg";
import ImageCarousel24 from "../../assets/images/carousel/car24.jpg";
import ImageCarousel25 from "../../assets/images/carousel/car25.jpg";
import ImageCarousel26 from "../../assets/images/carousel/car26.jpg";
import ImageCarousel27 from "../../assets/images/carousel/car27.jpg";
import ImageCarousel29 from "../../assets/images/carousel/car29.jpg";
import ImageCarousel30 from "../../assets/images/carousel/car30.jpg";
import ImageCarousel32 from "../../assets/images/carousel/car32.jpg";
import ImageCarousel34 from "../../assets/images/carousel/car34.jpeg";
import ImageCarousel35 from "../../assets/images/carousel/car35.jpeg";
import ImageCarousel36 from "../../assets/images/carousel/car36.jpeg";

export default function ImageCarousel({ images, dense }: any) {
  const carouselImages = (
    images || [
      ImageCarousel1,
      ImageCarousel2,
      ImageCarousel4,
      ImageCarousel5,
      ImageCarousel6,
      ImageCarousel7,
      ImageCarousel8,
      ImageCarousel9,
      ImageCarousel10,
      ImageCarousel11,
      ImageCarousel13,
      ImageCarousel14,
      ImageCarousel15,
      ImageCarousel17,
      ImageCarousel18,
      ImageCarousel22,
      ImageCarousel23,
      ImageCarousel24,
      ImageCarousel25,
      ImageCarousel26,
      ImageCarousel27,
      ImageCarousel29,
      ImageCarousel30,
      ImageCarousel32,
      ImageCarousel34,
      ImageCarousel35,
      ImageCarousel36,
    ]
  )
    .map((value: any) => ({ value, sort: Math.random() }))
    .sort((a: any, b: any) => a.sort - b.sort)
    .map(({ value }: any) => value);

  return (
    <Box className={styles.inner}>
      <Box className={styles.wrapper}>
        <Box
          className={styles.section}
          style={
            {
              "--speed": carouselImages.length * 50000 + `ms`,
            } as React.CSSProperties
          }
        >
          {carouselImages.map((image: string, ix: number) => (
            <Box key={ix} className={dense ? styles.imageDense : styles.image}>
              <img
                src={image}
                style={{ height: "100%", borderRadius: "8px" }}
              />
            </Box>
          ))}
        </Box>
        <Box
          className={styles.section}
          style={
            {
              "--speed": carouselImages.length * 50000 + `ms`,
            } as React.CSSProperties
          }
        >
          {carouselImages.map((image: string, ix: number) => (
            <Box key={ix} className={dense ? styles.imageDense : styles.image}>
              <img
                src={image}
                style={{ height: "100%", borderRadius: "8px" }}
              />
            </Box>
          ))}
        </Box>
        <Box
          className={styles.section}
          style={
            {
              "--speed": carouselImages.length * 50000 + `ms`,
            } as React.CSSProperties
          }
        >
          {carouselImages.map((image: string, ix: number) => (
            <Box key={ix} className={dense ? styles.imageDense : styles.image}>
              <img
                src={image}
                style={{ height: "100%", borderRadius: "8px" }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
