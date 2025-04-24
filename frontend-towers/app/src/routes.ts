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
  association: {
    path: "/association",
  },
  "trips-2025-berlin": {
    path: "/trips/2025/berlin",
  },
  admin: {
    path: "/admin",
  },
  "sale-bandana": {
    path: "/sale/bandana",
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
    path: "https://forms.gle/3UGC4Phz7z5NEwU68",
  },
  "external-berlin-diada-2025": {
    path: "https://castellers.berlin/international-diada-castellera-berlin-2025/",
  },
};
