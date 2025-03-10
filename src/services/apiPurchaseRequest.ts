import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser.ts";
import { baseUrl } from "./baseUrl.ts";
import { PurChaseRequestType, usePurChaseRequestType } from "../interfaces.ts";

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

export const getAllPurchaseRequest = async function (queryParams: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const response = await axiosInstance.get<usePurChaseRequestType>(
      `/purchase-requests`,
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

export const savePurchaseRequests = async function (
  data: Partial<PurChaseRequestType>
) {
  try {
    const response = await axiosInstance.post<PurChaseRequestType>(
      `/purchase-requests/save`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const sendPurchaseRequests = async function (
  data: Partial<PurChaseRequestType>
) {
  try {
    const response = await axiosInstance.post<PurChaseRequestType>(
      `/purchase-requests/save-and-send`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updatePurchaseRequest = async function (data: any) {
  try {
    const response = await axiosInstance.patch<PurChaseRequestType>(
      `/purchase-requests`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deletePurchaseRequest = async function (
  purchaseRequestID: string
) {
  try {
    const response = await axiosInstance.delete<PurChaseRequestType>(
      `/purchase-requests/${purchaseRequestID}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
