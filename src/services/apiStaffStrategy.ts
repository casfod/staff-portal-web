import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser";
import { baseUrl } from "./baseUrl";
import {
  StaffStrategyType,
  UseStaffStrategy,
  UseStaffStrategyType,
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

// ========== GET STATS ==========
export const getStaffStrategyStats = async function () {
  try {
    const response = await axiosInstance.get(`/staff-strategy/stats`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== GET ALL ==========
export const getAllStaffStrategies = async function (queryParams: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const response = await axiosInstance.get<UseStaffStrategyType>(
      `/staff-strategy`,
      {
        params: queryParams,
      }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== GET BY ID ==========
export const getStaffStrategy = async function (requestId: string) {
  try {
    const response = await axiosInstance.get<UseStaffStrategy>(
      `/staff-strategy/${requestId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== CREATE AND SUBMIT ==========
export const createStaffStrategy = async function (
  data: Partial<StaffStrategyType>,
  files: File[]
) {
  try {
    const formData = new FormData();

    // Append accountabilityAreas as JSON
    if (data.accountabilityAreas) {
      formData.append(
        "accountabilityAreas",
        JSON.stringify(data.accountabilityAreas)
      );
    }

    // Append standard fields
    const simpleFields: (keyof StaffStrategyType)[] = [
      "staffName",
      "staffId",
      "jobTitle",
      "department",
      "supervisor",
      "supervisorId",
      "period",
      "approvedBy",
    ];

    simpleFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, String(data[key]));
      }
    });

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.post<UseStaffStrategyType>(
      `/staff-strategy`,
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

// ========== SAVE DRAFT ==========
export const saveStaffStrategyDraft = async function (
  data: Partial<StaffStrategyType>
) {
  try {
    const response = await axiosInstance.post<UseStaffStrategyType>(
      `/staff-strategy/save`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== SUBMIT DRAFT ==========
export const submitStaffStrategyDraft = async function (
  strategyId: string,
  files: File[] = []
) {
  try {
    const formData = new FormData();

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.post<UseStaffStrategyType>(
      `/staff-strategy/${strategyId}/submit`,
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

// ========== UPDATE ==========
export const updateStaffStrategy = async function (
  strategyId: string,
  data: Partial<StaffStrategyType>,
  files: File[]
) {
  try {
    const formData = new FormData();

    // Append accountabilityAreas as JSON if present
    if (data.accountabilityAreas) {
      formData.append(
        "accountabilityAreas",
        JSON.stringify(data.accountabilityAreas)
      );
    }

    // Append standard fields
    const simpleFields: (keyof StaffStrategyType)[] = [
      "staffName",
      "staffId",
      "jobTitle",
      "department",
      "supervisor",
      "supervisorId",
      "period",
      "approvedBy",
    ];

    simpleFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, String(data[key]));
      }
    });

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.put<StaffStrategyType>(
      `/staff-strategy/${strategyId}`,
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

// ========== UPDATE STATUS ==========
export const updateStatus = async function (
  requestId: string,
  data: { status: string; comment?: string }
) {
  try {
    // Create a plain object for the request body, not FormData
    // The backend expects JSON for status updates
    const response = await axiosInstance.patch<Partial<StaffStrategyType>>(
      `/staff-strategy/update-status/${requestId}`,
      data // Send as JSON object, not FormData
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== COMMENTS ==========
export const addComment = async function (
  requestId: string,
  data: { text: string }
) {
  try {
    const response = await axiosInstance.post(
      `/staff-strategy/${requestId}/comments`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateComment = async function (
  requestId: string,
  commentId: string,
  data: { text: string }
) {
  try {
    const response = await axiosInstance.put(
      `/staff-strategy/${requestId}/comments/${commentId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteComment = async function (
  requestId: string,
  commentId: string
) {
  try {
    const response = await axiosInstance.delete(
      `/staff-strategy/${requestId}/comments/${commentId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== DELETE ==========
export const deleteStaffStrategy = async function (strategyId: string) {
  try {
    const response = await axiosInstance.delete<StaffStrategyType>(
      `/staff-strategy/${strategyId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
