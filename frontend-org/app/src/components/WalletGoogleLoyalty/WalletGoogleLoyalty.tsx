import * as React from "react";
import styles from "./styles.module.css";
import { useAppContext } from "../AppContext/AppContext";
import { apiIntegrationGoogleWalletPassLoyaltyGet } from "../../api";
import { Box, Link } from "@mui/material";
import { useTranslation } from "react-i18next";
import { LANGUAGE_TO_GOOGLE_LOCALE_COUNTRY } from "../../consts";

export default function WalletGoogleLoyalty() {
  const { i18n } = useTranslation("common");

  const { user } = useAppContext();

  const [googleWalletPassLoyalty, setGoogleWalletPassLoyalty] =
    React.useState(undefined);

  React.useEffect(() => {
    if (user) {
      apiIntegrationGoogleWalletPassLoyaltyGet().then((response) => {
        if (response.status === 200) {
          setGoogleWalletPassLoyalty(response.data);
        }
      });
    }
  }, [user, setGoogleWalletPassLoyalty]);

  const googleLocaleCountry = (LANGUAGE_TO_GOOGLE_LOCALE_COUNTRY as any)[
    i18n.resolvedLanguage
  ];
  const backgroundImage = require(
    `../../assets/images/integration/google/wallet/png/${googleLocaleCountry}_add_to_google_wallet_add-wallet-badge.png`,
  );

  return (
    <>
      {googleWalletPassLoyalty && googleWalletPassLoyalty.url && (
        <Box className={styles.walletBox}>
          <Link href={googleWalletPassLoyalty.url}>
            <img src={backgroundImage} alt="Google Wallet" />
          </Link>
        </Box>
      )}
    </>
  );
}
