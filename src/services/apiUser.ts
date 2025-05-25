import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser.ts";
import { baseUrl } from "./baseUrl.ts";
import { useAdminsType, UserType, useUsersType } from "../interfaces.ts";

const url = baseUrl();

const axiosInstance = axios.create({
  baseURL: url,
});

const getToken = () => {
  const currentUser = localStorageUser();
  return currentUser
    ? Cookies.get(`token-${currentUser.id}`) ||
        sessionStorage.getItem(`token-${currentUser.id}`)
    : null;
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log("Token attached to request:", token);
    } else {
      console.error("No token found, request not authorized");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const retryRequest = async (error: any, retries: number = 0): Promise<any> => {
  if (retries >= MAX_RETRIES) {
    return Promise.reject(error);
  }

  const delay = RETRY_DELAY * Math.pow(2, retries);
  await new Promise((resolve) => setTimeout(resolve, delay));

  return axiosInstance
    .request(error.config)
    .catch((err) => retryRequest(err, retries + 1));
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 429) {
      return retryRequest(error);
    }
    return Promise.reject(error);
  }
);

// Error Handler
const handleError = (err: any) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data;
  } else {
    console.log(err);
  }
};

// API Functions

export const getAdmins = async function () {
  try {
    const response = await axiosInstance.get<useAdminsType>(`/users/admins`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
export const getReviewers = async function () {
  try {
    const response = await axiosInstance.get<useAdminsType>(`/users/reviewers`);

    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getUsers = async function (queryParams: {
  search?: string;
  role?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const response = await axiosInstance.get<useUsersType>(`/users`, {
      params: queryParams,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateUser = async function (data: UserType) {
  try {
    const response = await axiosInstance.patch<UserType>(
      `/users/updateMe`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateUserAdmin = async function (
  userId: string,
  data: Partial<UserType>
) {
  try {
    const response = await axiosInstance.patch<UserType>(
      `/users/updateUserAdmin/${userId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
export const addUser = async function (data: Partial<UserType>) {
  try {
    const response = await axiosInstance.post<UserType>(`/users/addUser`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updatePassword = async function (data: any) {
  try {
    const response = await axiosInstance.patch<UserType>(
      `/users/updatePassword`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteUser = async function (userId: string) {
  try {
    const response = await axiosInstance.delete<UserType>(
      `/users/deleteUser/${userId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
