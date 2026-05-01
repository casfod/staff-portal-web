// frontend/src/services/apiSignature.ts
import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser";
import { baseUrl } from "./baseUrl";

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
  (error) => Promise.reject(error)
);

export interface SignatureType {
  id: string;
  imageUrl: string; // Changed from signatureUrl to match backend
  uploadedAt: string; // Changed from createdAt
  lastUsedAt: string | null;
  signatureType?: "uploaded" | "drawn"; // Optional, for frontend tracking
  settings?: {
    defaultPosition: {
      x: number;
      y: number;
      width: number;
    };
  };
}

export interface UploadSignatureResponse {
  status: number;
  message: string;
  data: SignatureType;
}

/**
 * Upload signature image
 */
export const uploadSignature = async (
  file: File
): Promise<UploadSignatureResponse> => {
  try {
    const formData = new FormData();
    formData.append("signature", file);

    const response = await axiosInstance.post<UploadSignatureResponse>(
      "/signatures/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    return err.response?.data || { status: 500, message: "Upload failed" };
  }
};

/**
 * Upload signature from data URL (for drawn signatures)
 */
export const uploadSignatureFromDataUrl = async (
  dataUrl: string
  // signatureType: "uploaded" | "drawn" = "drawn"
): Promise<UploadSignatureResponse> => {
  try {
    // Convert data URL to Blob
    const blob = await fetch(dataUrl).then((res) => res.blob());
    const file = new File([blob], `signature_${Date.now()}.png`, {
      type: "image/png",
    });

    return uploadSignature(file);
  } catch (err: any) {
    return err.response?.data || { status: 500, message: "Upload failed" };
  }
};

/**
 * Get current user's signature
 */
export const getMySignature = async (): Promise<{
  status: number;
  message: string;
  data: SignatureType | null;
}> => {
  try {
    const response = await axiosInstance.get("/signatures/me");
    return response.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      return { status: 404, message: "No signature found", data: null };
    }
    return (
      err.response?.data || {
        status: 500,
        message: "Failed to fetch signature",
        data: null,
      }
    );
  }
};

/**
 * Delete current user's signature
 */
export const deleteSignature = async (): Promise<{
  status: number;
  message: string;
}> => {
  try {
    const response = await axiosInstance.delete("/signatures/me");
    return response.data;
  } catch (err: any) {
    return err.response?.data || { status: 500, message: "Delete failed" };
  }
};

/**
 * Apply signature to PDF document
 */
export const applySignatureToPdf = async (
  documentUrl: string,
  position?: { x: number; y: number; width: number; page?: number }
): Promise<Blob> => {
  try {
    const response = await axiosInstance.post(
      "/signatures/apply-to-pdf",
      { documentUrl, position },
      { responseType: "blob" }
    );
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to apply signature");
  }
};
