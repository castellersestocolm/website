import styles from "./styles.module.css";
import {
  Card,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import * as React from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import PageBase from "../../components/PageBase/PageBase";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";

function ResourcesTransparencyPage() {
  const { t } = useTranslation("common");

  const [financesPage, setFinancesPage] = React.useState(1);

  function handleChangeFinancesPage(value: number) {
    setFinancesPage(value);
  }

  const financesByYear: any = [
    [
      "2025",
      {
        income: {
          lines: [
            [
              "income-1",
              undefined,
              [
                ["income-1-1", "22 650,00 SEK"],
                ["income-1-2", "13 600,00 SEK"],
                ["income-1-3", "1 400,00 SEK"],
              ],
            ],
            ["income-2", "51 662,75 SEK", []],
            ["income-3", "15 000,00 SEK", []],
            ["income-4", "28 213,91 SEK", []],
            ["income-5", undefined, [["income-5-2", "16 584,18 SEK"]]],
            ["income-6", "4 992,20 SEK", []],
            ["income-7", "0,00 SEK", []],
          ],
          total: "153 903,04 SEK",
        },
        expenses: {
          lines: [
            ["expenses-1", "363,75 SEK", []],
            ["expenses-2", "48 701,12 SEK", []],
            [
              "expenses-3",
              undefined,
              [
                ["expenses-3-1", "2 175,80 SEK"],
                ["expenses-3-2", "20 718,00 SEK"],
              ],
            ],
            ["expenses-4", "44 918,59 SEK", []],
            ["expenses-5", "8 552,19 SEK", []],
            ["expenses-6", "18 088,00 SEK", []],
            ["expenses-7", "1 570,00 SEK", []],
            ["expenses-10", "2 837,13 SEK", []],
          ],
          total: "147 924,58 SEK",
        },
      },
    ],
    [
      "2024",
      {
        income: {
          lines: [
            [
              "income-1",
              undefined,
              [
                ["income-1-1", "10 600,00 SEK"],
                ["income-1-2", "17 000,00 SEK"],
              ],
            ],
            ["income-2", "14 130,00 SEK", []],
            ["income-4", "25 778,80 SEK", []],
            ["income-5", undefined, [["income-5-2", "22 290,00 SEK"]]],
            ["income-6", "60,00 SEK", []],
            ["income-7", "1 252,19 SEK", []],
          ],
          total: "91 110,99 SEK",
        },
        expenses: {
          lines: [
            ["expenses-1", "1 236,25 SEK", []],
            ["expenses-2", "15 060,53 SEK", []],
            [
              "expenses-3",
              undefined,
              [
                ["expenses-3-1", "2 281,00 SEK"],
                ["expenses-3-2", "20 647,00 SEK"],
              ],
            ],
            ["expenses-4", "32 733,88 SEK", []],
            ["expenses-6", "6 275,00 SEK", []],
            ["expenses-7", "1 570,00 SEK", []],
            ["expenses-8", "274,20 SEK", []],
            ["expenses-9", "196,11 SEK", []],
            ["expenses-10", "2 342,30 SEK", []],
          ],
          total: "82 224,05 SEK",
        },
      },
    ],
    [
      "2023",
      {
        income: {
          lines: [
            ["income-1", undefined, [["income-1-1", "8 600,00 SEK"]]],
            ["income-2", "1 800,00 SEK", []],
            ["income-4", "235,00 SEK", []],
            ["income-5", undefined, [["income-5-2", "15 646,00 SEK"]]],
            ["income-7", "1 088,26 SEK", []],
          ],
          total: "27 369,26 SEK",
        },
        expenses: {
          lines: [
            ["expenses-1", "1 241,25 SEK", []],
            ["expenses-2", "1 523,00 SEK", []],
            [
              "expenses-3",
              undefined,
              [
                ["expenses-3-1", "2 827,00 SEK"],
                ["expenses-3-2", "16 893,00 SEK"],
              ],
            ],
            ["expenses-4", "8 000,00 SEK", []],
            ["expenses-10", "1 973,65 SEK", []],
          ],
          total: "32 457,9 SEK",
        },
      },
    ],
    [
      "2022",
      {
        income: {
          lines: [
            ["income-1", undefined, [["income-1-1", "7 950,00 SEK"]]],
            ["income-2", "500,00 SEK", []],
            ["income-4", "4 660,00 SEK", []],
            ["income-5", undefined, [["income-5-2", "15 533,00 SEK"]]],
            ["income-7", "363,38 SEK", []],
          ],
          total: "29 006,38 SEK",
        },
        expenses: {
          lines: [
            ["expenses-1", "1 003,75 SEK", []],
            ["expenses-2", "4 735,00 SEK", []],
            [
              "expenses-3",
              undefined,
              [
                ["expenses-3-1", "3 545,00 SEK"],
                ["expenses-3-2", "18 770,00 SEK"],
              ],
            ],
            ["expenses-10", "1 974,60 SEK", []],
          ],
          total: "30 028,52 SEK",
        },
      },
    ],
  ];

  const finances = financesByYear[financesPage - 1];

  const content = (
    <>
      <Typography variant="h5" fontWeight={700} mb={1}>
        {t("pages.resources-transparency.content.section-2.title")}
      </Typography>
      <Typography variant="body1" mb={1}>
        {t("pages.resources-transparency.content.section-2.text-1")}
      </Typography>
      <ul>
        <li>
          <Typography variant="body1" mb={1}>
            {t("pages.resources-transparency.content.section-2.point-1")}
          </Typography>
        </li>
        <li>
          <Typography variant="body1" mb={1}>
            {t("pages.resources-transparency.content.section-2.point-2")}
          </Typography>
        </li>
        <li>
          <Typography variant="body1" mb={1}>
            {t("pages.resources-transparency.content.section-2.point-3")}
          </Typography>
        </li>
      </ul>
      {finances && (
        <>
          <Grid container spacing={3} mt={5} mb={5} direction="row">
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card variant="outlined" className={styles.pricesCard}>
                <Box className={styles.pricesTopBox}>
                  <Typography variant="h6" fontWeight="600" component="div">
                    {t("pages.resources-transparency.finances-income.title")}{" "}
                    {finances[0]}
                  </Typography>
                </Box>
                <Divider />

                <Box>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {finances[1].income.lines.map((financeIncome: any) => {
                          const nestedRows = (
                            <>
                              {financeIncome[2].map(
                                (financeIncomeNested: any) => {
                                  return (
                                    <TableRow
                                      sx={{
                                        "&:last-child td, &:last-child th": {
                                          border: 0,
                                        },
                                      }}
                                      className={styles.pricesTableRowNested}
                                    >
                                      <TableCell component="th" scope="row">
                                        {t(
                                          "pages.resources-transparency.finances-income." +
                                            financeIncomeNested[0],
                                        )}
                                      </TableCell>
                                      <TableCell align="right">
                                        {financeIncomeNested[1]}
                                      </TableCell>
                                    </TableRow>
                                  );
                                },
                              )}
                            </>
                          );
                          return (
                            <>
                              <TableRow
                                sx={{
                                  "&:last-child td, &:last-child th": {
                                    border: 0,
                                  },
                                }}
                                className={
                                  financeIncome[2].length > 0 &&
                                  styles.pricesTableRowTotal
                                }
                              >
                                <TableCell component="th" scope="row">
                                  {t(
                                    "pages.resources-transparency.finances-income." +
                                      financeIncome[0],
                                  )}
                                </TableCell>
                                <TableCell align="right">
                                  {financeIncome[1]}
                                </TableCell>
                              </TableRow>
                              {nestedRows}
                            </>
                          );
                        })}
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": {
                              border: 0,
                            },
                          }}
                          className={styles.pricesTableRowTotal}
                        >
                          <TableCell component="th" scope="row">
                            {t(
                              "pages.resources-transparency.finances-income.summary-total",
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {finances[1].income.total}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card variant="outlined" className={styles.pricesCard}>
                <Box className={styles.pricesTopBox}>
                  <Typography variant="h6" fontWeight="600" component="div">
                    {t("pages.resources-transparency.finances-expenses.title")}{" "}
                    {finances[0]}
                  </Typography>
                </Box>
                <Divider />

                <Box>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {finances[1].expenses.lines.map(
                          (financeExpense: any) => {
                            const nestedRows = (
                              <>
                                {financeExpense[2].map(
                                  (financeExpenseNested: any) => {
                                    return (
                                      <TableRow
                                        sx={{
                                          "&:last-child td, &:last-child th": {
                                            border: 0,
                                          },
                                        }}
                                        className={styles.pricesTableRowNested}
                                      >
                                        <TableCell component="th" scope="row">
                                          {t(
                                            "pages.resources-transparency.finances-expenses." +
                                              financeExpenseNested[0],
                                          )}
                                        </TableCell>
                                        <TableCell align="right">
                                          {financeExpenseNested[1]}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  },
                                )}
                              </>
                            );
                            return (
                              <>
                                <TableRow
                                  sx={{
                                    "&:last-child td, &:last-child th": {
                                      border: 0,
                                    },
                                  }}
                                  className={
                                    financeExpense[2].length > 0 &&
                                    styles.pricesTableRowTotal
                                  }
                                >
                                  <TableCell component="th" scope="row">
                                    {t(
                                      "pages.resources-transparency.finances-expenses." +
                                        financeExpense[0],
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    {financeExpense[1]}
                                  </TableCell>
                                </TableRow>
                                {nestedRows}
                              </>
                            );
                          },
                        )}
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": {
                              border: 0,
                            },
                          }}
                          className={styles.pricesTableRowTotal}
                        >
                          <TableCell component="th" scope="row">
                            {t(
                              "pages.resources-transparency.finances-expenses.summary-total",
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {finances[1].expenses.total}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Card>
            </Grid>
          </Grid>
          {financesByYear.length && (
            <Stack alignItems="center" mt={4}>
              <Pagination
                page={financesPage}
                count={financesByYear.length}
                onChange={(e: any, value: number) =>
                  handleChangeFinancesPage(value)
                }
              />
            </Stack>
          )}
        </>
      )}
    </>
  );

  return (
    <PageBase
      title={t("pages.resources-transparency.title")}
      content={content}
      loading={!finances}
    />
  );
}

export default ResourcesTransparencyPage;
