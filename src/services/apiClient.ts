// src/services/apiClient.ts (updated with response types)
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { localStorageUser } from '../utils/localStorageUser.ts';
import { baseUrl } from './baseUrl.ts';

const url = baseUrl();

export const createApiClient = (): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL: url,
  });

  const getToken = () => {
    const currentUser = localStorageUser();
    return currentUser
      ? Cookies.get(`token-${currentUser.id}`) || sessionStorage.getItem(`token-${currentUser.id}`)
      : null;
  };

  axiosInstance.interceptors.request.use(
    config => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.error('No token found, request not authorized');
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  const retryRequest = async (error: AxiosError, retries: number = 0): Promise<AxiosResponse> => {
    if (retries >= MAX_RETRIES) {
      return Promise.reject(error);
    }

    const delay = RETRY_DELAY * Math.pow(2, retries);
    await new Promise(resolve => setTimeout(resolve, delay));

    const config = error.config as AxiosRequestConfig;
    if (!config) {
      return Promise.reject(error);
    }

    return axiosInstance.request(config).catch((err: AxiosError) => retryRequest(err, retries + 1));
  };

  axiosInstance.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      if (error.response && error.response.status === 429) {
        return retryRequest(error);
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

// Error Handler
export const handleError = (err: Error | unknown) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data;
  } else {
    console.log(err);
    return { status: 500, message: 'An unexpected error occurred' };
  }
};

// ============ API RESPONSE TYPES ============

// Standard API response wrapper (matches your ApiListResponse)
export interface ApiListResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  timestamp: string;
  data: T[];
  count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// Alternative response structure used by many services (status + message + data)
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  amount?: number;
}

// Paginated data structure
export interface PaginatedData<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}

// Combined paginated response
export type ApiPaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

// ============ QUERY PARAMETERS ============

// Base query parameters (extends your ApiListResponse pagination)
export interface QueryParams {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  status?: string;
  period?: string;
}

// ============ OPERATION TYPES ============

// Type for status update
export interface StatusUpdateData {
  status: string;
  comment: string;
}

// Type for comment operations
export interface CommentData {
  text: string;
}

// Type for copy operations
export interface CopyToData {
  recipients: string[];
}

// Default export for backward compatibility
const apiClient = createApiClient();
export default apiClient;
