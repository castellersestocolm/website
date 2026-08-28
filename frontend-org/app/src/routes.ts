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
  "user-set-verify": {
    path: "/user/verify/:token",
  },
  "user-consent": {
    path: "/user/consent",
  },
  "activity-kids": {
    path: "/activity/kids",
  },
  "policy-privacy": {
    path: "/policy/privacy",
  },
  "policy-purchase": {
    path: "/policy/purchase",
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
  "resources-transparency": {
    path: "/resources/transparency",
  },
  "news-post": {
    path: "/news/:year/:month/:slug",
  },
  membership: {
    path: "/membership",
  },
  "membership-payment": {
    path: "/membership/payment/:id",
  },
  "membership-complete": {
    path: "/membership/complete/:id",
  },
  "membership-receipt": {
    path: "/membership/receipt/:id",
  },
  "course-payment": {
    path: "/course/payment/:id",
  },
  "course-receipt": {
    path: "/course/receipt/:id",
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
  "external-towers-user-dashboard": {
    path: "https://castellersestocolm.se/user/dashboard",
  },
  "external-towers-user-join": {
    path: "https://castellersestocolm.se/user/join",
  },
  "external-gencat": {
    path: "https://gencat.cat",
  },
};
