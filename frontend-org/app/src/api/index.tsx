import axios from "axios";
import i18n from "i18next";
import { getCookie } from "typescript-cookie";
import {
  API_EVENTS_LIST_PAGE_SIZE,
  API_EXPENSES_LIST_PAGE_SIZE,
  API_ORDERS_LIST_PAGE_SIZE,
  API_PAYMENTS_LIST_PAGE_SIZE,
  API_REGISTRATIONS_LIST_PAGE_SIZE,
  API_PROGRAM_COURSE_REGISTRATIONS_LIST_PAGE_SIZE,
  API_LEGAL_GROUP_LIST_PAGE_SIZE,
  API_DOCUMENTS_LIST_PAGE_SIZE,
} from "../consts";
import { ContactMessageType } from "../enums";

const API_BASE_URL = process.env.REACT_APP_ORG_API_URL;

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

export const apiUserUpdate = async (
  id: string,
  firstname: string,
  lastname: string,
  phone: string,
  birthday: string,
  consent_pictures: boolean,
  preferred_language: string,
) => {
  try {
    return await instance.patch("/user/" + id + "/", {
      firstname: firstname,
      lastname: lastname,
      phone: phone,
      birthday: birthday,
      consent_pictures: consent_pictures,
      preferred_language: preferred_language,
      towers: {},
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

export const apiActivityProgramCourseRegistrationList = async (
  page: number = undefined,
  pageSize: number = undefined,
) => {
  try {
    return await instance.get("/activity/program/course/registration/", {
      params: {
        page_size: pageSize
          ? pageSize
          : API_PROGRAM_COURSE_REGISTRATIONS_LIST_PAGE_SIZE,
        page: page,
      },
    });
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

export const apiLegalGroupList = async (page: number = undefined) => {
  try {
    return await instance.get("/legal/group/", {
      params: {
        page_size: API_LEGAL_GROUP_LIST_PAGE_SIZE,
        page: page,
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiContactMessageCreate = async (
  entity: { firstname: string; lastname: string; email: string },
  type: ContactMessageType,
  message: string,
) => {
  try {
    return await instance.post("/contact/message/", {
      entity: entity,
      type: type,
      message: message,
    });
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

export const apiDocumentList = async (
  page: number = undefined,
  pageSize: number = undefined,
  filterTypes: number[] = undefined,
  orderBy: string[] = undefined,
) => {
  try {
    return await instance.get("/document/", {
      params: {
        page_size: pageSize ? pageSize : API_DOCUMENTS_LIST_PAGE_SIZE,
        page: page,
        filter_types: filterTypes && filterTypes.join(","),
        order_by: orderBy && orderBy.join(","),
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};
