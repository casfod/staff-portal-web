import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser.ts";
import { baseUrl } from "./baseUrl.ts";
import {
  ExpenseClaimType,
  // PdvanceRequestStats,
  useExpenseClaimType,
  UseExpenseClaimStatsType,
} from "../interfaces.ts";

const url = baseUrl();

const axiosInstance = axios.create({
  baseURL: url,
});

const getToken = () => {
  const localStorageUserX = localStorageUser();
  return localStorageUserX
    ? Cookies.get(`token-${localStorageUserX.id}`) ||
        sessionStorage.getItem(`token-${localStorageUserX.id}`)
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

export const getAllExpenseClaim = async function (queryParams: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const response = await axiosInstance.get<useExpenseClaimType>(
      `/expense-claims`,
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

export const getExpenseClaimStats = async function () {
  try {
    const response = await axiosInstance.get<UseExpenseClaimStatsType>(
      `/expense-claims/stats`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const saveExpenseClaims = async function (
  data: Partial<ExpenseClaimType>
) {
  try {
    const response = await axiosInstance.post<ExpenseClaimType>(
      `/expense-claims/save`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const sendExpenseClaims = async function (
  data: Partial<ExpenseClaimType>,
  files: File[]
) {
  try {
    const formData = new FormData();

    // Send JSON as strings (not blobs)
    formData.append("expenseClaim", JSON.stringify(data.expenseClaim));
    formData.append("expenses", JSON.stringify(data.expenses));

    // Append standard fields
    const simpleFields: (keyof ExpenseClaimType)[] = [
      "expenseReason",
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

    // Send request
    const response = await axiosInstance.post(
      `/expense-claims/save-and-send`,
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

export const updateExpenseClaim = async function (
  requestId: string,
  data: Partial<ExpenseClaimType>,
  files: File[]
) {
  try {
    const formData = new FormData();

    // Append standard fields
    const simpleFields: (keyof ExpenseClaimType)[] = ["approvedBy"];

    simpleFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, String(data[key]));
      }
    });

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.put<Partial<ExpenseClaimType>>(
      `/expense-claims/${requestId}`,
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
    const response = await axiosInstance.patch<Partial<ExpenseClaimType>>(
      `/expense-claims/update-status/${requestId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteExpenseClaim = async function (expenseClaimID: string) {
  try {
    const response = await axiosInstance.delete<ExpenseClaimType>(
      `/expense-claims/${expenseClaimID}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
