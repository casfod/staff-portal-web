// src/services/apiLeave.ts
import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser";
import { baseUrl } from "./baseUrl";
import {
  // LeaveType,
  UseLeave,
  UseLeaveStatsType,
  UseLeaveType,
  UseLeaveBalance,
  LeaveFormData,
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

const handleError = (err: any) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data;
  } else {
    console.log(err);
  }
};

// API Functions

export const getLeaveStats = async function () {
  try {
    const response = await axiosInstance.get<UseLeaveStatsType>(`/leave/stats`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getMyLeaveBalance = async function () {
  try {
    const response = await axiosInstance.get<UseLeaveBalance>(
      `/leave/my-balance`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getUserLeaveBalance = async function (userId: string) {
  try {
    const response = await axiosInstance.get<UseLeaveBalance>(
      `/leave/admin/user-balance/${userId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getAllLeaves = async function (queryParams: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const response = await axiosInstance.get<UseLeaveType>(`/leave`, {
      params: queryParams,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getLeave = async function (leaveId: string) {
  try {
    const response = await axiosInstance.get<UseLeave>(`/leave/${leaveId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const createLeaveApplication = async function (
  data: LeaveFormData,
  files: File[]
) {
  try {
    const formData = new FormData();

    // Append simple fields
    if (data.leaveType) formData.append("leaveType", data.leaveType);
    if (data.reasonForLeave)
      formData.append("reasonForLeave", data.reasonForLeave);
    if (data.contactDuringLeave)
      formData.append("contactDuringLeave", data.contactDuringLeave);
    if (data.reviewedById) formData.append("reviewedBy", data.reviewedById);

    // Append dates
    if (data.startDate) {
      formData.append("startDate", data.startDate);
    }
    if (data.endDate) {
      formData.append("endDate", data.endDate);
    }

    // Append leave cover if exists
    if (data.leaveCover) {
      formData.append("leaveCover", JSON.stringify(data.leaveCover));
    }

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.post<UseLeaveType>(
      `/leave`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const saveLeaveDraft = async function (data: LeaveFormData) {
  try {
    const response = await axiosInstance.post<UseLeaveType>(
      `/leave/save`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateLeaveApplication = async function (
  leaveId: string,
  data: LeaveFormData,
  files: File[]
) {
  try {
    const formData = new FormData();

    if (data.leaveType) formData.append("leaveType", data.leaveType);
    if (data.reasonForLeave)
      formData.append("reasonForLeave", data.reasonForLeave);
    if (data.contactDuringLeave)
      formData.append("contactDuringLeave", data.contactDuringLeave);
    if (data.reviewedById) formData.append("reviewedBy", data.reviewedById);
    if (data.approvedById) formData.append("approvedBy", data.approvedById);

    if (data.startDate) {
      formData.append("startDate", data.startDate);
    }
    if (data.endDate) {
      formData.append("endDate", data.endDate);
    }

    if (data.leaveCover) {
      formData.append("leaveCover", JSON.stringify(data.leaveCover));
    }

    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.put<UseLeaveType>(
      `/leave/${leaveId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateLeaveStatus = async function (
  leaveId: string,
  data: { status: string; comment: string }
) {
  try {
    const response = await axiosInstance.patch<UseLeaveType>(
      `/leave/update-status/${leaveId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const copyLeave = async function (
  leaveId: string,
  data: { userIds: string[] }
) {
  try {
    const response = await axiosInstance.patch<UseLeaveType>(
      `/leave/copy/${leaveId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addComment = async function (
  leaveId: string,
  data: { text: string }
) {
  try {
    const response = await axiosInstance.post(
      `/leave/${leaveId}/comments`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateComment = async function (
  leaveId: string,
  commentId: string,
  data: { text: string }
) {
  try {
    const response = await axiosInstance.put(
      `/leave/${leaveId}/comments/${commentId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteComment = async function (
  leaveId: string,
  commentId: string
) {
  try {
    const response = await axiosInstance.delete(
      `/leave/${leaveId}/comments/${commentId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteLeave = async function (leaveId: string) {
  try {
    const response = await axiosInstance.delete<UseLeaveType>(
      `/leave/${leaveId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
