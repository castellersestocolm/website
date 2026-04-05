const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
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
