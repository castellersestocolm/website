import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { appTheme } from "./themes/theme";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import common_sv from "./translations/sv/common.json";
import common_ca from "./translations/ca/common.json";
import LngDetector from "i18next-browser-languagedetector";
import Box from "@mui/material/Box";
import * as React from "react";
import { ROUTES } from "./routes";
import HomePage from "./pages/home";

i18next.use(LngDetector).init({
  interpolation: { escapeValue: false },
  fallbackLng: "en",
  load: "languageOnly",
  resources: {
    sv: {
      common: common_sv,
    },
    ca: {
      common: common_ca,
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={appTheme}>
      <I18nextProvider i18n={i18next}>
        <BrowserRouter>
          <Box
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
              overflowX: "hidden",
            }}
          >
            <Routes>
              <Route path={ROUTES.home.path} element={<HomePage />} />
            </Routes>
          </Box>
        </BrowserRouter>
      </I18nextProvider>
    </ThemeProvider>
  );
};

export default App;
