import * as React from "react";
import {
  ImageList,
  ImageListItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";

export default function ImageGallery({ images }: any) {
  const theme = useTheme();
  const galleryMatchesMd = useMediaQuery(theme.breakpoints.up("md"));
  const galleryMatchesSm = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <ImageList
      variant="quilted"
      cols={galleryMatchesMd ? 4 : galleryMatchesSm ? 2 : 1}
      rowHeight={300}
      gap={8}
    >
      {images.map((image: any, ix: number) => (
        <ImageListItem key={ix}>
          <img
            srcSet={`${image}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
            src={`${image}?w=164&h=164&fit=crop&auto=format`}
            loading="lazy"
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
}
