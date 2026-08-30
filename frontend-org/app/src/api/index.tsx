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
  API_NEWSLETTER_LIST_PAGE_SIZE,
  API_CONSENT_ENTITY_LIST_PAGE_SIZE,
} from "../consts";
import { ContactMessageType, OrderType, RegistrationStatus } from "../enums";

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

export const apiActivityProgramCourseList = async (
  filterProgramTypes: number[] = undefined,
) => {
  try {
    return await instance.get("/activity/program/course/", {
      params: {
        filter_program_types:
          filterProgramTypes && filterProgramTypes.join(","),
      },
    });
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

export const apiOrderList = async (
  page: number = undefined,
  filterTypes: number[] = undefined,
) => {
  try {
    return await instance.get("/order/", {
      params: {
        page_size: API_ORDERS_LIST_PAGE_SIZE,
        page: page,
        filter_types: filterTypes && filterTypes.join(","),
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

export const apiOrderComplete = async (
  orderId: string,
  datePaid: string = undefined,
  transactionId: string = undefined,
  transactionReference: string = undefined,
) => {
  try {
    return await instance.post("/order/" + orderId + "/complete/", {
      date_paid: datePaid,
      transaction: {
        id: transactionId,
        reference: transactionReference,
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiOrderRestart = async (orderId: string) => {
  try {
    return await instance.post("/order/" + orderId + "/restart/");
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
  consentTypes: number[],
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
      towers: {},
      organisation: {},
      consent_types: consentTypes,
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

export const apiEventRegistrationCreate = async (
  userId: string = undefined,
  entityId: string = undefined,
  ownerId: string = undefined,
  eventId: string,
  entityFirstname: string = undefined,
  entityLastname: string = undefined,
  entityEmail: string = undefined,
  entityPhone: string = undefined,
  entityBirthday: string = undefined,
  entityLanguage: string = undefined,
  token: string = undefined,
  status: RegistrationStatus = undefined,
  data: any = undefined,
) => {
  console.log("dataaa", data);
  try {
    return await instance.post("/event/registration/", {
      ...(userId
        ? { user_id: userId }
        : entityId
          ? { entity_id: entityId }
          : {
              entity: {
                firstname: entityFirstname,
                lastname: entityLastname,
                ...(entityEmail ? { email: entityEmail } : {}),
                ...(entityPhone ? { phone: entityPhone } : {}),
                preferred_language: entityLanguage,
                ...(entityBirthday ? { birthday: entityBirthday } : {}),
              },
            }),
      ...(ownerId ? { owner_id: ownerId } : {}),
      event_id: eventId,
      token: token,
      status: status,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiEventRegistrationDelete = async (id: string) => {
  try {
    return await instance.delete("/event/registration/" + id + "/");
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

export const apiActivityProgramCourseRegistrationCreate = async (
  userId: string,
  courseId: string,
) => {
  try {
    return await instance.post("/activity/program/course/registration/", {
      user_id: userId,
      course_id: courseId,
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiActivityProgramCourseRegistrationDelete = async (
  id: string,
) => {
  try {
    return await instance.delete(
      "/activity/program/course/registration/" + id + "/",
    );
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
  consentTypes: number[],
) => {
  try {
    return await instance.post("/user/family/member/", {
      firstname: firstname,
      lastname: lastname,
      birthday: birthday,
      towers: {
        /*
          height_shoulders: height_shoulders,
          height_arms: height_arms,
        */
      },
      organisation: {},
      consent_types: consentTypes,
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
  consentTypes: number[],
) => {
  try {
    return await instance.put("/user/family/member/" + id + "/", {
      firstname: firstname,
      lastname: lastname,
      birthday: birthday,
      towers: {
        /*
          height_shoulders: height_shoulders,
          height_arms: height_arms,
        */
      },
      organisation: {},
      consent_types: consentTypes,
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

export const apiNewsletterList = async (
  page: number = undefined,
  pageSize: number = undefined,
) => {
  try {
    return await instance.get("/notify/newsletter/", {
      params: {
        page_size: pageSize ? pageSize : API_NEWSLETTER_LIST_PAGE_SIZE,
        page: page,
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiConsentEntityList = async (
  page: number = undefined,
  pageSize: number = undefined,
) => {
  try {
    return await instance.get("/consent/entity/", {
      params: {
        page_size: pageSize ? pageSize : API_CONSENT_ENTITY_LIST_PAGE_SIZE,
        page: page,
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiConsentEntityCreate = async (
  firstname: string,
  lastname: string,
  email: string,
  phone: string,
  consents: any[],
) => {
  try {
    return await instance.post("/consent/entity/", {
      entity: email && {
        firstname: firstname,
        lastname: lastname,
        email: email,
        phone: phone,
      },
      consents: consents.map((consent: any) => {
        return {
          type: consent.type,
          newsletter_id: consent.newsletterId,
          is_active: consent.isActive,
        };
      }),
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiOrderMembershipCreate = async (modules: any[]) => {
  try {
    return await instance.post("/order/", {
      cart: { modules: modules },
      type: OrderType.MEMBERSHIP,
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiOrderCourseCreate = async (courseRegistrations: any[]) => {
  try {
    return await instance.post("/order/", {
      cart: { course_registrations: courseRegistrations },
      type: OrderType.COURSE,
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiOrderEventCreate = async (
  eventRegistrations: any[],
  userData: any,
) => {
  try {
    return await instance.post("/order/", {
      cart: { event_registrations: eventRegistrations },
      user: userData,
      type: OrderType.REGISTRATION,
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};
