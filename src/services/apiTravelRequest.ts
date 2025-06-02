import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser.ts";
import { baseUrl } from "./baseUrl.ts";
import {
  TravelRequestType,
  UseTravelRequest,
  // PdvanceRequestStats,
  useTravelRequestType,
  UseTravelStatsType,
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

export const getAllTravelRequest = async function (queryParams: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const response = await axiosInstance.get<useTravelRequestType>(
      `/travel-requests`,
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

export const getTravelRequest = async function (requestId: string) {
  try {
    const response = await axiosInstance.get<UseTravelRequest>(
      `/travel-requests/${requestId}`
    );
    console.log("API Response:", response.data); // Debugging line
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getTravelRequestStats = async function () {
  try {
    const response = await axiosInstance.get<UseTravelStatsType>(
      `/travel-requests/stats`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
export const saveTravelRequests = async function (
  data: Partial<TravelRequestType>
) {
  try {
    const response = await axiosInstance.post<TravelRequestType>(
      `/travel-requests/save`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const sendTravelRequests = async function (
  data: Partial<TravelRequestType>,
  files: File[]
) {
  try {
    const formData = new FormData();

    // Send JSON as strings (not blobs)
    formData.append("travelRequest", JSON.stringify(data.travelRequest));
    formData.append("expenses", JSON.stringify(data.expenses));

    // Append standard fields
    const simpleFields: (keyof TravelRequestType)[] = [
      "travelReason",
      "dayOfDeparture",
      "dayOfReturn",
      "expenseChargedTo",
      "accountCode",
      "budget",
      "amountInWords",
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

    const response = await axiosInstance.post<TravelRequestType>(
      `/travel-requests/save-and-send`,
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

export const updateTravelRequest = async function (
  requestId: string,
  data: Partial<TravelRequestType>,
  files: File[]
) {
  try {
    const formData = new FormData();

    // Append standard fields
    const simpleFields: (keyof TravelRequestType)[] = ["approvedBy"];

    simpleFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, String(data[key]));
      }
    });

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.put<Partial<TravelRequestType>>(
      `/travel-requests/${requestId}`,
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
    const response = await axiosInstance.patch<Partial<TravelRequestType>>(
      `/travel-requests/update-status/${requestId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteTravelRequest = async function (TravelRequestID: string) {
  try {
    const response = await axiosInstance.delete<TravelRequestType>(
      `/travel-requests/${TravelRequestID}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
