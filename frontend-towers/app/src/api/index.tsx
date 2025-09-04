import axios from "axios";
import i18n from "i18next";
import { getCookie } from "typescript-cookie";
import {
  API_EVENTS_LIST_PAGE_SIZE,
  API_EXPENSES_LIST_PAGE_SIZE,
  API_PAYMENTS_LIST_PAGE_SIZE,
  API_ORDERS_LIST_PAGE_SIZE,
  API_PRODUCTS_LIST_PAGE_SIZE,
  API_ADMIN_USER_LIST_PAGE_SIZE,
  API_MEDIA_PRESS_LIST_PAGE_SIZE,
} from "../consts";
import { RegistrationStatus } from "../enums";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  withXSRFToken: true,
  validateStatus: (status) => {
    return status >= 200 && status < 500;
  },
});

instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  },
);

instance.interceptors.request.use(async (config) => {
  config.headers["Accept-Language"] = i18n.resolvedLanguage;
  config.headers["X-CSRFToken"] = getCookie("csrftoken");
  return config;
});

export const apiUserMe = async () => {
  try {
    return await instance.get("/user/me/");
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

export const apiUserCreate = async (
  firstname: string,
  lastname: string,
  email: string,
  phone: string,
  password: string,
  password2: string,
  birthday: string,
  consent_pictures: boolean,
  preferred_language: string,
  /*
    height_shoulders: number,
    height_arms: number,
  */
) => {
  try {
    return await instance.post("/user/", {
      firstname: firstname,
      lastname: lastname,
      email: email,
      phone: phone,
      password: password,
      password2: password2,
      birthday: birthday,
      consent_pictures: consent_pictures,
      preferred_language: preferred_language,
      towers: {
        /*
          height_shoulders: height_shoulders,
          height_arms: height_arms,
        */
      },
      organisation: {},
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiUserUpdate = async (
  id: string,
  firstname: string,
  lastname: string,
  phone: string,
  birthday: string,
  consent_pictures: boolean,
  preferred_language: string,
  /*
    height_shoulders: number,
    height_arms: number,
  */
) => {
  try {
    return await instance.patch("/user/" + id + "/", {
      firstname: firstname,
      lastname: lastname,
      phone: phone,
      birthday: birthday,
      consent_pictures: consent_pictures,
      preferred_language: preferred_language,
      towers: {
        /*
          height_shoulders: height_shoulders,
          height_arms: height_arms,
        */
      },
      organisation: {},
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

export const apiUserFamily = async (token: string = undefined) => {
  try {
    return await instance.get("/user/family/", { params: { token: token } });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiUserFamilyMemberCreate = async (
  firstname: string,
  lastname: string,
  birthday: string,
  /*
    height_shoulders: number,
    height_arms: number,
  */
  consent_pictures: boolean,
) => {
  try {
    return await instance.post("/user/family/member/", {
      firstname: firstname,
      lastname: lastname,
      birthday: birthday,
      consent_pictures: consent_pictures,
      towers: {
        /*
          height_shoulders: height_shoulders,
          height_arms: height_arms,
        */
      },
      organisation: {},
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiUserFamilyMemberUpdate = async (
  id: string,
  firstname: string,
  lastname: string,
  birthday: string,
  /*
    height_shoulders: number,
    height_arms: number,
  */
  consent_pictures: boolean,
) => {
  try {
    return await instance.put("/user/family/member/" + id + "/", {
      firstname: firstname,
      lastname: lastname,
      birthday: birthday,
      consent_pictures: consent_pictures,
      towers: {
        /*
          height_shoulders: height_shoulders,
          height_arms: height_arms,
        */
      },
      organisation: {},
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiUserFamilyMemberDelete = async (id: string) => {
  try {
    return await instance.delete("/user/family/member/" + id + "/");
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiUserVerify = async (token: string) => {
  try {
    return await instance.post("/user/verify/", { token: token });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiUserRequestVerify = async (email: string) => {
  try {
    return await instance.post("/user/request-verify/", { email: email });
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

export const apiUserList = async () => {
  try {
    return await instance.get("/user/");
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

export const apiMembershipList = async () => {
  try {
    return await instance.get("/membership/");
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiMembershipRenewList = async () => {
  try {
    return await instance.get("/membership/renew/");
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiMembershipRenewCreate = async (modules: number[]) => {
  try {
    return await instance.post("/membership/renew/", {
      modules: modules,
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiUserFamilyMemberRequestCreate = async (email: string) => {
  try {
    return await instance.post("/user/family/member/request/", {
      email: email,
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiUserFamilyMemberRequestList = async () => {
  try {
    return await instance.get("/user/family/member/request/");
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiUserFamilyMemberRequestReceivedList = async () => {
  try {
    return await instance.get("/user/family/member/request/received/");
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiUserFamilyMemberRequestCancel = async (id: string) => {
  try {
    return await instance.delete(
      "/user/family/member/request/" + id + "/cancel/",
    );
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiUserFamilyMemberRequestReject = async (id: string) => {
  try {
    return await instance.delete(
      "/user/family/member/request/" + id + "/reject/",
    );
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiUserFamilyMemberRequestAccept = async (id: string) => {
  try {
    return await instance.post(
      "/user/family/member/request/" + id + "/accept/",
    );
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

export const apiOrderRetrieve = async (id: string) => {
  try {
    return await instance.get("/order/" + id);
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiPaymentProviderList = async () => {
  try {
    return await instance.get("/payment/provider/");
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

export const apiEventList = async (
  page: number = undefined,
  pageSize: number = undefined,
  token: string = undefined,
  dateFrom: string = undefined,
  dateTo: string = undefined,
  withCounts: boolean = undefined,
) => {
  try {
    return await instance.get("/event/", {
      params: {
        page_size: pageSize ? pageSize : API_EVENTS_LIST_PAGE_SIZE,
        page: page ? page : 1,
        token: token,
        date_from: dateFrom
          ? dateFrom
          : new Date().toISOString().substring(0, 10),
        date_to: dateTo,
        with_counts: withCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiEventPage = async (date: string, code: string) => {
  try {
    return await instance.get("/event/page/", {
      params: {
        date: date,
        code: code,
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiEventCalendarList = async (
  dateFrom: string,
  dateTo: string,
) => {
  try {
    return await instance.get("/event/calendar/", {
      params: { date_from: dateFrom, date_to: dateTo },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiEventRegistrationCreate = async (
  userId: string,
  eventId: string,
  token: string = undefined,
  status: RegistrationStatus = undefined,
) => {
  try {
    return await instance.post("/event/registration/", {
      user_id: userId,
      event_id: eventId,
      token: token,
      status: status,
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiEventRegistrationDelete = async (
  registrationId: string,
  token: string = undefined,
) => {
  try {
    return await instance.delete(
      "/event/registration/" + registrationId + "/",
      { params: { token: token } },
    );
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiEventRegistrationList = async (
  eventId: string,
  forAdmin: boolean = undefined,
) => {
  try {
    return await instance.get("/event/registration/", {
      params: {
        event_id: eventId,
        for_admin: forAdmin,
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiLegalTeamList = async () => {
  try {
    return await instance.get("/legal/team/");
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiLegalBylawsList = async () => {
  try {
    return await instance.get("/legal/bylaws/");
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiMediaReleaseList = async (page: number = undefined) => {
  try {
    return await instance.get("/media/release/", {
      params: {
        page_size: API_MEDIA_PRESS_LIST_PAGE_SIZE,
        page: page,
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiMediaReleaseRetrieve = async (slug: string) => {
  try {
    return await instance.get("/media/release/" + slug);
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiTowersCastleList = async (eventId: string) => {
  try {
    return await instance.get("/towers/castle/", {
      params: { event_id: eventId },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiProductList = async (page: number = undefined) => {
  try {
    return await instance.get("/product/", {
      params: {
        page_size: API_PRODUCTS_LIST_PAGE_SIZE,
        page: page,
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiOrderCreate = async (
  sizes: any[],
  delivery: any,
  deliveryProvider: any,
  userData: any,
  formPickupData: any,
) => {
  try {
    return await instance.post("/order/", {
      cart: { sizes: sizes },
      delivery: {
        address: delivery,
        provider: { id: deliveryProvider.id, type: deliveryProvider.type },
      },
      user: userData,
      pickup: { event_id: formPickupData.event },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiOrderDelete = async (orderId: string) => {
  try {
    return await instance.delete("/order/" + orderId + "/");
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiOrderProviderUpdate = async (
  orderId: string,
  providerId: string,
) => {
  try {
    return await instance.patch("/order/" + orderId + "/provider/", {
      provider_id: providerId,
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiOrderComplete = async (orderId: string) => {
  try {
    return await instance.post("/order/" + orderId + "/complete/");
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiDataLocationCountryList = async () => {
  try {
    return await instance.get("/data/location/country/");
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiOrderDeliveryProviderList = async () => {
  try {
    return await instance.get("/order/delivery/provider/");
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiAdminUserList = async (
  page: number = undefined,
  pageSize: number = undefined,
  ordering: string = undefined,
  isAdult: boolean = undefined,
) => {
  try {
    return await instance.get("/admin/user/", {
      params: {
        page_size: pageSize ? pageSize : API_ADMIN_USER_LIST_PAGE_SIZE,
        page: page,
        ordering: ordering,
        is_adult: isAdult,
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiAdminUserUpdate = async (
  userId: string,
  alias: string = undefined,
  heightShoulders: string = undefined,
  heightArms: string = undefined,
) => {
  try {
    return await instance.patch("/admin/user/" + userId + "/", {
      towers: {
        alias: alias,
        height_shoulders: heightShoulders,
        height_arms: heightArms,
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};
