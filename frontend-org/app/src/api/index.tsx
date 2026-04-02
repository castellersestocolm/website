import axios from "axios";
import i18n from "i18next";
import { getCookie } from "typescript-cookie";
import {
  API_EVENTS_LIST_PAGE_SIZE,
  API_EXPENSES_LIST_PAGE_SIZE,
  API_ORDERS_LIST_PAGE_SIZE,
  API_PAYMENTS_LIST_PAGE_SIZE,
  API_REGISTRATIONS_LIST_PAGE_SIZE,
} from "../consts";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

export const apiActivityProgramList = async () => {
  try {
    return await instance.get("/activity/program/");
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiMembershipList = async () => {
  try {
    return await instance.get("/membership/");
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiPaymentExpenseList = async (page: number = undefined) => {
  try {
    return await instance.get("/payment/expense/", {
      params: {
        page_size: API_EXPENSES_LIST_PAGE_SIZE,
        page: page,
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiOrderList = async (page: number = undefined) => {
  try {
    return await instance.get("/order/", {
      params: {
        page_size: API_ORDERS_LIST_PAGE_SIZE,
        page: page,
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiPaymentList = async (page: number = undefined) => {
  try {
    return await instance.get("/payment/", {
      params: {
        page_size: API_PAYMENTS_LIST_PAGE_SIZE,
        page: page,
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiUserLogout = async () => {
  try {
    return await instance.post("/user/logout/");
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiUserLogin = async (email: string, password: string) => {
  try {
    return await instance.post("/user/login/", {
      email: email,
      password: password,
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiUserPassword = async (
  token: string,
  password: string,
  password2: string,
) => {
  try {
    return await instance.post("/user/password/", {
      token: token,
      password: password,
      password2: password2,
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiUserRequestPassword = async (email: string) => {
  try {
    return await instance.post("/user/request-password/", { email: email });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiUserMe = async () => {
  try {
    return await instance.get("/user/me/");
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiEventRegistrationList = async (page: number = undefined) => {
  try {
    return await instance.get("/event/registration/", {
      params: {
        page_size: API_REGISTRATIONS_LIST_PAGE_SIZE,
        page: page,
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiEventList = async (
  page: number = undefined,
  pageSize: number = undefined,
  token: string = undefined,
  dateFrom: string = undefined,
  dateTo: string = undefined,
  withCounts: boolean = undefined,
  forMusicians: boolean = undefined,
  filterTypes: number[] = undefined,
  filterIsRegistered: boolean = undefined,
  orderBy: string[] = undefined,
) => {
  try {
    return await instance.get("/event/", {
      params: {
        page_size: pageSize ? pageSize : API_EVENTS_LIST_PAGE_SIZE,
        page: page ? page : 1,
        token: token,
        date_from:
          dateFrom !== undefined
            ? dateFrom
            : new Date().toISOString().substring(0, 10),
        date_to: dateTo,
        with_counts: withCounts,
        for_musicians: forMusicians,
        filter_types: filterTypes && filterTypes.join(","),
        filter_is_registered: filterIsRegistered,
        order_by: orderBy && orderBy.join(","),
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};
