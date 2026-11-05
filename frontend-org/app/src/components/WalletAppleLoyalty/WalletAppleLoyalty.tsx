import * as React from "react";
import styles from "./styles.module.css";
import { useAppContext } from "../AppContext/AppContext";
import { apiIntegrationAppleWalletPassLoyaltyGet } from "../../api";
import { Box, Link } from "@mui/material";
import { useTranslation } from "react-i18next";
import { LANGUAGE_TO_APPLE_WALLET_FILE } from "../../consts";

export default function WalletAppleLoyalty() {
  const { i18n } = useTranslation("common");

  const { user } = useAppContext();

  const appleFile = (LANGUAGE_TO_APPLE_WALLET_FILE as any)[
    i18n.resolvedLanguage
  ];
  const backgroundImage = require(
    `../../assets/images/integration/apple/wallet/${appleFile[0]}/RGB/${appleFile[1]}.svg`,
  );

  function handleApplePassLoyaltyButton() {
    if (user) {
      apiIntegrationAppleWalletPassLoyaltyGet().then((response) => {
        if (response.status === 200) {
          const href = URL.createObjectURL(response.data);
          const link = document.createElement("a");
          link.href = href;
          link.setAttribute("download", "loyalty.pkpass");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(href);
        }
      });
    }
  }

  return (
    <>
      {user && (
        <Box className={styles.walletBox}>
          <Link onClick={handleApplePassLoyaltyButton} variant="button">
            <img src={backgroundImage} alt="Apple Wallet" />
          </Link>
        </Box>
      )}
    </>
  );
}
