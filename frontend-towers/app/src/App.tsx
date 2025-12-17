import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/home";
import ResourcesPage from "./pages/resources";
import UserLoginPage from "./pages/user-login";
import UserJoinPage from "./pages/user-join";
import UserPasswordPage from "./pages/user-password";
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
import Box from "@mui/material/Box";
import * as React from "react";
import { apiUserMe } from "./api";
import AppContext from "./components/AppContext/AppContext";
import { useState } from "react";
import UserDashboardPage from "./pages/user-dashboard";
import { ROUTES } from "./routes";
import UserVerifyPage from "./pages/user-verify";
import CalendarPage from "./pages/calendar";
import AboutTeamPage from "./pages/about-team";
import AboutBylawsPage from "./pages/about-bylaws";
import Trips2025BerlinPage from "./pages/trips-2025-berlin";
import AssociationPage from "./pages/association";
import AdminPage from "./pages/admin";
import Calendar20250614AnniversaryPerformancePage from "./pages/calendar-2025-06-14-anniversary-performance";
import AdminAttendancePage from "./pages/admin-attendance";
import AdminEquipmentPage from "./pages/admin-equipment";
import OrderPage from "./pages/order";
import OrderCartPage from "./pages/order-cart";
import OrderPaymentPage from "./pages/order-payment";
import OrderReceiptPage from "./pages/order-receipt";
import OrderCompletePage from "./pages/order-complete";
import AdminUserPage from "./pages/admin-user";
import PressReleasePage from "./pages/press-release";
import CalendarEventPage from "./pages/calendar-event";
import BusinessWorkshopsPage from "./pages/business-workshops";
import BusinessPerformancesPage from "./pages/business-performances";
import PressArticlePage from "./pages/press-articles";
import AdminStatsPage from "./pages/admin-stats";

i18next.use(LngDetector).init({
  interpolation: { escapeValue: false },
  fallbackLng: "en",
  load: "languageOnly",
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
  const [user, setUser] = useState(undefined);
  const [messages, setMessages] = useState(undefined);
  const [familyMemberRequests, setFamilyMemberRequests] =
    React.useState(undefined);
  const [familyMemberRequestsReceived, setFamilyMemberRequestsReceived] =
    React.useState(undefined);
  const [rehearsal, setRehearsal] = useState(undefined);
  const [cart, setCart] = React.useState<{
    [key: string]: [number, object];
  }>({});
  const [order, setOrder] = useState(undefined);

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
        familyMemberRequests,
        setFamilyMemberRequests,
        familyMemberRequestsReceived,
        setFamilyMemberRequestsReceived,
        rehearsal,
        setRehearsal,
        cart,
        setCart,
        order,
        setOrder,
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
                  <Route
                    path={ROUTES.resources.path}
                    element={<ResourcesPage />}
                  />
                  <Route
                    path={ROUTES.calendar.path}
                    element={<CalendarPage />}
                  />
                  <Route
                    path={ROUTES["calendar-signup"].path}
                    element={<CalendarPage />}
                  />
                  <Route
                    path={ROUTES["calendar-event"].path}
                    element={<CalendarEventPage />}
                  />
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
                    path={ROUTES["user-set-password"].path}
                    element={<UserPasswordPage />}
                  />
                  <Route
                    path={ROUTES["user-set-verify"].path}
                    element={<UserVerifyPage />}
                  />
                  <Route
                    path={ROUTES["user-dashboard"].path}
                    element={<UserDashboardPage />}
                  />
                  <Route
                    path={ROUTES["about-team"].path}
                    element={<AboutTeamPage />}
                  />
                  <Route
                    path={ROUTES["about-bylaws"].path}
                    element={<AboutBylawsPage />}
                  />
                  <Route
                    path={ROUTES["trips-2025-berlin"].path}
                    element={<Trips2025BerlinPage />}
                  />
                  <Route
                    path={ROUTES.association.path}
                    element={<AssociationPage />}
                  />
                  <Route path={ROUTES.order.path} element={<OrderPage />} />
                  <Route
                    path={ROUTES["order-cart"].path}
                    element={<OrderCartPage />}
                  />
                  <Route
                    path={ROUTES["order-payment"].path}
                    element={<OrderPaymentPage />}
                  />
                  <Route
                    path={ROUTES["order-complete"].path}
                    element={<OrderCompletePage />}
                  />
                  <Route
                    path={ROUTES["order-receipt"].path}
                    element={<OrderReceiptPage />}
                  />
                  <Route
                    path={ROUTES["press-article"].path}
                    element={<PressArticlePage />}
                  />
                  <Route
                    path={ROUTES["press-release"].path}
                    element={<PressReleasePage />}
                  />
                  <Route
                    path={ROUTES["press-release-date"].path}
                    element={<PressReleasePage />}
                  />
                  <Route
                    path={ROUTES["press-release-no-date"].path}
                    element={<PressReleasePage />}
                  />
                  <Route path={ROUTES.admin.path} element={<AdminPage />} />
                  <Route
                    path={ROUTES["admin-attendance"].path}
                    element={<AdminAttendancePage />}
                  />
                  <Route
                    path={ROUTES["admin-equipment"].path}
                    element={<AdminEquipmentPage />}
                  />
                  <Route
                    path={ROUTES["admin-user"].path}
                    element={<AdminUserPage />}
                  />
                  <Route
                    path={ROUTES["admin-stats"].path}
                    element={<AdminStatsPage />}
                  />
                  <Route
                    path={
                      ROUTES["calendar-2025-06-14-anniversary-performance"].path
                    }
                    element={<Calendar20250614AnniversaryPerformancePage />}
                  />
                  <Route
                    path={ROUTES["business-workshops"].path}
                    element={<BusinessWorkshopsPage />}
                  />
                  <Route
                    path={ROUTES["business-performances"].path}
                    element={<BusinessPerformancesPage />}
                  />
                  <Route
                    path={ROUTES.workshops.path}
                    element={
                      <Navigate
                        to={ROUTES["business-workshops"].path}
                        replace
                      />
                    }
                  />
                  <Route
                    path={ROUTES.performances.path}
                    element={
                      <Navigate
                        to={ROUTES["business-performances"].path}
                        replace
                      />
                    }
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
