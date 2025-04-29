import styles from "./styles.module.css";
import * as React from "react";
import { useTranslation } from "react-i18next";
import ImageHeroSaleTshirt from "../../assets/images/heros/sale-tshirt.jpg";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import Box from "@mui/material/Box";

function SaleTshirtsPage() {
  const { t } = useTranslation("common");

  const content = (
    <Box
      className={styles.saleBandanaPayPal}
      id="paypal-container-5TV4WG9TRQBL2"
    ></Box>
  );

  return (
    <PageImageHero
      title={t("pages.sale-tshirts.title")}
      content={content}
      hero={ImageHeroSaleTshirt}
    />
  );
}

export default SaleTshirtsPage;
