// src/services/apiVendor.ts
import {
  IVendor,
  IVendorsListResponse,
  IVendorSingleResponse,
  IVendorStatsResponse,
} from '../interfaces';
import apiClient, { handleError, QueryParams } from './apiClient';

// API Functions

export const getVendorsStats = async function (): Promise<IVendorStatsResponse> {
  try {
    const response = await apiClient.get<IVendorStatsResponse>(`/admin/vendors/stats`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getAllVendors = async function (
  queryParams: QueryParams
): Promise<IVendorsListResponse> {
  try {
    const response = await apiClient.get<IVendorsListResponse>(`/admin/vendors`, {
      params: queryParams,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getVendorsByStatus = async function (
  status: string,
  queryParams: QueryParams
): Promise<IVendorsListResponse> {
  try {
    const response = await apiClient.get<IVendorsListResponse>(
      `/admin/vendors`,
      { params: { status, ...queryParams } } // <- spread, don't nest
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getVendorApprovalSummary = async function (): Promise<{
  status: number;
  message: string;
  data: {
    pending: number;
    approved: number;
    rejected: number;
  };
}> {
  try {
    const response = await apiClient.get(`/admin/vendors/approval/summary`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getVendor = async function (vendorId: string): Promise<IVendorSingleResponse> {
  try {
    const response = await apiClient.get<IVendorSingleResponse>(`/admin/vendors/${vendorId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getVendorByCode = async function (vendorCode: string): Promise<IVendorSingleResponse> {
  try {
    const response = await apiClient.get<IVendorSingleResponse>(
      `/admin/vendors/code/${vendorCode}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const createVendor = async function (
  data: Partial<IVendor>
): Promise<IVendorSingleResponse> {
  try {
    const response = await apiClient.post<IVendorSingleResponse>(`/admin/vendors`, data);

    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const createVendorDraft = async function (
  data: Partial<IVendor>
): Promise<IVendorSingleResponse> {
  try {
    const response = await apiClient.post<IVendorSingleResponse>(`/admin/vendors/draft`, data);

    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateVendor = async function (
  vendorId: string,
  data: Partial<IVendor>
): Promise<IVendorSingleResponse> {
  try {
    const response = await apiClient.patch<IVendorSingleResponse>(
      `/admin/vendors/${vendorId}`,
      data
    );

    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateVendorStatus = async function (
  vendorId: string,
  data: { status: string; comment?: string }
): Promise<IVendorSingleResponse> {
  try {
    const response = await apiClient.patch<IVendorSingleResponse>(
      `/admin/vendors/${vendorId}/status`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const exportVendorsToExcel = async function (): Promise<Blob> {
  try {
    const response = await apiClient.get(`/admin/vendors/export`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteVendor = async function (vendorId: string): Promise<IVendorSingleResponse> {
  try {
    const response = await apiClient.delete<IVendorSingleResponse>(`/admin/vendors/${vendorId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
