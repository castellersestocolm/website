import Box from "@mui/material/Box";
import ImageHero from "../../assets/images/hero.jpg";
import styles from './styles.module.css';
import {Container, Typography} from "@mui/material";
import * as React from "react";
import {useTranslation} from "react-i18next";
import IconLogoColour from '../../components/IconLogoColour/IconLogoColour.jsx';
import Grid from '@mui/material/Grid2';

function HomePage() {
    const {t} = useTranslation("common");

  return (
    <>
        <Box component="section" className={styles.hero}>
            <Container maxWidth="lg">
                <Grid container spacing={2} className={styles.heroGridLeft}>
                  <Grid size={6}>
                    <IconLogoColour />
                    <Typography variant="h3" fontWeight="700" className={styles.heroTitle}>{t('pages.home-hero.title')}</Typography>
                    <Typography variant="h5" fontWeight="700" className={styles.heroSubtitle}>{t('pages.home-hero.subtitle')}</Typography>
                    <Typography variant="h6" className={styles.heroSubtitle}>{t('pages.home-hero.subtitle2')}</Typography>
                  </Grid>
                  <Grid size={6}>
                      <Box className={styles.heroImage} style={{backgroundImage: 'url(' + ImageHero + ')'}} />
                  </Grid>
                </Grid>
            </Container>
        </Box>
    </>
  );
}

export default HomePage;
