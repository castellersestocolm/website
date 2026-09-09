import * as React from "react";
import styles from "./styles.module.css";
import { useAppContext } from "../AppContext/AppContext";
import { apiIntegrationGoogleWalletPassEventGet } from "../../api";
import { Box, Link } from "@mui/material";
import { useTranslation } from "react-i18next";
import { LANGUAGE_TO_GOOGLE_LOCALE_COUNTRY } from "../../consts";

export default function WalletGoogleEvent({ registrationId }: any) {
  const { i18n } = useTranslation("common");

  const { user } = useAppContext();

  const [googleWalletPassEvent, setGoogleWalletPassEvent] =
    React.useState(undefined);

  React.useEffect(() => {
    if (user) {
      apiIntegrationGoogleWalletPassEventGet(registrationId).then(
        (response) => {
          if (response.status === 200) {
            setGoogleWalletPassEvent(response.data);
          }
        },
      );
    }
  }, [user, registrationId, setGoogleWalletPassEvent]);

  const googleLocaleCountry = (LANGUAGE_TO_GOOGLE_LOCALE_COUNTRY as any)[
    i18n.resolvedLanguage
  ];
  const backgroundImage = require(
    `../../assets/images/integration/google/wallet/png/${googleLocaleCountry}_add_to_google_wallet_wallet-button.png`,
  );

  return (
    <>
      {googleWalletPassEvent && googleWalletPassEvent.url && (
        <Box className={styles.walletBox}>
          <Link href={googleWalletPassEvent.url}>
            <img src={backgroundImage} alt="Google Wallet" />
          </Link>
        </Box>
      )}
    </>
  );
}
