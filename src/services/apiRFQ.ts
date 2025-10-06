import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser";
import { baseUrl } from "./baseUrl";
import {
  CreateRFQType,
  UpdateRFQType,
  UseRFQ,
  UseRFQStatsType,
  UseRFQType,
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

export const getRFQsStats = async function (): Promise<UseRFQStatsType> {
  try {
    const response = await axiosInstance.get<UseRFQStatsType>(`/rfqs/stats`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getAllRFQs = async function (queryParams: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<UseRFQType> {
  try {
    const response = await axiosInstance.get<UseRFQType>(`/rfqs`, {
      params: queryParams,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getRFQ = async function (rfqId: string): Promise<UseRFQ> {
  try {
    const response = await axiosInstance.get<UseRFQ>(`/rfqs/${rfqId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getRFQByCode = async function (rfqCode: string): Promise<UseRFQ> {
  try {
    const response = await axiosInstance.get<UseRFQ>(`/rfqs/code/${rfqCode}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const createRFQ = async function (
  data: CreateRFQType,
  files: File[] = []
): Promise<UseRFQ> {
  try {
    const formData = new FormData();

    // Append all RFQ fields
    const rfqFields: (keyof CreateRFQType)[] = [
      "RFQTitle",
      "casfodAddressId",
      "deadlineDate",
      "rfqDate",
      "itemGroups",
      "copiedTo",
    ];

    rfqFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        if (key === "itemGroups" && Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]));
        } else if (key === "copiedTo" && Array.isArray(data[key])) {
          data[key].forEach((vendorId: string) => {
            formData.append("copiedTo", vendorId);
          });
        } else {
          formData.append(key as string, String(data[key]));
        }
      }
    });

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.post<UseRFQ>(`/rfqs/save`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const createAndSendRFQ = async function (
  data: CreateRFQType,
  files: File[] = []
): Promise<UseRFQ> {
  try {
    const formData = new FormData();
    // Append all RFQ fields
    const rfqFields: (keyof CreateRFQType)[] = [
      "RFQTitle",
      "casfodAddressId",
      "deadlineDate",
      "rfqDate",
      "itemGroups",
      "copiedTo",
    ];

    rfqFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        if (key === "itemGroups" && Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]));
        } else if (key === "copiedTo" && Array.isArray(data[key])) {
          data[key].forEach((vendorId: string) => {
            formData.append("copiedTo", vendorId);
          });
        } else {
          formData.append(key as string, String(data[key]));
        }
      }
    });

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.post<UseRFQ>(
      `/rfqs/save-to-send`,
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

export const updateRFQ = async function (
  rfqId: string,
  data: UpdateRFQType,
  files: File[] = []
): Promise<UseRFQ> {
  try {
    const formData = new FormData();

    // Append all RFQ fields
    const rfqFields: (keyof UpdateRFQType)[] = [
      "RFQTitle",
      "casfodAddressId",
      "deadlineDate",
      "rfqDate",
      "itemGroups",
      "copiedTo",
    ];

    rfqFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        if (key === "itemGroups" && Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]));
        } else if (key === "copiedTo" && Array.isArray(data[key])) {
          data[key].forEach((vendorId: string) => {
            formData.append("copiedTo", vendorId);
          });
        } else {
          formData.append(key as string, String(data[key]));
        }
      }
    });

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.put<UseRFQ>(
      `/rfqs/${rfqId}`,
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

export const updateRFQStatus = async function (
  rfqId: string,
  status: string
): Promise<UseRFQ> {
  try {
    const response = await axiosInstance.patch<UseRFQ>(
      `/rfqs/update-status/${rfqId}`,
      { status }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// Update copyRFQToVendors function in apiRFQ.ts
export const copyRFQToVendors = async function (
  rfqId: string,
  vendorIds: string[],
  file?: File
): Promise<UseRFQ> {
  try {
    console.log("RFQ Data:", {
      rfqId,
      vendorIds,
      vendorIdsType: typeof vendorIds,
      vendorIdsLength: vendorIds?.length,
      file,
    });

    const formData = new FormData();

    // Append vendor IDs - try different formats to see what works
    if (vendorIds && Array.isArray(vendorIds)) {
      vendorIds.forEach((vendorId, index) => {
        console.log(`Appending vendorId[${index}]:`, vendorId);
        // Try both formats
        formData.append("vendorIds", vendorId); // Standard format
        formData.append("vendorIds[]", vendorId); // Array format
      });
    } else {
      throw new Error("vendorIds must be an array");
    }

    // Append PDF file if provided
    if (file) {
      console.log("Appending file:", file.name, file.type);
      formData.append("files", file);
    }

    // Log FormData contents for debugging
    console.log("FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await axiosInstance.patch<UseRFQ>(
      `/rfqs/copy/${rfqId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error in copyRFQToVendors:", err);
    return handleError(err);
  }
};

export const exportRFQsToExcel = async function (): Promise<Blob> {
  try {
    const response = await axiosInstance.get(`/rfqs/export/excel`, {
      responseType: "blob",
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteRFQ = async function (
  rfqId: string
): Promise<{ status: string; message: string }> {
  try {
    const response = await axiosInstance.delete<{
      status: string;
      message: string;
    }>(`/rfqs/${rfqId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
