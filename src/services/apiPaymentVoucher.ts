// services/apiPaymentVoucher.ts
import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser.ts";
import { baseUrl } from "./baseUrl.ts";
import {
  PaymentVoucherType,
  UsePaymentVoucher,
  usePaymentVoucherType,
  UsePaymentVoucherStatsType,
  PaymentVoucherFormData,
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

// Update getAllPaymentVouchers to match purchase request parameter structure
export const getAllPaymentVouchers = async function (queryParams: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const response = await axiosInstance.get<usePaymentVoucherType>(
      `/payment-vouchers`,
      {
        params: queryParams,
      }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getPaymentVoucher = async function (voucherId: string) {
  try {
    const response = await axiosInstance.get<UsePaymentVoucher>(
      `/payment-vouchers/${voucherId}`
    );
    console.log("API Response:", response.data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getPaymentVoucherStats = async function () {
  try {
    const response = await axiosInstance.get<UsePaymentVoucherStatsType>(
      `/payment-vouchers/stats`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// Add proper error handling and response structure to match purchase request
export const savePaymentVouchers = async function (
  data: Partial<PaymentVoucherFormData>
) {
  try {
    const response = await axiosInstance.post<PaymentVoucherFormData>(
      `/payment-vouchers/save`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const sendPaymentVouchers = async function (
  data: Partial<PaymentVoucherType>,
  files: File[]
) {
  try {
    console.log("PaymentVoucherType:", data);

    const formData = new FormData();

    // Append standard fields
    const simpleFields: (keyof PaymentVoucherFormData)[] = [
      "payingStation",
      "payTo",
      "being",
      "amountInWords",
      "accountCode",
      "projectCode",
      "pvDate",
      "grossAmount",
      "vat",
      "wht",
      "devLevy",
      "otherDeductions",
      "netAmount",
      "chartOfAccountCategories",
      "organisationalChartOfAccount",
      "chartOfAccountCode",
      "project",
      "note",
      "reviewedBy",
    ];

    simpleFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, String(data[key]));
      }
    });

    // Append status if it exists
    if (data.status) {
      formData.append("status", data.status);
    }

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.post<PaymentVoucherType>(
      `/payment-vouchers/save-and-send`,
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

export const copyTo = async function (
  voucherId: string,
  data: { userIds: string[] }
) {
  try {
    const response = await axiosInstance.patch<Partial<PaymentVoucherType>>(
      `/payment-vouchers/copy/${voucherId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updatePaymentVoucher = async function (
  voucherId: string,
  data: Partial<PaymentVoucherType>,
  files: File[]
) {
  try {
    const formData = new FormData();

    // Append standard fields
    const simpleFields: (keyof PaymentVoucherType)[] = ["approvedBy"];

    simpleFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, String(data[key]));
      }
    });

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.put<Partial<PaymentVoucherType>>(
      `/payment-vouchers/${voucherId}`,
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
  voucherId: string,
  data: { status: string; comment: string }
) {
  try {
    const response = await axiosInstance.patch<Partial<PaymentVoucherType>>(
      `/payment-vouchers/update-status/${voucherId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deletePaymentVoucher = async function (voucherID: string) {
  try {
    const response = await axiosInstance.delete<PaymentVoucherType>(
      `/payment-vouchers/${voucherID}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addFilesTosPaymentVoucher = async function (
  paymentVoucherId: string,
  files: File[] = []
): Promise<UsePaymentVoucher> {
  try {
    const formData = new FormData();

    // Append files
    files.forEach((file) => formData.append("files", file));

    const response = await axiosInstance.post<UsePaymentVoucher>(
      `/payment-vouchers/${paymentVoucherId}/files`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
