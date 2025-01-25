import * as React from "react";
import Box from "@mui/material/Box";
import { Container, Divider, Link, MenuItem, Typography } from "@mui/material";
import styles from "./styles.module.css";
import IconLogoLong from "../../components/IconLogoLong/IconLogoLong.jsx";
import { useTranslation } from "react-i18next";
import IconFacebook from "@mui/icons-material/Facebook";
import IconInstagram from "@mui/icons-material/Instagram";
import IconWhatsApp from "@mui/icons-material/WhatsApp";
import IconButton from "@mui/material/IconButton";

export default function Footer() {
  const { t } = useTranslation("common");

  const pages = [t("components.navbar-menu.home")];

  return (
    <Box component="section" className={styles.footerBar}>
      <Container maxWidth="lg" className={styles.footerContainer}>
        <Box className={styles.footerContainerBox1}>
          <Box className={styles.footerIcon}>
            <IconLogoLong />
          </Box>
          <Box className={styles.footerMenu}>
            {pages.map((page) => (
              <MenuItem
                key={page}
                disableTouchRipple
                className={styles.footerMenuItem}
              >
                <Typography fontWeight={600}>{page}</Typography>
              </MenuItem>
            ))}
          </Box>
        </Box>
        <Divider />
        <Box className={styles.footerContainerBox2}>
          <Box className={styles.footerSupport}>
            <Typography className={styles.footerTextSuport}>
              {t("components.footer.support")}
            </Typography>
          </Box>
          <Box className={styles.footerSocial}>
            <Typography className={styles.footerTextEmail}>
              <Link href="mailto:info@castellersestocolm.se" underline="none">
                info@castellersestocolm.se
              </Link>
            </Typography>
            <IconButton
              href="https://www.facebook.com/castellersestocolm"
              target="_blank"
              rel="nofollow"
              aria-label="facebook"
            >
              <IconFacebook />
            </IconButton>
            <IconButton
              href="https://www.instagram.com/castellersestocolm"
              target="_blank"
              rel="nofollow"
              aria-label="instagram"
            >
              <IconInstagram />
            </IconButton>
            <IconButton
              href="https://chat.whatsapp.com/KOvo9eolMXcA6vwwEVip1p"
              target="_blank"
              rel="nofollow"
              aria-label="whatsapp"
            >
              <IconWhatsApp />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
