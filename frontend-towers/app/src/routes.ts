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
  "external-form-membership": {
    path: "https://docs.google.com/forms/d/e/1FAIpQLSc9wMkRaa-nkX8NgSBj3zDLFWQtRKxBOzchbdznQ8plWRHOaQ/viewform",
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
};
