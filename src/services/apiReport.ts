import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser.ts";
import { baseUrl } from "./baseUrl.ts";
import {
  ReportType,
  UseReport,
  UseReportType,
  UseReportStatsType,
} from "../interfaces.ts";

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
  (error) => Promise.reject(error)
);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const retryRequest = async (error: any, retries: number = 0): Promise<any> => {
  if (retries >= MAX_RETRIES) return Promise.reject(error);
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
    console.log(err.response?.data);
    return err.response?.data;
  } else {
    console.log(err);
  }
};

// API Functions

export const getAllReports = async function (queryParams: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const response = await axiosInstance.get<UseReportType>(`/reports`, {
      params: queryParams,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getReport = async function (reportId: string) {
  try {
    const response = await axiosInstance.get<UseReport>(`/reports/${reportId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getReportStats = async function () {
  try {
    const response = await axiosInstance.get<UseReportStatsType>(
      `/reports/stats`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const saveReport = async function (data: Partial<ReportType>) {
  try {
    const response = await axiosInstance.post<ReportType>(
      `/reports/save`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const sendReport = async function (
  data: Partial<ReportType>,
  files: File[]
) {
  try {
    const formData = new FormData();

    const simpleFields: (keyof ReportType)[] = [
      "activityType",
      "reportType",
      "reportTitle",
      "project",
      "reviewedBy",
    ];

    simpleFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, String(data[key]));
      }
    });

    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.post<ReportType>(
      `/reports/save-and-send`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateReport = async function (
  reportId: string,
  data: Partial<ReportType>,
  files: File[]
) {
  try {
    const formData = new FormData();

    const simpleFields: (keyof ReportType)[] = ["approvedBy"];

    simpleFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, String(data[key]));
      }
    });

    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.put<Partial<ReportType>>(
      `/reports/${reportId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateReportStatus = async function (
  reportId: string,
  data: { status: string; comment: string }
) {
  try {
    const response = await axiosInstance.patch<Partial<ReportType>>(
      `/reports/update-status/${reportId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const copyReportTo = async function (
  reportId: string,
  data: { userIds: string[] }
) {
  try {
    const response = await axiosInstance.patch<Partial<ReportType>>(
      `/reports/copy/${reportId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addReportComment = async function (
  reportId: string,
  data: { text: string }
) {
  try {
    const response = await axiosInstance.post(
      `/reports/${reportId}/comments`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateReportComment = async function (
  reportId: string,
  commentId: string,
  data: { text: string }
) {
  try {
    const response = await axiosInstance.put(
      `/reports/${reportId}/comments/${commentId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteReportComment = async function (
  reportId: string,
  commentId: string
) {
  try {
    const response = await axiosInstance.delete(
      `/reports/${reportId}/comments/${commentId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteReport = async function (reportId: string) {
  try {
    const response = await axiosInstance.delete<ReportType>(
      `/reports/${reportId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
