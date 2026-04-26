import {
  Typography,
  Grid,
  Card,
  Box,
  Divider,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import PageImageHero from "../../components/PageImageHero/PageImageHero";
import ImageHeroKids from "../../assets/images/heros/kids.jpg";
import styles from "./styles.module.css";
import { getEnumLabel, Module } from "../../enums";

function ActivityKidsPage() {
  const { t } = useTranslation("common");

  const content = (
    <>
      <Typography variant="body1" mb={1}>
        {t("pages.activity-kids.content.section-1.text-1")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.activity-kids.content.section-1.text-2")}
      </Typography>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.activity-kids.content.section-2.title")}
      </Typography>
      <ul>
        <li>
          <Typography variant="body1" mb={1}>
            {t("pages.activity-kids.content.section-2.point-1")}
          </Typography>
        </li>
        <li>
          <Typography variant="body1" mb={1}>
            {t("pages.activity-kids.content.section-2.point-2")}
          </Typography>
        </li>
        <li>
          <Typography variant="body1" mb={1}>
            {t("pages.activity-kids.content.section-2.point-3")}
          </Typography>
        </li>
      </ul>
      <Grid container gap={3} mt={3} mb={3} justifyContent="center">
        <Grid size={{ xs: 12, sm: 10, md: 7, lg: 5, xl: 4 }}>
          <Card variant="outlined" className={styles.pricesCard}>
            <Box className={styles.pricesTopBox}>
              <Typography variant="h6" fontWeight="600" component="div">
                {t("pages.activity-kids.prices.title")}
              </Typography>
            </Box>
            <Divider />

            <Box>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: 0,
                        },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {getEnumLabel(t, "module", Module.ORG)}
                        {" ("}
                        {t("pages.activity-kids.prices.family")}
                        {")"}
                      </TableCell>
                      <TableCell align="right">{"250 SEK"}</TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: 0,
                        },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {t("pages.activity-kids.prices.kid-1")}
                      </TableCell>
                      <TableCell align="right">{"200 SEK"}</TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: 0,
                        },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {t("pages.activity-kids.prices.kid-2")}
                      </TableCell>
                      <TableCell align="right">{"100 SEK"}</TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: 0,
                        },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {t("pages.activity-kids.prices.kid-3")}
                      </TableCell>
                      <TableCell align="right">{"0 SEK"}</TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: 0,
                        },
                      }}
                      className={styles.pricesTableRowTotal}
                    >
                      <TableCell component="th" scope="row">
                        {t("pages.activity-kids.prices.summary-total")}
                      </TableCell>
                      <TableCell align="right">
                        {"450 SEK"}
                        {"/"}
                        {t("pages.activity-kids.prices.summary-year")}
                      </TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: 0,
                        },
                      }}
                      className={styles.pricesTableRowTotal}
                    >
                      <TableCell component="th" scope="row">
                        {t("pages.activity-kids.prices.summary-total-2")}
                      </TableCell>
                      <TableCell align="right">
                        {"550 SEK"}
                        {"/"}
                        {t("pages.activity-kids.prices.summary-year")}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>
      <Typography variant="h5" fontWeight={700} mb={1} mt={2}>
        {t("pages.activity-kids.content.section-3.title")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.activity-kids.content.section-3.text-1")}
      </Typography>
    </>
  );

  return (
    <PageImageHero
      title={t("pages.activity-kids.title")}
      content={content}
      hero={ImageHeroKids}
    />
  );
}

export default ActivityKidsPage;
