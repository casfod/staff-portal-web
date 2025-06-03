import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser.ts";
import { baseUrl } from "./baseUrl.ts";
import {
  AdvanceRequestType,
  UseAdvanceRequest,
  UseAdvanceRequestType,
  UseAdvanceStatsType,
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
    console.log(err.response?.data);

    return err.response?.data;
  } else {
    console.log(err);
  }
};

// API Functions

export const getAllAdvanceRequest = async function (queryParams: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const response = await axiosInstance.get<UseAdvanceRequestType>(
      `/advance-requests`,
      {
        params: queryParams,
      }
    );
    console.log("API Response:", response.data); // Debugging line
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
export const getAdvanceRequest = async function (requestId: string) {
  try {
    const response = await axiosInstance.get<UseAdvanceRequest>(
      `/advance-requests/${requestId}`
    );
    console.log("API Response:", response.data); // Debugging line
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getAdvanceRequestStats = async function () {
  try {
    const response = await axiosInstance.get<UseAdvanceStatsType>(
      `/advance-requests/stats`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
export const saveAdvanceRequests = async function (
  data: Partial<AdvanceRequestType>
) {
  try {
    const response = await axiosInstance.post<AdvanceRequestType>(
      `/advance-requests/save`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const sendAdvanceRequests = async function (
  data: Partial<AdvanceRequestType>,
  files: File[]
) {
  try {
    const formData = new FormData();

    formData.append("itemGroups", JSON.stringify(data.itemGroups));
    formData.append("periodOfActivity", JSON.stringify(data.periodOfActivity));

    // Append standard fields
    const simpleFields: (keyof AdvanceRequestType)[] = [
      "project",
      "accountCode",
      "expenseChargedTo",
      "department",
      "suggestedSupplier",
      "address",
      "finalDeliveryPoint",
      "city",
      "accountNumber",
      "accountName",
      "bankName",
      "activityDescription",
      "reviewedBy",
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

    const response = await axiosInstance.post<AdvanceRequestType>(
      `/advance-requests/save-and-send`,
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

export const updateAdvanceRequest = async function (
  requestId: string,
  data: Partial<AdvanceRequestType>,
  files: File[]
) {
  try {
    const formData = new FormData();

    const simpleFields: (keyof AdvanceRequestType)[] = ["approvedBy"];

    simpleFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, String(data[key]));
      }
    });

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.put<Partial<AdvanceRequestType>>(
      `/advance-requests/${requestId}`,
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

export const updateStatus = async function (
  requestId: string,
  data: { status: string; comment: string }
) {
  try {
    const response = await axiosInstance.patch<Partial<AdvanceRequestType>>(
      `/advance-requests/update-status/${requestId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteAdvanceRequest = async function (advanceRequestID: string) {
  try {
    const response = await axiosInstance.delete<AdvanceRequestType>(
      `/advance-requests/${advanceRequestID}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
