// src/services/apiEmploymentInfo.ts
import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser";
import { baseUrl } from "./baseUrl";
import {
  UseEmploymentInfoType,
  UseEmploymentInfoStatusType,
  UseSystemSettingsResponse, // Fixed import
  EmploymentInfoType,
} from "../interfaces";

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
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleError = (err: any) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data;
  } else {
    console.log(err);
    return { status: 500, message: "An unexpected error occurred" };
  }
};

// Get current user's employment info
export const getMyEmploymentInfo = async function () {
  try {
    const response = await axiosInstance.get<UseEmploymentInfoType>(
      `/employment-info/me`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// Update current user's employment info
export const updateMyEmploymentInfo = async function (
  data: Partial<EmploymentInfoType>
) {
  try {
    const response = await axiosInstance.patch<UseEmploymentInfoType>(
      `/employment-info/me`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ADMIN: Get all users employment info status
export const getAllEmploymentInfoStatus = async function () {
  try {
    const response = await axiosInstance.get<UseEmploymentInfoStatusType>(
      `/employment-info/admin/status`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ADMIN: Get global settings
export const getGlobalSettings = async function () {
  try {
    const response = await axiosInstance.get<UseSystemSettingsResponse>( // Fixed type
      `/employment-info/admin/settings`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// SUPER-ADMIN: Toggle global employment info lock
export const toggleGlobalEmploymentInfoUpdate = async function (
  enabled: boolean
) {
  try {
    const response = await axiosInstance.patch<UseSystemSettingsResponse>( // Fixed type
      `/employment-info/admin/toggle-global`,
      { locked: !enabled } // Backend expects 'locked' param
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ADMIN/SUPER-ADMIN: Toggle user-specific employment info lock
export const toggleUserEmploymentInfoUpdate = async function (
  userId: string,
  enabled: boolean
) {
  try {
    const response = await axiosInstance.patch(
      `/employment-info/admin/toggle-user/${userId}`,
      { locked: !enabled } // Backend expects 'locked' param
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// SUPER-ADMIN: Get any user's employment info
export const superAdminGetUserEmploymentInfo = async function (userId: string) {
  try {
    const response = await axiosInstance.get(
      `/employment-info/super-admin/user/${userId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// SUPER-ADMIN: Update any user's employment info
export const superAdminUpdateUserEmploymentInfo = async function (
  userId: string,
  data: Partial<EmploymentInfoType>
) {
  try {
    const response = await axiosInstance.patch(
      `/employment-info/super-admin/user/${userId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
