import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser.ts";
import { baseUrl } from "./baseUrl.ts";

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

export const uploadFile = async function (file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getFileList = async function () {
  try {
    const response = await axiosInstance.get("/files/files");
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteFile = async function (fileId: string) {
  try {
    const response = await axiosInstance.delete(`/files/files/${fileId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
