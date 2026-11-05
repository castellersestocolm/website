import * as React from "react";
import styles from "./styles.module.css";
import { useAppContext } from "../AppContext/AppContext";
import { apiIntegrationGoogleWalletPassEventGet } from "../../api";
import { Box, Link } from "@mui/material";
import { useTranslation } from "react-i18next";
import { LANGUAGE_TO_GOOGLE_LOCALE_COUNTRY } from "../../consts";
import { useNavigate } from "react-router-dom";

export default function WalletGoogleEvent({ registrationId }: any) {
  const { i18n } = useTranslation("common");

  const { user } = useAppContext();

  let navigate = useNavigate();

  const googleLocaleCountry = (LANGUAGE_TO_GOOGLE_LOCALE_COUNTRY as any)[
    i18n.resolvedLanguage
  ];
  const backgroundImage = require(
    `../../assets/images/integration/google/wallet/png/${googleLocaleCountry}_add_to_google_wallet_wallet-button.png`,
  );

  function handleGooglePassEventButton() {
    if (user) {
      apiIntegrationGoogleWalletPassEventGet(registrationId).then(
        (response) => {
          if (response.status === 200) {
            navigate(response.data);
          }
        },
      );
    }
  }

  return (
    <>
      {user && (
        <Box className={styles.walletBox}>
          <Link onClick={handleGooglePassEventButton} variant="button">
            <img src={backgroundImage} alt="Google Wallet" />
          </Link>
        </Box>
      )}
    </>
  );
}
