import * as React from "react";
import styles from "./styles.module.css";
import { useAppContext } from "../AppContext/AppContext";
import { apiIntegrationGoogleWalletPassLoyaltyGet } from "../../api";
import GoogleWalletImage from "../../assets/images/google/wallet/wallet.png";
import { Box, Link } from "@mui/material";

export default function WalletGoogle() {
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

  return (
    <>
      {googleWalletPassLoyalty && googleWalletPassLoyalty.url && (
        <Box className={styles.walletBox}>
          <Link href={googleWalletPassLoyalty.url}>
            <img src={GoogleWalletImage} />
          </Link>
        </Box>
      )}
    </>
  );
}
