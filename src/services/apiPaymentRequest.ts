import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser.ts";
import { baseUrl } from "./baseUrl.ts";
import {
  PaymentRequestType,
  usePaymentRequestType,
  UsePaymentStatsType,
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

export const getAllPaymentRequest = async function (queryParams: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const response = await axiosInstance.get<usePaymentRequestType>(
      `/payment-requests`,
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

export const getPaymentRequestStats = async function () {
  try {
    const response = await axiosInstance.get<UsePaymentStatsType>(
      `/payment-requests/stats`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const savePaymentRequests = async function (
  data: Partial<PaymentRequestType>
) {
  try {
    const response = await axiosInstance.post<PaymentRequestType>(
      `/payment-requests/save`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const sendPaymentRequests = async function (
  data: Partial<PaymentRequestType>,
  files: File[]
) {
  try {
    const formData = new FormData();

    // Append standard fields
    const simpleFields: (keyof PaymentRequestType)[] = [
      "purposeOfExpense",
      "amountInWords",
      "amountInFigure",
      "grantCode",
      "dateOfExpense",
      "specialInstruction",
      "accountNumber",
      "accountName",
      "bankName",
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

    const response = await axiosInstance.post<PaymentRequestType>(
      `/payment-requests/save-and-send`,
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
export const updatePaymentRequest = async function (
  requestId: string,
  data: Partial<PaymentRequestType>,
  files: File[]
) {
  try {
    const formData = new FormData();

    // Append standard fields
    const simpleFields: (keyof PaymentRequestType)[] = ["approvedBy"];

    simpleFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, String(data[key]));
      }
    });

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.put<Partial<PaymentRequestType>>(
      `/payment-requests/${requestId}`,
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
    const response = await axiosInstance.patch<Partial<PaymentRequestType>>(
      `/payment-requests/update-status/${requestId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deletePaymentRequest = async function (paymentRequestID: string) {
  try {
    const response = await axiosInstance.delete<PaymentRequestType>(
      `/payment-requests/${paymentRequestID}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
