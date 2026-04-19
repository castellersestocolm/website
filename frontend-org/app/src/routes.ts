const API_BASE_URL = process.env.REACT_APP_ORG_API_URL;
const ORG_BASE_URL = process.env.REACT_APP_ORG_BASE_URL;

export const ROUTES = {
  home: {
    path: "/",
  },
  status: {
    path: "/status",
  },
  "user-login": {
    path: "/user/login",
  },
  "user-dashboard": {
    path: "/user/dashboard",
  },
  "user-password": {
    path: "/user/password",
  },
  "user-set-password": {
    path: "/user/password/:token",
  },
  "calendar-event": {
    path: "/calendar/event/:year/:month/:day/:code",
  },
  "external-login-google": {
    path:
      API_BASE_URL +
      "/user/login/google-oauth2/?next=" +
      ORG_BASE_URL +
      "/user/dashboard",
  },
  "external-website": {
    path: "https://lesquatrebarres.org",
  },
};
