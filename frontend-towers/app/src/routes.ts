const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const TOWERS_BASE_URL = process.env.REACT_APP_TOWERS_BASE_URL;

export const ROUTES = {
  home: {
    path: "/",
  },
  resources: {
    path: "/resources",
  },
  "user-login": {
    path: "/user/login",
  },
  "user-join": {
    path: "/user/join",
  },
  "user-password": {
    path: "/user/password",
  },
  "user-set-password": {
    path: "/user/password/:token",
  },
  "user-set-verify": {
    path: "/user/verify/:token",
  },
  "user-dashboard": {
    path: "/user/dashboard",
  },
  "about-team": {
    path: "/about/team",
  },
  "about-bylaws": {
    path: "/about/bylaws",
  },
  calendar: {
    path: "/calendar",
  },
  "calendar-signup": {
    path: "/calendar/:token",
  },
  "calendar-event": {
    path: "/calendar/event/:year/:month/:day/:code",
  },
  association: {
    path: "/association",
  },
  "trips-2025-berlin": {
    path: "/trips/2025/berlin",
  },
  "calendar-2025-06-14-anniversary-performance": {
    path: "/calendar/2025/06/14/anniversary-performance",
  },
  order: {
    path: "/order",
  },
  "order-cart": {
    path: "/order/cart",
  },
  "order-payment": {
    path: "/order/payment/:id",
  },
  "order-complete": {
    path: "/order/complete/:id",
  },
  "order-receipt": {
    path: "/order/receipt/:id",
  },
  press: {
    path: "/press",
  },
  "press-release": {
    path: "/press/release/:year/:month/:day/:slug",
  },
  // Kept for compatibility
  "press-release-no-date": {
    path: "/press/release/:slug",
  },
  "business-workshops": {
    path: "/business/workshops",
  },
  "business-performances": {
    path: "/business/performances",
  },
  admin: {
    path: "/admin",
  },
  "admin-attendance": {
    path: "/admin/attendance",
  },
  "admin-equipment": {
    path: "/admin/equipment",
  },
  "admin-user": {
    path: "/admin/user",
  },
  "external-form-equipment": {
    path: "https://docs.google.com/forms/d/e/1FAIpQLSc1ZoTANdTVTpeZ_jqxvGVm1KXpjNZQLBD4m6pkCtugkBAWqg/viewform",
  },
  "external-login-google": {
    path:
      API_BASE_URL +
      "/user/login/google-oauth2/?next=" +
      TOWERS_BASE_URL +
      "/user/dashboard",
  },
  "external-casal": {
    path: "https://lesquatrebarres.org",
  },
  "external-casal-form-membership": {
    path: "https://quota.lesquatrebarres.org",
  },
  "external-berlin-diada-2025": {
    path: "https://castellers.berlin/international-diada-castellera-berlin-2025/",
  },
  "external-calendar-2025-06-14-anniversary-performance": {
    path: "https://maps.app.goo.gl/8RrBWaQUbPXiMb3v6",
  },
  "external-calendar-2025-07-17-kulturfestivalen-performance": {
    path: "https://kulturfestivalen.stockholm.se/programpunkt/manskliga-torn-med-castellers-destocolm-xiquets-de-copenhagen/",
  },
};
