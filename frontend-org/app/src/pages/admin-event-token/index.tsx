import * as React from "react";
import { apiAdminEventTokenGet } from "../../api";
import { useParams } from "react-router-dom";
import PageAdmin from "../../components/PageAdmin/PageAdmin";
import QRCode from "qrcode";
import { ROUTES } from "../../routes";
import Box from "@mui/material/Box";
import styles from "./styles.module.css";

const ORG_BASE_URL = new URL(process.env.REACT_APP_ORG_BASE_URL).origin;

function AdminEventTokenPage() {
  const { id } = useParams();

  const [token, setToken] = React.useState(undefined);
  const [eventTokenQRSvg, setEventTokenQRSvg] = React.useState(undefined);

  React.useEffect(() => {
    if (id) {
      apiAdminEventTokenGet(id, true).then((response) => {
        if (response.status === 200) {
          setToken(response.data);
        }
      });
    }
  }, [id, setToken]);

  React.useEffect(() => {
    if (token && token.token) {
      QRCode.toDataURL(
        ORG_BASE_URL +
          ROUTES["calendar-event-signup"].path.replace(":token", token.token),
        {
          width: 1000,
          margin: 0,
        },
      )
        .then((url: string) => {
          setEventTokenQRSvg(url);
        })
        .catch((err: any) => {});
    }
  }, [token, setEventTokenQRSvg]);

  const content = (
    <Box className={styles.qrBox}>
      {eventTokenQRSvg && <img src={eventTokenQRSvg} alt="Event sign-up QR" />}
    </Box>
  );

  return (
    <PageAdmin content={content} loading={!eventTokenQRSvg} screenFull={true} />
  );
}

export default AdminEventTokenPage;
