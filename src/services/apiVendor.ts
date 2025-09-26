import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser";
import { baseUrl } from "./baseUrl";
import {
  CreateVendorType,
  UpdateVendorType,
  UseVendor,
  UseVendorStatsType,
  UseVendorType,
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

// API Functions

export const getVendorsStats = async function (): Promise<UseVendorStatsType> {
  try {
    const response = await axiosInstance.get<UseVendorStatsType>(
      `/vendors/stats`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getAllVendors = async function (queryParams: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<UseVendorType> {
  try {
    const response = await axiosInstance.get<UseVendorType>(`/vendors`, {
      params: queryParams,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getVendor = async function (vendorId: string): Promise<UseVendor> {
  try {
    const response = await axiosInstance.get<UseVendor>(`/vendors/${vendorId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getVendorByCode = async function (
  vendorCode: string
): Promise<UseVendor> {
  try {
    const response = await axiosInstance.get<UseVendor>(
      `/vendors/code/${vendorCode}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const createVendor = async function (
  data: CreateVendorType,
  files: File[] = []
): Promise<UseVendor> {
  try {
    const formData = new FormData();

    // Append all vendor fields
    const vendorFields: (keyof CreateVendorType)[] = [
      "businessName",
      "businessType",
      "address",
      "email",
      "businessPhoneNumber",
      "contactPhoneNumber",
      "categories", // Changed from "category" to "categories"
      "supplierNumber",
      "contactPerson",
      "position",
      "tinNumber",
    ];

    vendorFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        if (key === "categories" && Array.isArray(data[key])) {
          // Append each category individually or as JSON string
          (data[key] as string[]).forEach((category) => {
            formData.append("categories", category);
          });
        } else {
          formData.append(key, String(data[key]));
        }
      }
    });

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.post<UseVendor>(`/vendors`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateVendor = async function (
  vendorId: string,
  data: UpdateVendorType,
  files: File[] = []
): Promise<UseVendor> {
  try {
    const formData = new FormData();

    // Append all vendor fields
    const vendorFields: (keyof UpdateVendorType)[] = [
      "businessName",
      "businessType",
      "address",
      "email",
      "businessPhoneNumber",
      "contactPhoneNumber",
      "categories", // Changed from "category" to "categories"
      "supplierNumber",
      "contactPerson",
      "position",
      "tinNumber",
    ];

    vendorFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        if (key === "categories" && Array.isArray(data[key])) {
          // Append each category individually
          (data[key] as string[]).forEach((category) => {
            formData.append("categories", category);
          });
        } else {
          formData.append(key, String(data[key]));
        }
      }
    });

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.patch<UseVendor>(
      `/vendors/${vendorId}`,
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

export const deleteVendor = async function (
  vendorId: string
): Promise<{ status: string; message: string }> {
  try {
    const response = await axiosInstance.delete<{
      status: string;
      message: string;
    }>(`/vendors/${vendorId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
