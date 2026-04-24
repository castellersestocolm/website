import axios from "axios";
import i18n from "i18next";
import { WP_API_POSTS_LIST_PAGE_SIZE } from "../consts";

const WP_API_BASE_URL = process.env.REACT_APP_ORG_WP_API_BASE_URL;
const WP_CATEGORIES_CA = process.env.REACT_APP_ORG_WP_CATEGORIES_CA;
const WP_CATEGORIES_SV = process.env.REACT_APP_ORG_WP_CATEGORIES_SV;

const instance = axios.create({
  baseURL: WP_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
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
  return config;
});

export const wpApiPostList = async (
  language: string,
  page: number = undefined,
  pageSize: number = undefined,
) => {
  try {
    return await instance.get("/posts/", {
      params: {
        categories: language === "sv" ? WP_CATEGORIES_SV : WP_CATEGORIES_CA,
        page_size: pageSize ? pageSize : WP_API_POSTS_LIST_PAGE_SIZE,
        page: page,
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const wpApiMediaRetrieve = async (mediaId: string) => {
  try {
    return await instance.get("/media/" + mediaId);
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};
