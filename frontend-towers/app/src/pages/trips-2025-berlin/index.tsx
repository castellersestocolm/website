import * as React from "react";
import { useTranslation } from "react-i18next";
import ImageHeroTrips2025Berlin from "../../assets/images/heros/trips-2025-berlin.jpg";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import { Container, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import styles from "./styles.module.css";

const DONATIONS = [
  [
    "gold",
    [
      "Artur Pérez",
      "Albert Borrell",
      "Yu-Wei Chang",
      "Josep Puigdemont Casamajó",
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

function Trips2025BerlinPage() {
  const { t } = useTranslation("common");

  const content = (
    <>
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
