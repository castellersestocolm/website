import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { appTheme } from "./themes/theme";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import common_sv from "./translations/sv/common.json";
import common_ca from "./translations/ca/common.json";
import LngDetector from "i18next-browser-languagedetector";
import AppContext from "./components/AppContext/AppContext";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import Box from "@mui/material/Box";
import * as React from "react";
import { ROUTES } from "./routes";
import HomePage from "./pages/home";
import StatusPage from "./pages/status";
import { useState } from "react";
import UserDashboardPage from "./pages/user-dashboard";
import { apiUserMe } from "./api";
import UserLoginPage from "./pages/user-login";
import UserJoinPage from "./pages/user-join";
import UserPasswordPage from "./pages/user-password";
import CalendarEventPage from "./pages/calendar-event";
import CalendarPage from "./pages/calendar";
import AboutBylawsPage from "./pages/about-bylaws";
import AboutTeamPage from "./pages/about-team";
import AboutContactPage from "./pages/about-contact";
import NewsPostPage from "./pages/news-post";
import PolicyPrivacyPage from "./pages/policy-privacy";
import ActivityKidsPage from "./pages/activity-kids";

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
              <NavBar />
              <Box style={{ flexGrow: 1, position: "relative" }}>
                <Routes>
                  <Route path={ROUTES.home.path} element={<HomePage />} />
                  <Route path={ROUTES.status.path} element={<StatusPage />} />
                  <Route
                    path={ROUTES["user-login"].path}
                    element={<UserLoginPage />}
                  />
                  <Route
                    path={ROUTES["user-join"].path}
                    element={<UserJoinPage />}
                  />
                  <Route
                    path={ROUTES["user-password"].path}
                    element={<UserPasswordPage />}
                  />
                  <Route
                    path={ROUTES["user-dashboard"].path}
                    element={<UserDashboardPage />}
                  />
                  <Route
                    path={ROUTES["calendar"].path}
                    element={<CalendarPage />}
                  />
                  <Route
                    path={ROUTES["calendar-event"].path}
                    element={<CalendarEventPage />}
                  />
                  <Route
                    path={ROUTES["about-bylaws"].path}
                    element={<AboutBylawsPage />}
                  />
                  <Route
                    path={ROUTES["about-team"].path}
                    element={<AboutTeamPage />}
                  />
                  <Route
                    path={ROUTES["about-contact"].path}
                    element={<AboutContactPage />}
                  />
                  <Route
                    path={ROUTES["news-post"].path}
                    element={<NewsPostPage />}
                  />
                  <Route
                    path={ROUTES["policy-privacy"].path}
                    element={<PolicyPrivacyPage />}
                  />
                  <Route
                    path={ROUTES["activity-kids"].path}
                    element={<ActivityKidsPage />}
                  />
                </Routes>
              </Box>
              <Footer />
            </Box>
          </BrowserRouter>
        </I18nextProvider>
      </ThemeProvider>
    </AppContext.Provider>
  );
};

export default App;
