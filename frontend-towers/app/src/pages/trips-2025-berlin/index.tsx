import * as React from "react";
import { useTranslation } from "react-i18next";
import ImageHeroTrips2025Berlin from "../../assets/images/heros/trips-2025-berlin.jpg";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import { Container, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import styles from "./styles.module.css";
import ImageGallery from "../../components/ImageGallery/ImageGallery";
import ImageBer1 from "../../assets/images/trips/2025/berlin/ber1.jpg";
import ImageBer2 from "../../assets/images/trips/2025/berlin/ber2.jpg";
import ImageBer3 from "../../assets/images/trips/2025/berlin/ber3.jpg";
import ImageBer4 from "../../assets/images/trips/2025/berlin/ber4.jpg";
import ImageBer5 from "../../assets/images/trips/2025/berlin/ber5.jpg";
import ImageBer6 from "../../assets/images/trips/2025/berlin/ber6.jpg";
import ImageBer7 from "../../assets/images/trips/2025/berlin/ber7.jpg";
import ImageBer8 from "../../assets/images/trips/2025/berlin/ber8.jpg";
import ImageBer9 from "../../assets/images/trips/2025/berlin/ber9.jpg";
import ImageBer10 from "../../assets/images/trips/2025/berlin/ber10.jpg";
import ImageBer11 from "../../assets/images/trips/2025/berlin/ber11.jpg";
import ImageBer12 from "../../assets/images/trips/2025/berlin/ber12.jpg";
import ImageBer13 from "../../assets/images/trips/2025/berlin/ber13.jpg";
import ImageBer14 from "../../assets/images/trips/2025/berlin/ber14.jpg";
import ImageBer15 from "../../assets/images/trips/2025/berlin/ber15.jpg";
import ImageBer16 from "../../assets/images/trips/2025/berlin/ber16.jpg";

const DONATIONS = [
  [
    "gold",
    [
      "Artur Pérez",
      "Albert Borrell",
      "Yu-Wei Chang",
      "Josep Puigdemont Casamajó",
      "Miquel Espinosa Pujolràs",
      "Neus Escobar Urdiales",
    ],
  ],
  [
    "silver",
    [
      "Dan Nosell",
      "Heléne Olsson",
      "Judit Pérez-Coll Jiménez",
      "Jaume Canal Bosch",
      "Rosa Garcia Ribé",
      "Robin Fransson",
      "Anna Canal",
      "Maria Carme Giró Gramona",
      "Josep Maria Borrell Borràs",
      "Katarina Sundström",
    ],
  ],
  [
    "bronze",
    ["Helena Mir Hugas", "Pau Guinart", "Oriol Closa", "Anya Kurylovich"],
  ],
];

const IMAGES = [
  ImageBer1,
  ImageBer2,
  ImageBer3,
  ImageBer4,
  ImageBer5,
  ImageBer6,
  ImageBer7,
  ImageBer8,
  ImageBer9,
  ImageBer10,
  ImageBer11,
  ImageBer12,
  ImageBer13,
  ImageBer14,
  ImageBer15,
  ImageBer16,
];

function Trips2025BerlinPage() {
  const { t } = useTranslation("common");

  const content = (
    <>
      <Box id="donations" marginBottom="64px">
        <Typography
          variant="h4"
          fontWeight="700"
          align="center"
          marginBottom="24px"
        >
          {t("pages.trips-2025-berlin.patrons.title")}
        </Typography>
        {DONATIONS.map((data: any) => {
          return (
            <Container maxWidth="md">
              <Typography
                variant="h6"
                fontWeight="700"
                align="center"
                marginBottom="12px"
              >
                {t("pages.trips-2025-berlin.patrons." + data[0] + ".title")}
              </Typography>
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="center"
                className={styles.memberTeam}
              >
                {data[1].map((member: any, i: number, row: any) => {
                  return (
                    <>
                      <Typography variant="body1" className={styles.memberName}>
                        {member}
                      </Typography>
                    </>
                  );
                })}
              </Box>
            </Container>
          );
        })}
      </Box>
      <Box id="trip">
        <Typography
          variant="h4"
          fontWeight="700"
          align="center"
          marginBottom="32px"
        >
          {t("pages.trips-2025-berlin.gallery.title")}
        </Typography>
        <ImageGallery images={IMAGES} />
      </Box>
    </>
  );

  return (
    <PageImageHero
      title={t("pages.trips-2025-berlin.title")}
      content={content}
      hero={ImageHeroTrips2025Berlin}
    />
  );
}

export default Trips2025BerlinPage;
