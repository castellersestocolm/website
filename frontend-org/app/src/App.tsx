import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { appTheme } from "./themes/theme";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import common_sv from "./translations/sv/common.json";
import common_ca from "./translations/ca/common.json";
import LngDetector from "i18next-browser-languagedetector";
import AppContext from "./components/AppContext/AppContext";
import Box from "@mui/material/Box";
import * as React from "react";
import { ROUTES } from "./routes";
import HomePage from "./pages/home";
import StatusPage from "./pages/status";
import { useState } from "react";
import UserDashboardPage from "./pages/user-dashboard";
import { apiUserMe } from "./api";

i18next.use(LngDetector).init({
  interpolation: { escapeValue: false },
  fallbackLng: "ca",
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
  const [user, setUser] = useState(undefined);
  const [messages, setMessages] = useState(undefined);

  React.useEffect(() => {
    apiUserMe().then((response) => {
      if (response.status === 200) {
        setUser(response.data);
      } else if (response.status === 204) {
        setUser(null);
      }
    });
  }, [setUser]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        messages,
        setMessages,
      }}
    >
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
                <Route path={ROUTES.status.path} element={<StatusPage />} />
                <Route
                  path={ROUTES["user-dashboard"].path}
                  element={<UserDashboardPage />}
                />
              </Routes>
            </Box>
          </BrowserRouter>
        </I18nextProvider>
      </ThemeProvider>
    </AppContext.Provider>
  );
};

export default App;
