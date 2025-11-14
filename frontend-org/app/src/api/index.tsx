import axios from "axios";
import i18n from "i18next";
import { getCookie } from "typescript-cookie";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  withXSRFToken: true,
  validateStatus: (status: number) => {
    return status >= 200 && status < 500;
  },
});

instance.interceptors.response.use(
  function (response: any) {
    return response;
  },
  function (error: any) {
    return Promise.reject(error);
  },
);

instance.interceptors.request.use(async (config: any) => {
  config.headers["Accept-Language"] = i18n.resolvedLanguage;
  config.headers["X-CSRFToken"] = getCookie("csrftoken");
  return config;
});

export const apiOrgCreate = async (adults: any[], children: any[]) => {
  try {
    return await instance.post("/org/", {
      adults: adults,
      children: children,
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiOrgCheck = async (email: string) => {
  try {
    return await instance.post("/org/check/", {
      email: email,
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};
