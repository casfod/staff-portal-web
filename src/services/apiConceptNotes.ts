import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser.ts";
import { baseUrl } from "./baseUrl.ts";
import {
  ConceptNote,
  UseConceptNoteStatsType,
  UseConceptNoteType,
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
    return err.response?.data;
  } else {
    console.log(err);
  }
};

// API Functions

export const getConceptNotesStats = async function () {
  try {
    const response = await axiosInstance.get<UseConceptNoteStatsType>(
      `/concept-notes/stats`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getAllConceptNotes = async function (queryParams: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const response = await axiosInstance.get<UseConceptNoteType>(
      `/concept-notes`,
      {
        params: queryParams,
      }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getConceptCote = async function (conceptNoteId: string) {
  try {
    const response = await axiosInstance.get<UseConceptNoteType>(
      `/concept-notes/${conceptNoteId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const saveAndSendConceptNote = async function (
  data: Partial<ConceptNote>
) {
  try {
    const response = await axiosInstance.post<UseConceptNoteType>(
      `/concept-notes`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const saveConceptNote = async function (data: Partial<ConceptNote>) {
  try {
    const response = await axiosInstance.post<UseConceptNoteType>(
      `/concept-notes/save`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateConceptNote = async function (
  conceptNoteId: string,
  data: Partial<ConceptNote>
) {
  try {
    const response = await axiosInstance.put<ConceptNote>(
      `/concept-notes/${conceptNoteId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteConceptNote = async function (conceptNoteId: string) {
  try {
    const response = await axiosInstance.delete<ConceptNote>(
      `/concept-notes/${conceptNoteId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
