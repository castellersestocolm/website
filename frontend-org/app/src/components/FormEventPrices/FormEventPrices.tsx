import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import {
  Card,
  Divider,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import styles from "./styles.module.css";
import Box from "@mui/material/Box";
import { getEnumLabel } from "../../enums";
import { eventPriceToTitle } from "../../utils/event";

export default function FormEventPrices({ event }: any) {
  const { t } = useTranslation("common");

  const eventPriceModules =
    event &&
    event.prices &&
    Array.from(
      new Set(event.prices.map((eventPrice: any) => eventPrice.module)),
    );

  return (
    <>
      {event.prices && event.prices.length > 0 && (
        <Grid container gap={3} justifyContent="center">
          {eventPriceModules.map((module: any) => {
            return (
              <Grid size={{ xs: 12, sm: 5, md: 4, lg: 3 }}>
                <Card variant="outlined" className={styles.pricesCard}>
                  <Box className={styles.pricesTopBox}>
                    <Typography variant="h6" fontWeight="600" component="div">
                      {module
                        ? getEnumLabel(t, "module", module)
                        : eventPriceModules.length === 0
                          ? t("pages.calendar-event.register.prices.all")
                          : t(
                              "pages.calendar-event.register.prices.non-members",
                            )}
                    </Typography>
                  </Box>
                  <Divider />

                  <Box>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          {event.prices
                            .filter(
                              (eventPrice: any) => eventPrice.module === module,
                            )
                            .map((eventPrice: any) => {
                              return (
                                <TableRow
                                  sx={{
                                    "&:last-child td, &:last-child th": {
                                      border: 0,
                                    },
                                  }}
                                >
                                  <TableCell component="th" scope="row">
                                    {eventPriceToTitle(t, eventPrice)}
                                  </TableCell>
                                  <TableCell align="right">
                                    {eventPrice.amount.amount}{" "}
                                    {eventPrice.amount.currency}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </>
  );
}
