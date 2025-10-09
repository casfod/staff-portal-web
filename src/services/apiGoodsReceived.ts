// apiGoodsReceived.ts - Updated with file upload
import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser";
import { baseUrl } from "./baseUrl";
import {
  CreateGoodsReceivedType,
  GoodsReceivedType,
  UseGoodsReceived,
  UseGoodsReceivedType,
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
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleError = (err: any) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data;
  } else {
    console.log(err);
  }
};

// API Functions
export const getAllGoodsReceived = async function (queryParams: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<UseGoodsReceivedType> {
  try {
    const response = await axiosInstance.get<UseGoodsReceivedType>(
      `/goods-received`,
      {
        params: queryParams,
      }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getGoodsReceived = async function (
  goodsReceivedId: string
): Promise<UseGoodsReceived> {
  try {
    const response = await axiosInstance.get<UseGoodsReceived>(
      `/goods-received/${goodsReceivedId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getGoodsReceivedByPurchaseOrder = async function (
  purchaseOrderId: string
): Promise<UseGoodsReceivedType> {
  try {
    const response = await axiosInstance.get<UseGoodsReceivedType>(
      `/goods-received/purchase-order/${purchaseOrderId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const checkGRNExists = async function (
  purchaseOrderId: string
): Promise<{
  status: number;
  message: string;
  data: { exists: boolean; grn: GoodsReceivedType; isCompleted: boolean };
}> {
  try {
    const response = await axiosInstance.get<{
      status: number;
      message: string;
      data: { exists: boolean; grn: GoodsReceivedType; isCompleted: boolean };
    }>(`/goods-received/check-exists/${purchaseOrderId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const createGoodsReceived = async function (
  data: CreateGoodsReceivedType,
  files: File[] = []
): Promise<UseGoodsReceived> {
  try {
    const formData = new FormData();

    // Append JSON data
    formData.append("purchaseOrder", data.purchaseOrder);
    formData.append("GRNitems", JSON.stringify(data.GRNitems));

    // Append files
    files.forEach((file) => formData.append("files", file));

    const response = await axiosInstance.post<UseGoodsReceived>(
      `/goods-received`,
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

export const updateGoodsReceived = async function (
  goodsReceivedId: string,
  data: Partial<CreateGoodsReceivedType>,
  files: File[] = []
): Promise<UseGoodsReceived> {
  try {
    const formData = new FormData();

    // Append JSON data
    if (data.purchaseOrder) {
      formData.append("purchaseOrder", data.purchaseOrder);
    }
    if (data.GRNitems) {
      formData.append("GRNitems", JSON.stringify(data.GRNitems));
    }

    // Append files
    files.forEach((file) => formData.append("files", file));

    const response = await axiosInstance.put<UseGoodsReceived>(
      `/goods-received/${goodsReceivedId}`,
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

export const addFilesToGoodsReceived = async function (
  goodsReceivedId: string,
  files: File[] = []
): Promise<UseGoodsReceived> {
  try {
    const formData = new FormData();

    // Append files
    files.forEach((file) => formData.append("files", file));

    const response = await axiosInstance.post<UseGoodsReceived>(
      `/goods-received/${goodsReceivedId}/files`,
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

export const deleteGoodsReceived = async function (
  goodsReceivedId: string
): Promise<{ status: string; message: string }> {
  try {
    const response = await axiosInstance.delete<{
      status: string;
      message: string;
    }>(`/goods-received/${goodsReceivedId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
