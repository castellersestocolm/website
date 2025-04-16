import axios from "axios";
import i18n from "i18next";
import { getCookie } from "typescript-cookie";
import { API_EVENTS_LIST_PAGE_SIZE } from "../consts";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
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
  height_shoulders: number,
  height_arms: number,
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
        height_shoulders: height_shoulders,
        height_arms: height_arms,
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
  height_shoulders: number,
  height_arms: number,
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
        height_shoulders: height_shoulders,
        height_arms: height_arms,
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
  height_shoulders: number,
  height_arms: number,
  consent_pictures: boolean,
) => {
  try {
    return await instance.post("/user/family/member/", {
      firstname: firstname,
      lastname: lastname,
      birthday: birthday,
      consent_pictures: consent_pictures,
      towers: {
        height_shoulders: height_shoulders,
        height_arms: height_arms,
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
  height_shoulders: number,
  height_arms: number,
  consent_pictures: boolean,
) => {
  try {
    return await instance.put("/user/family/member/" + id + "/", {
      firstname: firstname,
      lastname: lastname,
      birthday: birthday,
      consent_pictures: consent_pictures,
      towers: {
        height_shoulders: height_shoulders,
        height_arms: height_arms,
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

export const apiPaymentList = async () => {
  try {
    return await instance.get("/payment/");
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiEventList = async (
  page: number = undefined,
  token: string = undefined,
) => {
  try {
    return await instance.get("/event/", {
      params: {
        page_size: API_EVENTS_LIST_PAGE_SIZE,
        page: page,
        token: token,
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const apiEventCalendarList = async (month: number, year: number) => {
  try {
    return await instance.get("/event/calendar/", {
      params: { month: month, year: year },
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
) => {
  try {
    return await instance.post("/event/registration/", {
      user_id: userId,
      event_id: eventId,
      token: token,
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
