// apiPurchaseOrder.ts
import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser";
import { baseUrl } from "./baseUrl";
import {
  CreatePurchaseOrderType,
  UpdatePurchaseOrderType,
  UsePurchaseOrder,
  UsePurchaseOrderType,
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

export const getAllPurchaseOrders = async function (queryParams: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<UsePurchaseOrderType> {
  try {
    const response = await axiosInstance.get<UsePurchaseOrderType>(
      `/purchase-orders`,
      {
        params: queryParams,
      }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getPurchaseOrder = async function (
  purchaseOrderId: string
): Promise<UsePurchaseOrder> {
  try {
    const response = await axiosInstance.get<UsePurchaseOrder>(
      `/purchase-orders/${purchaseOrderId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const createPurchaseOrderFromRFQ = async function (
  rfqId: string,
  vendorId: string,
  data: {
    itemGroups: any[];
    approvedBy?: string;
    deadlineDate?: string;
    rfqDate?: string;
    casfodAddressId: string;
    VAT: number;
    deliveryPeriod: string;
    bidValidityPeriod: string;
    guaranteePeriod: string;
  },
  files: File[] = []
): Promise<UsePurchaseOrder> {
  try {
    const formData = new FormData();

    // Append JSON and scalar fields
    formData.append("itemGroups", JSON.stringify(data.itemGroups));
    formData.append("casfodAddressId", data.casfodAddressId);
    formData.append("deliveryPeriod", data.deliveryPeriod);
    formData.append("bidValidityPeriod", data.bidValidityPeriod);
    formData.append("guaranteePeriod", data.guaranteePeriod);
    formData.append("VAT", data.VAT.toString());

    if (data.approvedBy) formData.append("approvedBy", data.approvedBy);
    if (data.deadlineDate) formData.append("deadlineDate", data.deadlineDate);
    if (data.rfqDate) formData.append("rfqDate", data.rfqDate);

    // Append files
    files.forEach((file) => formData.append("files", file));

    const response = await axiosInstance.post<UsePurchaseOrder>(
      `/purchase-orders/create-from-rfq/${rfqId}/${vendorId}`,
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

export const createIndependentPurchaseOrder = async function (
  data: CreatePurchaseOrderType,
  files: File[] = []
): Promise<UsePurchaseOrder> {
  console.log("CreatePurchaseOrderType:", data);

  try {
    const formData = new FormData();

    // Append scalar fields
    formData.append("RFQTitle", data.RFQTitle);
    formData.append("deliveryPeriod", data.deliveryPeriod);
    formData.append("bidValidityPeriod", data.bidValidityPeriod);
    formData.append("guaranteePeriod", data.guaranteePeriod);
    formData.append("casfodAddressId", data.casfodAddressId);
    formData.append("selectedVendor", data.selectedVendor);
    formData.append("VAT", data.VAT.toString());

    if (data.approvedBy) formData.append("approvedBy", String(data.approvedBy));
    if (data.rfqDate) formData.append("rfqDate", data.rfqDate);
    if (data.deadlineDate) formData.append("deadlineDate", data.deadlineDate);

    // Append item groups as JSON
    if (data.itemGroups && Array.isArray(data.itemGroups)) {
      formData.append("itemGroups", JSON.stringify(data.itemGroups));
    }

    // Append copiedTo as multiple values
    if (data.copiedTo && Array.isArray(data.copiedTo)) {
      data.copiedTo.forEach((vendorId) => {
        formData.append("copiedTo", vendorId);
      });
    }

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.post<UsePurchaseOrder>(
      `/purchase-orders/create`,
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

export const updatePurchaseOrder = async function (
  purchaseOrderId: string,
  data: UpdatePurchaseOrderType,
  files: File[] = []
): Promise<UsePurchaseOrder> {
  try {
    const formData = new FormData();

    // Append updated scalar fields if present
    if (data.RFQTitle !== undefined) formData.append("RFQTitle", data.RFQTitle);
    if (data.deliveryPeriod !== undefined)
      formData.append("deliveryPeriod", data.deliveryPeriod);
    if (data.bidValidityPeriod !== undefined)
      formData.append("bidValidityPeriod", data.bidValidityPeriod);
    if (data.guaranteePeriod !== undefined)
      formData.append("guaranteePeriod", data.guaranteePeriod);
    if (data.VAT !== undefined) formData.append("VAT", data.VAT.toString());
    if (data.status !== undefined) formData.append("status", data.status);
    if (data.casfodAddressId !== undefined)
      formData.append("casfodAddressId", data.casfodAddressId);
    if (data.selectedVendor !== undefined)
      formData.append("selectedVendor", String(data.selectedVendor));
    if (data.approvedBy !== undefined)
      formData.append("approvedBy", String(data.approvedBy));
    if (data.rfqDate !== undefined) formData.append("rfqDate", data.rfqDate);
    if (data.deadlineDate !== undefined)
      formData.append("deadlineDate", data.deadlineDate);

    // Append item groups as JSON if present
    if (data.itemGroups && Array.isArray(data.itemGroups)) {
      formData.append("itemGroups", JSON.stringify(data.itemGroups));
    }

    // Append copiedTo as multiple values if present
    if (data.copiedTo && Array.isArray(data.copiedTo)) {
      data.copiedTo.forEach((vendorId) => {
        formData.append("copiedTo", vendorId);
      });
    }

    // Append comment if present
    if (data.comment) {
      formData.append("comment", data.comment);
    }

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.put<UsePurchaseOrder>(
      `/purchase-orders/${purchaseOrderId}`,
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

export const updatePurchaseOrderStatus = async function (
  purchaseOrderId: string,
  status: string,
  comment?: string,
  pdfFile?: File
): Promise<UsePurchaseOrder> {
  try {
    const formData = new FormData();
    formData.append("status", status);

    if (comment) {
      formData.append("comment", comment);
    }

    if (pdfFile) {
      formData.append("pdfFile", pdfFile);
    }

    const response = await axiosInstance.patch<UsePurchaseOrder>(
      `/purchase-orders/update-status/${purchaseOrderId}`,
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

export const deletePurchaseOrder = async function (
  purchaseOrderId: string
): Promise<{ status: string; message: string }> {
  try {
    const response = await axiosInstance.delete<{
      status: string;
      message: string;
    }>(`/purchase-orders/${purchaseOrderId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
