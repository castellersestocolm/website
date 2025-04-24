import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import ImageHeroSaleBandana from "../../assets/images/heros/sale-bandana.jpg";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import Box from "@mui/material/Box";

function SaleBandanaPage() {
  const { t } = useTranslation("common");

  const content = (
    <Box
      className={styles.saleBandanaPayPal}
      id="paypal-container-SD22GGHQ5BAEC"
    ></Box>
  );

  return (
    <PageImageHero
      title={t("pages.sale-bandana.title")}
      content={content}
      hero={ImageHeroSaleBandana}
    />
  );
}

export default SaleBandanaPage;
