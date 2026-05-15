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
  "user-join": {
    path: "/user/join",
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
  "activity-kids": {
    path: "/activity/kids",
  },
  "policy-privacy": {
    path: "/policy/privacy",
  },
  calendar: {
    path: "/calendar",
  },
  "calendar-event": {
    path: "/calendar/event/:year/:month/:day/:code",
  },
  "about-bylaws": {
    path: "/about/bylaws",
  },
  "about-team": {
    path: "/about/team",
  },
  "about-contact": {
    path: "/about/contact",
  },
  "resources-newsletters": {
    path: "/resources/newsletters",
  },
  "resources-reports": {
    path: "/resources/reports",
  },
  "news-post": {
    path: "/news/:year/:month/:slug",
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
  "external-towers": {
    path: "https://castellersestocolm.se",
  },
  "external-gencat": {
    path: "https://gencat.cat",
  },
};
