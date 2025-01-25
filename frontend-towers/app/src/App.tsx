import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home";
import ResourcesPage from "./pages/resources";
import { ThemeProvider } from "@mui/material";
import { appTheme } from "./themes/theme";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import common_en from "./translations/en/common.json";
import common_sv from "./translations/sv/common.json";
import common_ca from "./translations/ca/common.json";
import LngDetector from "i18next-browser-languagedetector";

i18next.use(LngDetector).init({
  interpolation: { escapeValue: false },
  fallbackLng: "en",
  resources: {
    en: {
      common: common_en,
    },
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
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/resources" element={<ResourcesPage />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </I18nextProvider>
    </ThemeProvider>
  );
};

export default App;
